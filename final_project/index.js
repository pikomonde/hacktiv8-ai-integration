import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';

// Memuat environment variables dari file .env
dotenv.config();

const app = express();
const port = 3000;

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

// Endpoint dasar
app.get('/', (req, res) => {
  res.send('Gemini AI API Multimodal Server is running!');
});

// API Chat
app.post('/api/chat', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});