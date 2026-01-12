const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DB_PATH = path.join(__dirname, '../data/db.json');
const MONGODB_URI = process.env.MONGODB_URI;

// --- Mongoose Schema ---
const AssessmentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    data: { type: Object, required: true },
    annotations: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now }
}, { strict: false });

const AssessmentModel = mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);

let isConnected = false;

const connectDb = async () => {
    if (!MONGODB_URI) return false;
    if (isConnected) return true;

    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log("Connected to MongoDB");
        return true;
    } catch (e) {
        console.error("MongoDB connection error:", e);
        return false;
    }
};

// --- Local File DB Helpers ---
const readLocalDb = () => {
    if (!fs.existsSync(DB_PATH)) return [];
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Error reading local DB:", e);
        return [];
    }
};

const writeLocalDb = (data) => {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// --- Unified API ---

const readDb = async () => {
    if (await connectDb()) {
        const docs = await AssessmentModel.find({}).lean();
        return docs.map(doc => {
            const d = { ...doc };
            delete d._id;
            delete d.__v;
            return d;
        });
    }
    return readLocalDb();
};

const writeDb = async (data) => {
    if (await connectDb()) {
        await AssessmentModel.deleteMany({});
        if (data.length > 0) {
            await AssessmentModel.insertMany(data);
        }
        return;
    }
    writeLocalDb(data);
};

const appendToDb = async (newData) => {
    if (await connectDb()) {
        if (Array.isArray(newData)) {
            // Filter out existing IDs to prevent duplicates
            const existingIds = (await AssessmentModel.find({}, 'id')).map(d => d.id);
            const toInsert = newData.filter(item => !existingIds.includes(item.id));
            if (toInsert.length > 0) {
                await AssessmentModel.insertMany(toInsert);
            }
        } else {
            await AssessmentModel.findOneAndUpdate({ id: newData.id }, newData, { upsert: true });
        }
        return;
    }
    const current = readLocalDb();
    const newDataArray = Array.isArray(newData) ? newData : [newData];
    const existingIds = current.map(item => item.id);
    const toAppend = newDataArray.filter(item => !existingIds.includes(item.id));
    writeLocalDb([...current, ...toAppend]);
};

const updateItemInDb = async (id, updates) => {
    if (await connectDb()) {
        return await AssessmentModel.findOneAndUpdate({ id }, updates, { new: true });
    }
    const db = readLocalDb();
    const index = db.findIndex(item => item.id === id);
    if (index !== -1) {
        db[index] = { ...db[index], ...updates };
        writeLocalDb(db);
        return db[index];
    }
    return null;
};

const deleteItemFromDb = async (id) => {
    if (await connectDb()) {
        return await AssessmentModel.deleteOne({ id });
    }
    const db = readLocalDb();
    const filtered = db.filter(item => item.id !== id);
    writeLocalDb(filtered);
    return { deletedCount: db.length - filtered.length };
};

const clearDb = async () => {
    if (await connectDb()) {
        return await AssessmentModel.deleteMany({});
    }
    writeLocalDb([]);
};

module.exports = {
    readDb,
    writeDb,
    appendToDb,
    updateItemInDb,
    deleteItemFromDb,
    clearDb
};
