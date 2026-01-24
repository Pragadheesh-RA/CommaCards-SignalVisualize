const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Constants
const DATA_FILE = path.join(__dirname, '../data/authorized_ids.json');
const JWT_SECRET = process.env.JWT_SECRET || 'visualize_default_secret_123';
const ROOT_ADMIN = {
    username: 'santhosh',
    password: 'CommaCardsVisualize'
};

// Helper: Read & Auto-Migrate
const getAuthorizedUsers = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const defaults = [
                { username: 'Water2026', role: 'researcher' },
                { username: 'Earth1919', role: 'researcher' },
                { username: 'Fire1123', role: 'researcher' }
            ];
            fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
            fs.writeFileSync(DATA_FILE, JSON.stringify(defaults, null, 2));
            return defaults;
        }

        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        let data = JSON.parse(rawData);

        // Migration: Convert strings to objects if necessary
        let hasChanges = false;
        data = data.map(item => {
            if (typeof item === 'string') {
                hasChanges = true;
                return { username: item, role: 'researcher' }; // Default to researcher
            }
            return item;
        });

        if (hasChanges) {
            saveAuthorizedUsers(data);
        }
        return data;
    } catch (err) {
        console.error("Error reading ID file:", err);
        return [];
    }
};

// Helper: Write
const saveAuthorizedUsers = (users) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing ID file:", err);
        return false;
    }
};

// --- Login Handler (Unified) ---
router.post('/login', (req, res) => {
    const { id } = req.body;
    // Treating 'id' as 'username' for researchers
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const normalizedId = id.trim();
    const users = getAuthorizedUsers();

    // Find user (Case-insensitive)
    const user = users.find(u => u.username.toUpperCase() === normalizedId.toUpperCase());

    if (user && user.role === 'researcher') {
        const token = jwt.sign({ userId: user.username, role: 'researcher' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, user: user.username, role: 'researcher', token });
    } else {
        res.status(401).json({ error: 'Unauthorized Researcher ID' });
    }
});

// --- Admin Login ---
router.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    // 1. Check Root Admin
    if (username === ROOT_ADMIN.username && password === ROOT_ADMIN.password) {
        const token = jwt.sign({ userId: 'root', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ success: true, token, role: 'admin' });
    }

    // 2. Check Co-Admins from File
    const users = getAuthorizedUsers();
    const adminUser = users.find(u =>
        u.role === 'admin' &&
        u.username === username &&
        u.password === password
    );

    if (adminUser) {
        const token = jwt.sign({ userId: adminUser.username, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token, role: 'admin' });
    } else {
        res.status(401).json({ error: 'Invalid Credentials' });
    }
});

// --- Admin: Get Users ---
router.get('/admin/ids', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        jwt.verify(token, JWT_SECRET);
        const users = getAuthorizedUsers();
        res.json({ ids: users });
    } catch (e) {
        res.status(403).json({ error: 'Forbidden' });
    }
});

// --- Admin: Add User ---
router.post('/admin/ids', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        jwt.verify(token, JWT_SECRET);

        // Frontend sends: { username, role, password? }
        // Previous (Legacy) frontend might send: { newId }
        const body = req.body;
        const username = body.username || body.newId;
        const role = body.role || 'researcher';
        const password = body.password || null;

        if (!username || username.length < 3) return res.status(400).json({ error: 'Invalid Username' });

        const users = getAuthorizedUsers();
        if (users.some(u => u.username.toUpperCase() === username.toUpperCase())) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const newUser = {
            username,
            role,
            ...(role === 'admin' && { password: password || 'default123' }) // Store password only for admins
        };

        users.push(newUser);
        saveAuthorizedUsers(users);
        res.json({ success: true, ids: users });
    } catch (e) {
        res.status(403).json({ error: 'Forbidden' });
    }
});

// --- Admin: Remove User ---
router.delete('/admin/ids/:username', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        jwt.verify(token, JWT_SECRET);

        const targetUser = req.params.username;
        if (targetUser === ROOT_ADMIN.username) return res.status(403).json({ error: 'Cannot delete Root Admin' });

        let users = getAuthorizedUsers();
        const initialLen = users.length;
        users = users.filter(u => u.username !== targetUser);

        if (users.length === initialLen) return res.status(404).json({ error: 'User not found' });

        saveAuthorizedUsers(users);
        res.json({ success: true, ids: users });
    } catch (e) {
        res.status(403).json({ error: 'Forbidden' });
    }
});

module.exports = router;
