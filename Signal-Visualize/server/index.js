require('dotenv').config();
require('dotenv').config({ path: 'server.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessments');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for large JSON uploads

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);

app.get('/', (req, res) => {
    res.send('Visualize Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
