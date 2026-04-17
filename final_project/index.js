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
const GEMINI_MODEL = 'gemini-2.5-flash-lite';

// Middleware agar Express dapat menerima request JSON 
app.use(cors())
app.use(express.json());
app.use(express.static('public')); 

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, notes } = req.body;

    // Gabungkan konteks dari Notes ke dalam prompt jika ada
    let finalPrompt = prompt;
    if (notes && notes.trim() !== "") {
      finalPrompt = `KONTEKS NOTES USER:\n${notes}\n\nPERTANYAAN USER:\n${prompt}`;
    }

    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
    });
    res.json({ response: response.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});