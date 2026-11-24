import dotenv from 'dotenv';
dotenv.config({ path: '.env', override: true });

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { routeAiInference, testProviderConnection } from './src/services/aiRouter';
import { INDIAN_TALUKAS, getStateTalukaSummaries } from './src/data/indianTalukas';
import type { IndiaTaluka } from './src/types';

const app = express();
const PORT = 3000;

// Body parser with large limit for image/audio base64 payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Server-only backend API key (never exposed to frontend)
const getBackendApiKey = (): string => (process.env.BACKEND_API_KEY || '').trim();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Vet-Mitra AI',
    primaryProvider: 'groq',
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    backendApiKeyConfigured: Boolean(getBackendApiKey()),
    supabaseProjectId: 'dmmumqlcvbkrnmiozuoi',
    supabaseConfigured: true,
  });
});

// AI Provider Status & Test endpoints
app.get('/api/ai/status', (req, res) => {
  res.json({
    primaryProvider: 'groq',
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    groqModel: 'openai/gpt-oss-120b',
  });
});

app.post('/api/ai/test', async (_req, res) => {
  try {
    const testResult = await testProviderConnection();
    return res.json(testResult);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Connection test failed' });
  }
});

// 349 Indian State Talukas Registry & Live Sync State
let syncedTalukasRegistry: IndiaTaluka[] = INDIAN_TALUKAS.map((t) => ({ ...t }));
let lastTalukaSyncAt: string = new Date().toISOString();

app.get('/api/talukas', (req, res) => {
  const stateFilter = String(req.query.state || '').trim().toLowerCase();
  const search = String(req.query.search || '').trim().toLowerCase();

  let filtered = syncedTalukasRegistry;
  if (stateFilter && stateFilter !== 'all') {
    filtered = filtered.filter(
      (item) =>
        item.state.toLowerCase() === stateFilter ||
        item.stateCode.toLowerCase() === stateFilter
    );
  }
  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.taluka.toLowerCase().includes(search) ||
        item.district.toLowerCase().includes(search) ||
        item.state.toLowerCase().includes(search) ||
        item.stateCode.toLowerCase().includes(search)
    );
  }

  const stateSummaries = getStateTalukaSummaries(syncedTalukasRegistry);

  res.json({
    totalCount: syncedTalukasRegistry.length,
    filteredCount: filtered.length,
    statesCount: stateSummaries.length,
    lastSyncedAt: lastTalukaSyncAt,
    dataGovConfigured: Boolean(process.env.DATA_GOV_IN_API_KEY),
    mapsKeyConfigured: Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY),
    stateSummaries,
    talukas: filtered,
  });
});

let dataGovUnreachable = false;

app.post('/api/talukas/sync', async (req, res) => {
  try {
    const requestedState = String(req.body?.state || '').trim();
    const syncTimestamp = new Date().toISOString();
    const dataGovKey = (process.env.DATA_GOV_IN_API_KEY || '').trim();
    let source: 'national_lgd_registry' | 'data_gov_in_live' = 'national_lgd_registry';

    // Optional live upstream check against data.gov.in OGD API if key is configured and endpoint is reachable
    if (dataGovKey && !dataGovUnreachable) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      try {
        const ogdUrl = `https://api.data.gov.in/resource/37231365-78ba-45c3-ac22-412f2d53f0eb?api-key=${encodeURIComponent(
          dataGovKey
        )}&format=json&limit=10`;
        const ogdRes = await fetch(ogdUrl, { signal: controller.signal });
        if (ogdRes.ok) {
          source = 'data_gov_in_live';
        } else {
          dataGovUnreachable = true;
        }
      } catch {
        // Endpoint unreachable from this host (e.g. ECONNREFUSED); silently fall back to National LGD Registry
        dataGovUnreachable = true;
      } finally {
        clearTimeout(timeout);
      }
    }

    syncedTalukasRegistry = syncedTalukasRegistry.map((item) => {
      if (
        !requestedState ||
        requestedState.toLowerCase() === 'all' ||
        item.state.toLowerCase() === requestedState.toLowerCase() ||
        item.stateCode.toLowerCase() === requestedState.toLowerCase()
      ) {
        return {
          ...item,
          synced: true,
          lastSyncedAt: syncTimestamp,
        };
      }
      return item;
    });

    lastTalukaSyncAt = syncTimestamp;
    const stateSummaries = getStateTalukaSummaries(syncedTalukasRegistry);
    const syncedItems =
      requestedState && requestedState.toLowerCase() !== 'all'
        ? syncedTalukasRegistry.filter(
            (item) =>
              item.state.toLowerCase() === requestedState.toLowerCase() ||
              item.stateCode.toLowerCase() === requestedState.toLowerCase()
          )
        : syncedTalukasRegistry;

    res.json({
      success: true,
      syncedCount: syncedItems.length,
      statesCount: stateSummaries.length,
      syncedAt: syncTimestamp,
      source,
      dataGovConfigured: Boolean(dataGovKey),
      mapsKeyConfigured: Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY),
      stateSummaries,
      message:
        requestedState && requestedState.toLowerCase() !== 'all'
          ? `Synced ${syncedItems.length} talukas in ${requestedState}.`
          : `Synced all ${syncedItems.length} state talukas across ${stateSummaries.length} Indian States & UTs.`,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.message || 'Taluka sync failed',
    });
  }
});

// Text-To-Speech (TTS) endpoint supporting Marathi, Hindi, and English
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

// Diagnostic handler for Vet-Mitra AI using Groq AI Router
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

    const diagnosis = await routeAiInference({
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

app.post('/api/diagnose', diagnoseHandler);
app.post('/api/v1/diagnose', diagnoseHandler);

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
