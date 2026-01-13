const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const AUTHORIZED_IDS = process.env.AUTHORIZED_IDS ? process.env.AUTHORIZED_IDS.split(',') : ['Water2026', 'Earth1919', 'Fire1123'];
const JWT_SECRET = process.env.JWT_SECRET || 'visualize_default_secret_123';

router.post('/login', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    // Case-insensitive check
    const normalizedId = id.trim();
    const isAuthorized = AUTHORIZED_IDS.some(aid => aid.toUpperCase() === normalizedId.toUpperCase());

    if (isAuthorized) {
        // Sign token with 7-day expiration
        const token = jwt.sign({ userId: normalizedId }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, user: normalizedId, token });
    } else {
        res.status(401).json({ error: 'Unauthorized ID' });
    }
});

module.exports = router;
