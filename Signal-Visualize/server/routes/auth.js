const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { connectDb } = require('../utils/db');

// Constants
const IS_VERCEL = process.env.VERCEL || process.env.NODE_ENV === 'production';
const DATA_FILE = IS_VERCEL
    ? path.join('/tmp', 'authorized_ids.json')
    : path.join(__dirname, '../data/authorized_ids.json');

const JWT_SECRET = process.env.JWT_SECRET || 'visualize_default_secret_123';
const ROOT_ADMIN = {
    username: 'santhosh',
    password: 'CommaCardsVisualize'
};

// Helper: Read & Auto-Migrate (Fallback structure)
const getAuthorizedUsersLocal = () => {
    try {
        const BUNDLED_FILE = path.join(__dirname, '../data/authorized_ids.json');

        if (!fs.existsSync(DATA_FILE)) {
            if (fs.existsSync(BUNDLED_FILE)) {
                const data = fs.readFileSync(BUNDLED_FILE, 'utf8');
                if (IS_VERCEL) {
                    const dir = path.dirname(DATA_FILE);
                    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                    fs.writeFileSync(DATA_FILE, data);
                }
                return JSON.parse(data).map(u => typeof u === 'string' ? { username: u, role: 'researcher' } : u);
            }
            return [];
        }

        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        let data = JSON.parse(rawData);
        return data.map(item => typeof item === 'string' ? { username: item, role: 'researcher' } : item);
    } catch (err) {
        console.error("Local read error:", err);
        return [];
    }
};

const saveAuthorizedUsersLocal = (users) => {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (err) {
        console.error("Local save error:", err);
        return false;
    }
};

// --- Login Handler (Unified Researcher) ---
router.post('/login', async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const normalizedId = id.trim();
    let user = null;

    if (await connectDb()) {
        user = await User.findOne({ username: { $regex: new RegExp(`^${normalizedId}$`, 'i') } });
    }

    // Fallback if not in MongoDB
    if (!user) {
        const users = getAuthorizedUsersLocal();
        user = users.find(u => u.username.toUpperCase() === normalizedId.toUpperCase());
    }

    if (user && user.role === 'researcher') {
        const token = jwt.sign({ userId: user.username, role: 'researcher' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, user: user.username, role: 'researcher', token });
    } else {
        res.status(401).json({ error: 'Unauthorized Researcher ID' });
    }
});

// --- Admin Login ---
router.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. Check Root Admin
    if (username === ROOT_ADMIN.username && password === ROOT_ADMIN.password) {
        // Important: Return 'root' role
        const token = jwt.sign({ userId: 'root', role: 'root' }, JWT_SECRET, { expiresIn: '8h' });
        return res.json({ success: true, token, role: 'root' });
    }

    // 2. Check Co-Admins
    let adminUser = null;
    if (await connectDb()) {
        adminUser = await User.findOne({
            username: { $regex: new RegExp(`^${username}$`, 'i') },
            role: 'admin',
            password
        });
    }

    if (!adminUser) {
        const users = getAuthorizedUsersLocal();
        adminUser = users.find(u =>
            u.role === 'admin' &&
            u.username.toUpperCase() === username.toUpperCase() &&
            u.password === password
        );
    }

    if (adminUser) {
        const token = jwt.sign({ userId: adminUser.username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ success: true, token, role: 'admin' });
    } else {
        res.status(401).json({ error: 'Invalid Credentials' });
    }
});

// --- Middleware: Verify Admin ---
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'admin' || decoded.role === 'root') {
            req.adminToken = decoded;
            next();
        } else {
            res.status(403).json({ error: 'Admin access required' });
        }
    } catch (e) {
        res.status(401).json({ error: 'Invalid or expired session' });
    }
};

// --- Admin: Get Users ---
router.get('/admin/ids', verifyAdmin, async (req, res) => {
    let users = [];
    if (await connectDb()) {
        users = await User.find({}).sort({ createdAt: -1 });
    } else {
        users = getAuthorizedUsersLocal();
    }
    res.json({ ids: users });
});

// --- Admin: Add User ---
router.post('/admin/ids', verifyAdmin, async (req, res) => {
    const { username, role, password } = req.body;
    const decoded = req.adminToken;

    if (!username || username.length < 3) return res.status(400).json({ error: 'Invalid Username' });

    // RBAC: Only Root can create Admins
    if (role === 'admin' && decoded.role !== 'root') {
        return res.status(403).json({ error: 'Permission Denied: Only Root Admin can create Co-Admins' });
    }

    if (await connectDb()) {
        const exists = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        if (exists) return res.status(409).json({ error: 'User already exists' });

        const newUser = new User({
            username: username.trim(),
            role: role || 'researcher',
            password: role === 'admin' ? password : null
        });
        await newUser.save();

        const allUsers = await User.find({}).sort({ createdAt: -1 });
        return res.json({ success: true, ids: allUsers });
    } else {
        // Fallback to local file if DB down
        let users = getAuthorizedUsersLocal();
        if (users.some(u => u.username.toUpperCase() === username.toUpperCase())) {
            return res.status(409).json({ error: 'User already exists' });
        }
        users.push({ username, role, password });
        saveAuthorizedUsersLocal(users);
        res.json({ success: true, ids: users });
    }
});

// --- Admin: Update User ---
router.put('/admin/ids/:username', verifyAdmin, async (req, res) => {
    const targetUsername = req.params.username;
    const { newPassword, newRole } = req.body;
    const decoded = req.adminToken;

    if (targetUsername.toLowerCase() === ROOT_ADMIN.username.toLowerCase()) {
        return res.status(403).json({ error: 'Cannot modify Root Admin via API' });
    }

    if (await connectDb()) {
        const target = await User.findOne({ username: { $regex: new RegExp(`^${targetUsername}$`, 'i') } });
        if (!target) return res.status(404).json({ error: 'User not found' });

        // RBAC: Only root can change roles to/from admin
        if (decoded.role !== 'root' && (newRole === 'admin' || target.role === 'admin')) {
            return res.status(403).json({ error: 'Permission Denied: Only root can modify Admins' });
        }

        if (newPassword) target.password = newPassword;
        if (newRole) target.role = newRole;

        await target.save();
        const allUsers = await User.find({}).sort({ createdAt: -1 });
        res.json({ success: true, ids: allUsers });
    } else {
        // Fallback Update
        let users = getAuthorizedUsersLocal();
        const index = users.findIndex(u => u.username.toUpperCase() === targetUsername.toUpperCase());

        if (index === -1) return res.status(404).json({ error: 'User not found' });

        // RBAC: Only root can change roles to/from admin
        if (decoded.role !== 'root' && (newRole === 'admin' || users[index].role === 'admin')) {
            return res.status(403).json({ error: 'Permission Denied: Only root can modify Admins' });
        }

        if (newPassword) users[index].password = newPassword;
        if (newRole) users[index].role = newRole;

        saveAuthorizedUsersLocal(users);
        res.json({ success: true, ids: users });
    }
});

// --- Admin: Remove User ---
router.delete('/admin/ids/:username', verifyAdmin, async (req, res) => {
    const targetUser = req.params.username;
    const decoded = req.adminToken;

    if (targetUser.toLowerCase() === ROOT_ADMIN.username.toLowerCase()) {
        return res.status(403).json({ error: 'Cannot delete Root Admin' });
    }

    if (await connectDb()) {
        const target = await User.findOne({ username: { $regex: new RegExp(`^${targetUser}$`, 'i') } });
        if (!target) return res.status(404).json({ error: 'User not found' });

        // RBAC Check
        if (decoded.role !== 'root' && target.role === 'admin') {
            return res.status(403).json({ error: 'Permission Denied: Cannot delete Co-Admin' });
        }

        await User.deleteOne({ _id: target._id });
        const allUsers = await User.find({}).sort({ createdAt: -1 });
        res.json({ success: true, ids: allUsers });
    } else {
        let users = getAuthorizedUsersLocal();
        const initialLen = users.length;
        users = users.filter(u => u.username.toLowerCase() !== targetUser.toLowerCase());

        if (users.length === initialLen) return res.status(404).json({ error: 'User not found' });

        saveAuthorizedUsersLocal(users);
        res.json({ success: true, ids: users });
    }
});

module.exports = router;

