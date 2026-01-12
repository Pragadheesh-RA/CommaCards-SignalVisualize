const express = require('express');
const router = express.Router();
const { readDb, writeDb, appendToDb, updateItemInDb, deleteItemFromDb, clearDb } = require('../utils/db');

// Get all assessments
router.get('/', async (req, res) => {
    try {
        const data = await readDb();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch assessments' });
    }
});

// Upload/Overwrite assessments (from JSON export)
router.post('/upload', async (req, res) => {
    const data = req.body;
    const { mode } = req.query; // 'replace' or 'append'

    if (!Array.isArray(data)) {
        return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
    }

    try {
        if (mode === 'append') {
            await appendToDb(data);
        } else {
            await writeDb(data);
        }
        res.json({ success: true, count: data.length, mode: mode || 'replace' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Update annotations for a specific participant
router.patch('/:id/annotations', async (req, res) => {
    const { id } = req.params;
    const newAnnotations = req.body;

    try {
        const updated = await updateItemInDb(id, { annotations: newAnnotations });
        if (!updated) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        res.json({ success: true, annotations: updated.annotations });
    } catch (e) {
        res.status(500).json({ error: 'Failed to update annotations' });
    }
});

// Delete a specific assessment
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await deleteItemFromDb(id);
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        res.json({ success: true, message: 'Assessment deleted' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete assessment' });
    }
});

// Clear all assessments
router.delete('/', async (req, res) => {
    try {
        await clearDb();
        res.json({ success: true, message: 'All data cleared' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to clear data' });
    }
});

module.exports = router;
