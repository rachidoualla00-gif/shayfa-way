const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin Setup (Project Credentials needed in .env)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

// DB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Connected to MongoDB Production Cluster'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Models
const QuranPDF = mongoose.model('QuranPDF', new mongoose.Schema({
    title: String,
    category: { type: String, enum: ['full', 'juz', 'surah', 'translation', 'tafsir'] },
    tag: String,
    url: String,
    storagePath: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now },
    version: { type: String, default: '1.0.0' }
}));

// Endpoints
// 1. Get all PDFs
app.get('/api/quran/pdfs', async (req, res) => {
    try {
        const pdfs = await QuranPDF.find().sort({ uploadedAt: -1 });
        res.json(pdfs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch PDFs' });
    }
});

// 2. Upload PDF
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/admin/quran/upload', upload.single('pdf'), async (req, res) => {
    try {
        const { title, category, tag } = req.body;
        const file = req.file;

        if (!file) return res.status(400).send('No file uploaded.');

        const blob = bucket.file(`quran/${category}/${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
            metadata: { contentType: file.mimetype }
        });

        blobStream.on('error', (err) => res.status(500).json({ error: err.message }));

        blobStream.on('finish', async () => {
            // Get Public URL
            await blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            const newPdf = new QuranPDF({
                title,
                category,
                tag,
                url: publicUrl,
                storagePath: blob.name,
                size: file.size
            });

            await newPdf.save();
            res.status(201).json(newPdf);
        });

        blobStream.end(file.buffer);
    } catch (err) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

// 3. Delete PDF
app.delete('/api/admin/quran/pdf/:id', async (req, res) => {
    try {
        const pdf = await QuranPDF.findById(req.params.id);
        if (!pdf) return res.status(404).json({ error: 'Not found' });

        // Delete from Firebase
        await bucket.file(pdf.storagePath).delete();
        // Delete from DB
        await QuranPDF.findByIdAndDelete(req.params.id);

        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
