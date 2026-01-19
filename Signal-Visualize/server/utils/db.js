const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// On Vercel, the only writable directory is /tmp
const IS_VERCEL = process.env.VERCEL || process.env.NODE_ENV === 'production';
const DB_PATH = IS_VERCEL
    ? path.join('/tmp', 'db.json')
    : path.join(__dirname, '../data/db.json');

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
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
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
    // If on Vercel and /tmp/db.json doesn't exist, try to read from the bundled etc/db.json if it exists
    const BUNDLED_DB = path.join(__dirname, '../data/db.json');

    if (!fs.existsSync(DB_PATH)) {
        if (fs.existsSync(BUNDLED_DB)) {
            try {
                const data = fs.readFileSync(BUNDLED_DB, 'utf-8');
                // Optional: copy to /tmp for initial state
                if (IS_VERCEL) fs.writeFileSync(DB_PATH, data);
                return JSON.parse(data);
            } catch (e) { return []; }
        }
        return [];
    }

    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Error reading local DB:", e);
        return [];
    }
};

const writeLocalDb = (data) => {
    try {
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("CRITICAL: Failed to write to local DB. This is expected on Vercel without MongoDB.", e);
        throw new Error("Persistence error: Cannot write to filesystem. Please connect MongoDB for Vercel deployments.");
    }
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
    const newDataArray = Array.isArray(newData) ? newData : [newData];

    if (await connectDb()) {
        const existingIds = (await AssessmentModel.find({}, 'id')).map(d => d.id);
        const toInsert = newDataArray.filter(item => item && item.id && !existingIds.includes(item.id));
        if (toInsert.length > 0) {
            await AssessmentModel.insertMany(toInsert);
        }
        return;
    }
    const current = readLocalDb();
    const existingIds = current.map(item => item.id);
    const toAppend = newDataArray.filter(item => item && item.id && !existingIds.includes(item.id));
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
    clearDb,
    connectDb
};
