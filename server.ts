import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { triageWithGemini } from './src/services/aiDiagnosis';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with large limit for image/audio base64 payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize GoogleGenAI client helper
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Vet-Mitra AI',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    supabaseProjectId: 'dmmumqlcvbkrnmiozuoi',
    supabaseConfigured: true,
  });
});

// Text-To-Speech (TTS) endpoint supporting Marathi, Hindi, and English
// In-memory cache for synthesized audio chunks/results to optimize response times
const ttsAudioCache = new Map<string, Buffer>();

function splitTextIntoSafeTtsChunks(text: string, maxLen = 75): string[] {
  const parts = text.split(/([।\n.!?;,]+)/);
  const chunks: string[] = [];
  let buffer = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (/^[।\n.!?;,]+$/.test(part)) {
      buffer += part;
      if (buffer.trim().length > 0) {
        chunks.push(buffer.trim());
        buffer = '';
      }
    } else {
      const words = part.split(/\s+/);
      for (const w of words) {
        if (!w) continue;
        if ((buffer + ' ' + w).trim().length > maxLen) {
          if (buffer.trim().length > 0) {
            chunks.push(buffer.trim());
          }
          buffer = w;
        } else {
          buffer = buffer ? buffer + ' ' + w : w;
        }
      }
    }
  }

  if (buffer.trim().length > 0) {
    chunks.push(buffer.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

const ttsHandler: express.RequestHandler = async (req, res) => {
  try {
    const rawText = String(req.method === 'POST' ? req.body?.text : req.query?.text || '').trim();
    const lang = String(req.method === 'POST' ? req.body?.lang : req.query?.lang || 'hi').trim().toLowerCase();

    if (!rawText) {
      res.status(400).json({ error: 'Text parameter is required' });
      return;
    }

    const ttsLang = lang === 'mr' ? 'mr' : lang === 'hi' ? 'hi' : 'en-IN';

    // Remove emojis, markdown, and normalize whitespace
    const sanitized = rawText
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '')
      .replace(/["“”«»*_#`~()\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!sanitized) {
      res.status(400).json({ error: 'Text contained only emojis or invalid characters' });
      return;
    }

    const cacheKey = `${ttsLang}:${sanitized}`;
    if (ttsAudioCache.has(cacheKey)) {
      const cached = ttsAudioCache.get(cacheKey)!;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(cached);
      return;
    }

    // Split safely into small chunks (under 75 chars) so Google TTS tw-ob never returns HTTP 400
    const chunks = splitTextIntoSafeTtsChunks(sanitized, 75);

    if (chunks.length === 0) {
      res.status(400).json({ error: 'No readable speech chunks' });
      return;
    }

    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;

      const chunkCacheKey = `${ttsLang}:chunk:${trimmed}`;
      if (ttsAudioCache.has(chunkCacheKey)) {
        audioBuffers.push(ttsAudioCache.get(chunkCacheKey)!);
        continue;
      }

      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
        ttsLang
      )}&q=${encodeURIComponent(trimmed)}`;

      try {
        const ttsRes = await fetch(ttsUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Referer: 'https://translate.google.com/',
          },
        });

        if (ttsRes.ok) {
          const arrayBuf = await ttsRes.arrayBuffer();
          const buf = Buffer.from(arrayBuf);
          ttsAudioCache.set(chunkCacheKey, buf);
          audioBuffers.push(buf);
        } else {
          // If en-IN failed, try standard 'en'
          if (ttsLang === 'en-IN') {
            const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(
              trimmed
            )}`;
            const fallbackRes = await fetch(fallbackUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                Referer: 'https://translate.google.com/',
              },
            });
            if (fallbackRes.ok) {
              const arrayBuf = await fallbackRes.arrayBuffer();
              const buf = Buffer.from(arrayBuf);
              ttsAudioCache.set(chunkCacheKey, buf);
              audioBuffers.push(buf);
            }
          }
        }
      } catch (chunkErr) {
        console.warn('Error fetching audio chunk:', chunkErr);
      }
    }

    if (audioBuffers.length === 0) {
      res.status(502).json({ error: 'Could not generate speech audio' });
      return;
    }

    const combined = Buffer.concat(audioBuffers);
    if (ttsAudioCache.size > 200) {
      ttsAudioCache.clear();
    }
    ttsAudioCache.set(cacheKey, combined);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(combined);
  } catch (err: any) {
    console.error('TTS endpoint error:', err);
    res.status(500).json({ error: 'Internal speech synthesis error' });
  }
};

app.get('/api/tts', ttsHandler);
app.post('/api/tts', ttsHandler);

// Diagnostic handler for Vet-Mitra AI
const diagnoseHandler: express.RequestHandler = async (req, res) => {
  try {
    const {
      animalType,
      symptomsText,
      imageBase64,
      imageMimeType,
      audioBase64,
      audioMimeType,
      language = 'en',
    } = req.body;

    if (!symptomsText && !imageBase64 && !audioBase64) {
      return res.status(400).json({
        error: 'Please provide a symptom description, image, or audio recording.',
      });
    }

    const diagnosis = await triageWithGemini({
      animalType,
      symptomsText,
      imageBase64,
      imageMimeType,
      audioBase64,
      audioMimeType,
      language,
    });

    return res.json(diagnosis);
  } catch (error: any) {
    console.error('Error during veterinary triage diagnosis:', error);
    res.status(500).json({
      error: error.message || 'Failed to process veterinary diagnosis',
    });
  }
};

// Diagnostic endpoints for Vet-Mitra AI (both standard and v1 formats)
app.post('/api/diagnose', diagnoseHandler);
app.post('/api/v1/diagnose', diagnoseHandler);

// Optional Gemini Speech synthesis API
app.post('/api/tts/gemini', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ai = getAIClient();
    const promptText = `Read the following message in a calm, clear, and reassuring tone for an Indian farmer:\n\n${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Kore',
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audioBase64: base64Audio, mimeType: 'audio/pcm;rate=24000' });
    }

    return res.status(204).end();
  } catch (err: any) {
    console.warn('TTS preview model unavailable or fallback to client TTS:', err.message);
    res.status(500).json({ error: 'TTS fallback required' });
  }
});

// Vite integration for SPA
async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Vet-Mitra AI Server listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Critical: Failed to start Vet-Mitra AI server:', err);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT} (Vite middleware failed)`);
    });
  }
}

startServer();
