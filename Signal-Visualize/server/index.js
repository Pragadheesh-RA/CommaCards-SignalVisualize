require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessments');
const { connectDb } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));

// Health Check / Root API
app.get(['/', '/api'], async (req, res) => {
    const mongoConnected = await connectDb();
    res.json({
        status: 'Visualize Backend is running',
        storage: mongoConnected ? 'MongoDB (Persistent)' : 'Local File (Temporary/Read-Only)',
        vercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);

// Always listen locally unless explicitly on Vercel
if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 Visualize Backend Ready`);
        console.log(`📡 Endpoint: http://localhost:${PORT}/api`);
        console.log(`🌍 Network: http://0.0.0.0:${PORT}/api`);
    });
}

module.exports = app;
