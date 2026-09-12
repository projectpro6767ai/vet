/**
 * Vercel Serverless Function for TTS Audio.
 * Handles GET & POST /api/tts
 * Serves synthesized MP3 audio for Marathi ('mr'), Hindi ('hi'), and English ('en' / 'en-IN')
 */

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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let rawText = '';
    let lang = 'hi';

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      rawText = String(body.text || '').trim();
      lang = String(body.lang || 'hi').trim().toLowerCase();
    } else {
      rawText = String(req.query?.text || '').trim();
      lang = String(req.query?.lang || 'hi').trim().toLowerCase();
    }

    if (!rawText) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ttsLang = lang === 'mr' ? 'mr' : lang === 'hi' ? 'hi' : 'en-IN';

    // Remove emojis, markdown, and normalize whitespace
    const sanitized = rawText
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '')
      .replace(/["“”«»*_#`~()\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!sanitized) {
      return res.status(400).json({ error: 'Text contained only emojis or invalid characters' });
    }

    const chunks = splitTextIntoSafeTtsChunks(sanitized, 75);
    if (chunks.length === 0) {
      return res.status(400).json({ error: 'No readable speech chunks' });
    }

    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;

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
          audioBuffers.push(Buffer.from(arrayBuf));
        } else if (ttsLang === 'en-IN') {
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
            audioBuffers.push(Buffer.from(arrayBuf));
          }
        }
      } catch (chunkErr) {
        console.warn('Vercel TTS chunk fetch failed:', chunkErr);
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(502).json({ error: 'Could not generate speech audio' });
    }

    const combined = Buffer.concat(audioBuffers);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(combined);
  } catch (err: any) {
    console.warn('Vercel TTS generation failed:', err.message);
    return res.status(500).json({ error: 'TTS synthesis error' });
  }
}
