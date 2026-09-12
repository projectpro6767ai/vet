import { GoogleGenAI, Modality } from '@google/genai';

/**
 * Vercel Serverless Function for TTS Audio.
 * Handles POST /api/tts
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) ||
    '';

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(503).json({ error: 'Gemini API key not configured for server-side TTS' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { text } = body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ai = new GoogleGenAI({ apiKey });
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
      return res.status(200).json({ audioBase64: base64Audio, mimeType: 'audio/pcm;rate=24000' });
    }

    return res.status(204).end();
  } catch (err: any) {
    console.warn('Vercel TTS generation failed:', err.message);
    return res.status(500).json({ error: 'TTS fallback to client synthesis required' });
  }
}
