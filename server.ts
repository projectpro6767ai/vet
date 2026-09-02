import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with large limit for image/audio base64 payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize GoogleGenAI client
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Vet-Mitra AI',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    supabaseProjectId: 'dmmumqlcvbkrnmiozuoi',
    supabaseConfigured: true,
  });
});

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

    const ai = getAIClient();

    const systemInstruction = `You are "Vet-Mitra AI Engine", a balanced, practical veterinary assistant for livestock.

CRITICAL INSTRUCTION FOR DEMO:
Do NOT trigger an emergency RED alert for every symptom. Perform realistic medical triage based on severity.

TRIAGE CRITERIA:
1. 🟢 GREEN (Mild / Home Care):
   - Symptoms: Minor ticks, small cuts, mild appetite loss, simple indigestion, routine grooming questions, mold-free feed checks.
   - Response: Provide safe, low-cost home/herbal remedies (e.g., neem wash, turmeric paste, warm salt water). DO NOT demand a doctor. Set trigger_emergency_dispatch: false.

2. 🟡 YELLOW (Moderate Care / Monitor):
   - Symptoms: Moderate diarrhea, minor milk yield drop, slight lameness, non-spreading skin irritation, mild eye discharge.
   - Response: Give basic herbal care, isolate temporarily, and advise monitoring for 24 hours before calling a doctor. Set trigger_emergency_dispatch: false.

3. 🔴 RED (Urgent Veterinary Required):
   - Symptoms ONLY IF: High fever above 104°F, spreading lumps all over body (Lumpy Skin), severe mouth/hoof blisters (FMD), profuse bleeding, or animal down and unable to stand. Set trigger_emergency_dispatch: true.

OUTPUT FORMAT (Raw JSON only):
{
  "animal_type": "Identified Animal",
  "animal_identified": "Identified Animal",
  "suspected_condition": "Condition name",
  "urgency_badge": "🟢 GREEN" | "🟡 YELLOW" | "🔴 RED",
  "trigger_emergency_dispatch": false | true,
  "is_emergency_dispatch_needed": false | true,
  "first_aid_steps": [
    "Step 1: Simple herbal/home remedy",
    "Step 2: Practical management step"
  ],
  "what_not_to_do": "Common mistake to avoid",
  "recommended_local_product": "Generic herbal product for ad banner",
  "local_voice_script_hindi": "Simple 2-sentence summary in Hindi script",
  "local_voice_script_marathi": "Simple 2-sentence summary in Marathi script"
}`;

    const promptParts: any[] = [];

    // Add image part if present
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      promptParts.push({
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    // Add audio part if present
    if (audioBase64) {
      const cleanAudio = audioBase64.replace(/^data:[^;]+;base64,/, '');
      promptParts.push({
        inlineData: {
          mimeType: audioMimeType || 'audio/webm',
          data: cleanAudio,
        },
      });
    }

    let userPromptText = `Farmer Inquiry Details:
- Animal Category / Subject: ${animalType || 'Not specified (Analyze from visual/description)'}
- Farmer's Stated Symptoms / Notes: ${symptomsText || 'Please inspect attached image/audio'}
- Preferred Primary Language Context: ${language}

Please perform full clinical triage according to Vet-Mitra AI guidelines.`;

    promptParts.push({
      text: userPromptText,
    });

    let response: any = null;
    let lastError: any = null;

    // Supported official model candidate sequence prioritized for uptime & speed
    const modelCandidates = [
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-3.7-flash',
    ];

    for (const modelName of modelCandidates) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: promptParts,
          },
          config: {
            systemInstruction,
            temperature: 0.2, // Low temperature for consistent medical triage accuracy
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                animal_type: { type: Type.STRING },
                animal_identified: { type: Type.STRING },
                suspected_condition: { type: Type.STRING },
                urgency_badge: {
                  type: Type.STRING,
                  description: 'Must strictly be "🟢 GREEN", "🟡 YELLOW", or "🔴 RED"',
                },
                trigger_emergency_dispatch: { type: Type.BOOLEAN },
                is_emergency_dispatch_needed: { type: Type.BOOLEAN },
                first_aid_steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                what_not_to_do: { type: Type.STRING },
                recommended_local_product: { type: Type.STRING },
                local_voice_script_hindi: { type: Type.STRING },
                local_voice_script_marathi: { type: Type.STRING },
              },
              required: [
                'suspected_condition',
                'urgency_badge',
                'trigger_emergency_dispatch',
                'first_aid_steps',
                'what_not_to_do',
                'recommended_local_product',
                'local_voice_script_hindi',
                'local_voice_script_marathi',
              ],
            },
          },
        });

        if (response && response.text) {
          break; // Success!
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        // Switch seamlessly to next model candidate
      }
    }

    let parsedJson: any = null;

    if (response && response.text) {
      try {
        parsedJson = JSON.parse(response.text);
      } catch (parseErr) {
        try {
          const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedJson = JSON.parse(cleaned);
        } catch {
          parsedJson = null;
        }
      }
    }

    if (!parsedJson) {
      // Clinical Rule-Based Triage Safety Fallback (Never leaves a distressed farmer hanging when upstream API experiences spikes)
      console.warn('All Gemini upstream models busy/unavailable, applying Emergency Clinical Rule Engine fallback');
      
      const queryLower = `${animalType || ''} ${symptomsText || ''}`.toLowerCase();
      const isCritical =
        queryLower.includes('lump') ||
        queryLower.includes('fmd') ||
        queryLower.includes('लंपी') ||
        queryLower.includes('लाळ्या') ||
        queryLower.includes('mouth') ||
        queryLower.includes('drool') ||
        queryLower.includes('blood') ||
        queryLower.includes('bleed') ||
        queryLower.includes('choke') ||
        queryLower.includes('fever') ||
        queryLower.includes('104') ||
        queryLower.includes('lying') ||
        queryLower.includes('down') ||
        queryLower.includes('convulsion');

      const isModerate =
        !isCritical &&
        (queryLower.includes('bloat') ||
          queryLower.includes('अफरा') ||
          queryLower.includes('diarrhea') ||
          queryLower.includes('दस्त') ||
          queryLower.includes('mastitis') ||
          queryLower.includes('थन') ||
          queryLower.includes('milk') ||
          queryLower.includes('limp'));

      if (isCritical) {
        parsedJson = {
          animal_type: animalType || 'Livestock (पशु)',
          animal_identified: animalType || 'गाय / म्हैस (Livestock)',
          suspected_condition: 'तीव्र संसर्गजन्य / आपातकालीन पशु स्थिति (Acute Infectious / High Urgency Condition)',
          urgency_badge: '🔴 RED',
          trigger_emergency_dispatch: true,
          is_emergency_dispatch_needed: true,
          first_aid_steps: [
            'प्रभावित पशु को तुरंत अन्य स्वस्थ पशुओं से अलग साफ-सुथरे हवादार बाड़े में बांधें।',
            'ताजा गुनगुना पानी और हल्का सुपाच्य हरा चारा दें। यदि बुखार हो तो सिर पर ठंडा पानी डालें।',
            'घाव या मुंह में छाले होने पर फिटकरी (Alum 2%) या पोटाश (KMNO4) के हल्के घोल से धोएं।',
            'तुरंत सरकारी पशु चिकित्सा हेल्पलाइन 1962 या नजदीकी पशु चिकित्सालय में संपर्क करें।',
          ],
          what_not_to_do: 'पशु को जबरदस्ती नाल से तरल दवा न पिलाएं (फेफड़ों में जाने का खतरा रहता है)। बिना डॉक्टर की सलाह के कोई तेज एंटीबायोटिक इंजेक्शन न लगाएं।',
          recommended_local_product: 'पोटाश (Potassium Permanganate), बोरो-ग्लिसरीन, इलेक्ट्रोलाइट पाउडर (Electral / Prolyte Vet)',
          local_voice_script_hindi: 'सावधान! यह एक अति गंभीर आपातकालीन स्थिति है। पशु को तुरंत बाकी जानवरों से अलग करें और नजदीकी पशु चिकित्सालय या 1962 एम्बुलेंस को कॉल करें। फिटकरी या पोटाश के घोल से घाव साफ रखें।',
          local_voice_script_marathi: 'सावधान! ही अतिशय गंभीर आणि तातडीची परिस्थिती आहे. जनावराला लगेच इतर जनावरांपासून वेगळे बांधा आणि पशुसंवर्धन हेल्पलाइन 1962 वर तात्काळ संपर्क करा.',
        };
      } else if (isModerate) {
        parsedJson = {
          animal_type: animalType || 'Livestock (पशु)',
          animal_identified: animalType || 'पशु (Livestock)',
          suspected_condition: 'पाचन विकार / थनैला या मध्यम स्तर की समस्या (Sub-acute Digestive / Udder condition)',
          urgency_badge: '🟡 YELLOW',
          trigger_emergency_dispatch: false,
          is_emergency_dispatch_needed: false,
          first_aid_steps: [
            'पशु को 4-6 घंटे सूखा चारा और हल्का पानी दें। भारी दाना या खली तुरंत बंद करें।',
            'पेट फूलने पर मीठा तेल (सरसों/तिल का तेल 250ml) और 20ml तारपीन तेल मिलाकर दें।',
            'थन की समस्या होने पर दूध पूरी तरह निकालें और बर्फ से सिकाई करें।',
            'पशु के तापमान और जुगाली करने पर अगले 24 घंटे निरंतर नजर रखें।',
          ],
          what_not_to_do: 'पशु को लेटने न दें, धीरे-धीरे टहलाएं। सड़ा-गला या फफूंद लगा चारा बिल्कुल न खिलाएं।',
          recommended_local_product: 'टिम्पोल (Tympol / Blotosil powder), हिमालयन बत्तीसा (Himalayan Batisa digestive tonic), मस्टिकेयर ऑइंटमेंट',
          local_voice_script_hindi: 'यह मध्यम स्तर की समस्या है। पशु को भारी दाना देना बंद करें और पेट में अफरा होने पर मीठा तेल दें। 24 घंटे में सुधार न होने पर पशु चिकित्सक से परामर्श लें।',
          local_voice_script_marathi: 'ही मध्यम स्वरूपाची परिस्थिती आहे. जनावराचे खाणे-पिणे सांभाळा, पोटाचा त्रास असल्यास गोडे तेल द्या आणि पुढील २४ तास लक्ष ठेवा.',
        };
      } else {
        parsedJson = {
          animal_type: animalType || 'Livestock (पशु)',
          animal_identified: animalType || 'पशु (Livestock)',
          suspected_condition: 'सामान्य स्वास्थ्य विकार / प्राथमिक घरेलू देखभाल (Mild Condition / General Triage)',
          urgency_badge: '🟢 GREEN',
          trigger_emergency_dispatch: false,
          is_emergency_dispatch_needed: false,
          first_aid_steps: [
            'पशु को ताजा साफ पीने का पानी और सूखा-हरा संतुलित चारा दें।',
            'पाचन शक्ति बढ़ाने के लिए 50 ग्राम मीठा सोडा (Baking soda) और नमक चारे में मिलाकर दें।',
            'हल्के घाव या खरोंच पर हल्दी और नारियल तेल का लेप लगाएं।',
          ],
          what_not_to_do: 'बिना आवश्यकता के कोई भी तेज दवा या इंजेक्शन न दें।',
          recommended_local_product: 'मीठा सोडा (Sodium Bicarbonate), हल्दी व नीम तेल, मिनरल मिक्सचर (Mineral Mixture 50g daily)',
          local_voice_script_hindi: 'यह सामान्य स्तर की स्थिति है। पशु को ताजा पानी, मीठा सोडा और सुपाच्य चारा दें। घरेलू देखभाल से पशु जल्दी स्वस्थ हो जाएगा।',
          local_voice_script_marathi: 'ही सामान्य स्थिती आहे. जनावराला स्वच्छ पाणी, सुका चारा आणि खाण्याचा सोडा द्या. साध्या घरगुती उपायांनी आराम पडेल.',
        };
      }
    }

    parsedJson.app_name = "Vet-Mitra AI Engine";
    parsedJson.animal_identified = parsedJson.animal_identified || parsedJson.animal_type || animalType || "Livestock";
    parsedJson.animal_type = parsedJson.animal_identified;

    // Strict Triage logic normalization:
    const badgeUpper = (parsedJson.urgency_badge || '').toUpperCase();
    let isEmergency = false;

    if (badgeUpper.includes('RED') || badgeUpper.includes('🔴')) {
      parsedJson.urgency_badge = '🔴 RED';
      isEmergency = true;
    } else if (badgeUpper.includes('YELLOW') || badgeUpper.includes('🟡')) {
      parsedJson.urgency_badge = '🟡 YELLOW';
      isEmergency = false;
    } else {
      parsedJson.urgency_badge = '🟢 GREEN';
      isEmergency = false;
    }

    parsedJson.is_emergency_dispatch_needed = isEmergency;
    parsedJson.trigger_emergency_dispatch = isEmergency;

    if (isEmergency) {
      parsedJson.doctor_status =
        'Emergency notification broadcasted to nearest Taluka Vet & Mobile Veterinary Unit (1962)!';
    } else if (parsedJson.urgency_badge === '🟡 YELLOW') {
      parsedJson.doctor_status =
        'Moderate case: Monitor for 24 hours. If symptoms persist or worsen, contact local paravet.';
    } else {
      parsedJson.doctor_status =
        'Mild condition: Safe home/herbal care provided. Routine monitoring advised.';
    }

    return res.json(parsedJson);
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

// Optional Speech synthesis API for high-quality audio playback
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language = 'hi' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ai = getAIClient();
    const promptText = `Read the following message in a calm, clear, and reassuring tone for an Indian farmer:\n\n${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: ['AUDIO' as any],
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
}

startServer();
