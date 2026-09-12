/**
 * Vercel Serverless Function for Health Checks.
 * Handles GET /api/health
 */
export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const hasGeminiKey = Boolean(
    (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') ||
    (process.env.VITE_GEMINI_API_KEY && process.env.VITE_GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
  );

  return res.status(200).json({
    status: 'ok',
    appName: 'Vet-Mitra AI',
    platform: 'vercel-serverless',
    geminiConfigured: hasGeminiKey,
    timestamp: Date.now(),
  });
}
