const express = require('express');
const router = express.Router();

const AUTHORIZED_IDS = ['Water2026', 'Earth1919', 'Fire1123'];

router.post('/login', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    // Case-insensitive check
    const normalizedId = id.trim();
    const isAuthorized = AUTHORIZED_IDS.some(aid => aid.toUpperCase() === normalizedId.toUpperCase());

    if (isAuthorized) {
        res.json({ success: true, user: id });
    } else {
        res.status(401).json({ error: 'Unauthorized ID' });
    }
});

module.exports = router;
