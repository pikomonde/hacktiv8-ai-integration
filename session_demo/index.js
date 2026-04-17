import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';

// Memuat environment variables dari file .env
dotenv.config();

const app = express();
const port = 3000;

// Konfigurasi Multer untuk menangani upload file ke folder 'uploads/'
const upload = multer({ dest: 'uploads/' });

// Inisialisasi Client Google GenAI dengan API Key
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = 'gemini-2.5-flash';

// Middleware agar Express dapat menerima request JSON 
app.use(cors())
app.use(express.json());

// Helper untuk mengubah file lokal menjadi format yang dimengerti Gemini (Base64)
async function fileToGenerativePart(path, mimeType) {
  const data = await fs.readFile(path);
  return {
    inlineData: {
      data: data.toString("base64"),
      mimeType,
    },
  };
}

// Contoh endpoint dasar
app.get('/', (req, res) => {
  res.send('Gemini AI API Multimodal Server is running!');
});

// 1. Endpoint untuk Teks
app.post('/generate-text', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    res.json({ response: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Endpoint untuk Gambar
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;
    const imagePart = await fileToGenerativePart(req.file.path, req.file.mimetype);

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
    });

    await fs.unlink(req.file.path); // Hapus file sementara setelah diproses
    res.json({ response: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Endpoint untuk Dokumen (PDF/Text)
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
  try {
    const { prompt } = req.body;
    const docPart = await fileToGenerativePart(req.file.path, req.file.mimetype);

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }, docPart] }],
    });

    await fs.unlink(req.file.path);
    res.json({ response: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Endpoint untuk Audio
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
  try {
    const { prompt } = req.body;
    const audioPart = await fileToGenerativePart(req.file.path, req.file.mimetype);

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }, audioPart] }],
    });

    await fs.unlink(req.file.path);
    res.json({ response: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});