const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'researcher'], default: 'researcher' },
    password: { type: String }, // Optional: only for admins
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
