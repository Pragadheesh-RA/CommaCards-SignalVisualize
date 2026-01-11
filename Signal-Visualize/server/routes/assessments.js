const express = require('express');
const router = express.Router();
const { readDb, writeDb } = require('../utils/db');

// Get all assessments
router.get('/', (req, res) => {
    const data = readDb();
    res.json(data);
});

// Upload/Overwrite assessments (from JSON export)
router.post('/upload', (req, res) => {
    const data = req.body;
    if (!Array.isArray(data)) {
        return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
    }
    writeDb(data);
    res.json({ success: true, count: data.length });
});

// Update annotations for a specific participant
router.patch('/:id/annotations', (req, res) => {
    const { id } = req.params;
    const newAnnotations = req.body;

    const db = readDb();
    const index = db.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Assessment not found' });
    }

    db[index].annotations = {
        ...(db[index].annotations || {}),
        ...newAnnotations
    };

    writeDb(db);
    res.json({ success: true, annotations: db[index].annotations });
});

// Delete a specific assessment
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    let db = readDb();
    const index = db.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Assessment not found' });
    }

    db.splice(index, 1);
    writeDb(db);
    res.json({ success: true, message: 'Assessment deleted' });
});

// Clear all assessments
router.delete('/', (req, res) => {
    writeDb([]);
    res.json({ success: true, message: 'All data cleared' });
});

module.exports = router;
