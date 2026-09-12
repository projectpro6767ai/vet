import { triageWithGemini } from '../src/services/aiDiagnosis';

/**
 * Vercel Serverless Function for Veterinary Multimodal Diagnosis.
 * Handles POST /api/diagnose
 */
export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const diagnosis = await triageWithGemini(body);
    return res.status(200).json(diagnosis);
  } catch (error: any) {
    console.error('API /api/diagnose error:', error);
    return res.status(500).json({
      error: error?.message || 'Internal diagnosis failure',
    });
  }
}
