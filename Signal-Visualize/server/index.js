require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessments');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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
