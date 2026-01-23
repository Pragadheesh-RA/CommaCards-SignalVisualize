const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Constants
const DATA_FILE = path.join(__dirname, '../data/authorized_ids.json');
const JWT_SECRET = process.env.JWT_SECRET || 'visualize_default_secret_123';
const ADMIN_CREDENTIALS = {
    username: 'santhosh',
    password: 'CommaCardsVisualize'
};

// Helper to read IDs
const getAuthorizedIds = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Create default if missing
            const defaults = ['Water2026', 'Earth1919', 'Fire1123'];
            fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
            fs.writeFileSync(DATA_FILE, JSON.stringify(defaults, null, 2));
            return defaults;
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading ID file:", err);
        return [];
    }
};

// Helper to write IDs
const saveAuthorizedIds = (ids) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(ids, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing ID file:", err);
        return false;
    }
};

// --- Researcher Login ---
router.post('/login', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    const normalizedId = id.trim();
    const authorizedIds = getAuthorizedIds();
    const isAuthorized = authorizedIds.some(aid => aid.toUpperCase() === normalizedId.toUpperCase());

    if (isAuthorized) {
        const token = jwt.sign({ userId: normalizedId, role: 'researcher' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, user: normalizedId, role: 'researcher', token });
    } else {
        res.status(401).json({ error: 'Unauthorized ID' });
    }
});

// --- Admin Login ---
router.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const token = jwt.sign({ userId: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token, role: 'admin' });
    } else {
        res.status(401).json({ error: 'Invalid Admin Credentials' });
    }
});

// --- Admin: Get IDs ---
router.get('/admin/ids', (req, res) => {
    // Simple verification (in production use middleware)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') throw new Error('Not admin');
        res.json({ ids: getAuthorizedIds() });
    } catch (e) {
        res.status(403).json({ error: 'Forbidden' });
    }
});

// --- Admin: Add ID ---
router.post('/admin/ids', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') throw new Error('Not admin');

        const { newId } = req.body;
        if (!newId || newId.length < 3) return res.status(400).json({ error: 'Invalid ID format' });

        const ids = getAuthorizedIds();
        if (ids.some(id => id.toUpperCase() === newId.toUpperCase())) {
            return res.status(409).json({ error: 'ID already exists' });
        }

        ids.push(newId);
        saveAuthorizedIds(ids);
        res.json({ success: true, ids });
    } catch (e) {
        res.status(403).json({ error: 'Forbidden' });
    }
});

// --- Admin: Remove ID ---
router.delete('/admin/ids/:id', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') throw new Error('Not admin');

        const targetId = req.params.id;
        let ids = getAuthorizedIds();
        const initialLen = ids.length;
        ids = ids.filter(id => id !== targetId);

        if (ids.length === initialLen) return res.status(404).json({ error: 'ID not found' });

        saveAuthorizedIds(ids);
        res.json({ success: true, ids });
    } catch (e) {
        res.status(403).json({ error: 'Forbidden' });
    }
});

module.exports = router;
