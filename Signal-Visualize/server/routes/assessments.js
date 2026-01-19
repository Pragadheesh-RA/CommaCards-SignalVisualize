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
    let data = req.body;
    const { mode } = req.query; // 'replace' or 'append'

    // Handle potential wrapper objects (e.g., { assessments: [...] })
    if (!Array.isArray(data) && data.assessments && Array.isArray(data.assessments)) {
        data = data.assessments;
    }

    try {
        if (mode === 'append') {
            await appendToDb(data);
        } else {
            await writeDb(Array.isArray(data) ? data : [data]);
        }
        res.json({
            success: true,
            count: Array.isArray(data) ? data.length : 1,
            mode: mode || 'replace'
        });
    } catch (e) {
        console.error("Upload error:", e);
        res.status(500).json({ error: 'Failed to save data. ' + e.message });
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
