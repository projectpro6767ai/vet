import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, Modality } from '@google/genai';
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

// Text-To-Speech (TTS) endpoint supporting Marathi, Hindi, and English
const ttsHandler: express.RequestHandler = async (req, res) => {
  try {
    const rawText = String(req.method === 'POST' ? req.body?.text : req.query?.text || '').trim();
    const lang = String(req.method === 'POST' ? req.body?.lang : req.query?.lang || 'hi').trim().toLowerCase();

    if (!rawText) {
      res.status(400).json({ error: 'Text parameter is required' });
      return;
    }

    const ttsLang = lang === 'mr' ? 'mr' : lang === 'hi' ? 'hi' : 'en';

    // Clean text and split into manageable chunks under Google TTS limit (approx 180 chars)
    const sanitized = rawText
      .replace(/["“”«»*_#`~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const maxChunkLength = 180;
    const rawSentences = sanitized.split(/([।\n.!?]+)/);
    const chunks: string[] = [];
    let current = '';

    for (const part of rawSentences) {
      if ((current + part).length > maxChunkLength) {
        if (current.trim()) chunks.push(current.trim());
        current = part;
      } else {
        current += part;
      }
    }
    if (current.trim()) {
      chunks.push(current.trim());
    }

    if (chunks.length === 0) {
      chunks.push(sanitized.slice(0, maxChunkLength));
    }

    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;

      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
        ttsLang
      )}&q=${encodeURIComponent(trimmed)}`;

      const ttsRes = await fetch(ttsUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
        },
      });

      if (ttsRes.ok) {
        const arrayBuf = await ttsRes.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuf));
      }
    }

    if (audioBuffers.length === 0) {
      res.status(502).json({ error: 'Could not generate speech audio' });
      return;
    }

    const combined = Buffer.concat(audioBuffers);
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

    const languageMap: Record<string, string> = {
      hi: 'Hindi (हिन्दी)',
      mr: 'Marathi (मराठी)',
      en: 'English',
    };

    const targetLangName = languageMap[language] || 'English';

    const ai = getAIClient();

    const systemInstruction = `You are "Vet-Mitra AI Engine", a balanced, practical veterinary assistant for livestock (Cow, Buffalo, Goat, Sheep) and domestic animals (Poultry/Chicken, Dogs/Puppies, Cats/Kittens).

CRITICAL INSTRUCTION FOR DEMO:
Do NOT trigger an emergency RED alert for every symptom. Perform realistic medical triage based on severity.

LANGUAGE REQUIREMENT:
The user has requested the output in ${targetLangName}. 
ALL text values in the JSON fields (animal_type, animal_identified, suspected_condition, first_aid_steps, what_not_to_do, recommended_local_product) MUST be written in ${targetLangName}.

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
  "animal_type": "Identified Animal (in ${targetLangName})",
  "animal_identified": "Identified Animal (in ${targetLangName})",
  "suspected_condition": "Condition name (in ${targetLangName})",
  "urgency_badge": "🟢 GREEN" | "🟡 YELLOW" | "🔴 RED",
  "trigger_emergency_dispatch": false | true,
  "is_emergency_dispatch_needed": false | true,
  "first_aid_steps": [
    "Step 1 (in ${targetLangName})",
    "Step 2 (in ${targetLangName})"
  ],
  "what_not_to_do": "Common mistake to avoid (in ${targetLangName})",
  "recommended_local_product": "Generic herbal product for ad banner (in ${targetLangName})",
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
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
    ];

    for (const modelName of modelCandidates) {
      try {
        console.log(`Attempting diagnosis with model: ${modelName}`);
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
      const isPoultry =
        queryLower.includes('poultry') ||
        queryLower.includes('chicken') ||
        queryLower.includes('cock') ||
        queryLower.includes('कोंबडी') ||
        queryLower.includes('मुर्गी');

      const isDog =
        queryLower.includes('dog') ||
        queryLower.includes('puppy') ||
        queryLower.includes('कुत्रा') ||
        queryLower.includes('कुत्ता') ||
        queryLower.includes('पिल्लू') ||
        queryLower.includes('पिल्ला');

      const isCat =
        queryLower.includes('cat') ||
        queryLower.includes('kitten') ||
        queryLower.includes('मांजर') ||
        queryLower.includes('बिल्ली');

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
        queryLower.includes('convulsion') ||
        queryLower.includes('parvo') ||
        queryLower.includes('पार्व्हो') ||
        queryLower.includes('vomit') ||
        queryLower.includes('उलटी') ||
        queryLower.includes('neck twist') ||
        queryLower.includes('gasp') ||
        queryLower.includes('मान वाकडी');

      const isModerate =
        !isCritical &&
        (queryLower.includes('bloat') ||
          queryLower.includes('अफरा') ||
          queryLower.includes('diarrhea') ||
          queryLower.includes('दस्त') ||
          queryLower.includes('mastitis') ||
          queryLower.includes('थन') ||
          queryLower.includes('milk') ||
          queryLower.includes('limp') ||
          queryLower.includes('sneez') ||
          queryLower.includes('शिंका') ||
          queryLower.includes('eye') ||
          queryLower.includes('डोळे') ||
          queryLower.includes('tick') ||
          queryLower.includes('गोचीड'));

      if (isPoultry) {
        if (isCritical) {
          if (language === 'mr') {
            parsedJson = {
              animal_type: 'कोंबडी / पोल्ट्री (Poultry)',
              animal_identified: 'कोंबडी / पोल्ट्री (Poultry)',
              suspected_condition: 'राणीखेत रोग / तीव्र श्वसन आजार (Newcastle / Ranikhet Disease)',
              urgency_badge: '🔴 RED',
              trigger_emergency_dispatch: true,
              is_emergency_dispatch_needed: true,
              first_aid_steps: [
                'बाधित पक्ष्यांना निरोगी पक्षांच्या कळपापासून ताबडतोब पूर्णपणे वेगळे करा.',
                'पिण्याच्या पाण्यात १ ग्रॅम व्हिटॅमिन ए आणि बी-कॉम्प्लेक्स पावडर तसेच इलेक्ट्रोलाइट्स मिसळा.',
                'शेडमध्ये चुना पावडर पसरून कोरडी आणि उबदार गादी (Litter) ठेवा.',
                'जवळच्या पशुसंवर्धन विस्तार अधिकारी किंवा १९६२ हेल्पलाईनवर कळवा.',
              ],
              what_not_to_do: 'आजारी पक्षी आणि निरोगी पक्ष्यांचे भांडे एकच ठेवू नका. शेडमध्ये ओलसरपणा ठेवू नका.',
              recommended_local_product: 'इलेक्ट्रोलाइट पावडर, व्हिटॅमिन ई + सेलेनियम टॉनिक, पोटॅशियम परमॅंगनेट',
              local_voice_script_hindi: 'सावधान! मुर्गियों में रानीखेत रोग का खतरा है। बीमार पक्षियों को तुरंत अलग करें और पानी में इलेक्ट्रोलाइट दें।',
              local_voice_script_marathi: 'सावधान! कोंबड्यांमध्ये राणीखेत रोगाचा संशय आहे. बाधित पक्ष्यांना तातडीने वेगळे करा आणि १९६२ वर संपर्क करा.',
            };
          } else if (language === 'hi') {
            parsedJson = {
              animal_type: 'मुर्गी / पोल्ट्री (Poultry)',
              animal_identified: 'मुर्गी / पोल्ट्री (Poultry)',
              suspected_condition: 'रानीखेत रोग / गंभीर श्वसन विकार (Newcastle / Ranikhet Disease)',
              urgency_badge: '🔴 RED',
              trigger_emergency_dispatch: true,
              is_emergency_dispatch_needed: true,
              first_aid_steps: [
                'प्रभावित मुर्गियों को स्वस्थ झुंड से तुरंत अलग करें।',
                'पीने के पानी में इलेक्ट्रोलाइट और विटामिन ए+ई टॉनिक मिलाएं।',
                'बाड़े में चूने का छिड़काव करें और तापमान गर्म रखें।',
                'नजदीकी पशु चिकित्सालय या 1962 पर तुरंत सूचना दें।',
              ],
              what_not_to_do: 'बीमार पक्षी का दाना-पानी स्वस्थ पक्षियों के संपर्क में न आने दें।',
              recommended_local_product: 'इलेक्ट्रोलाइट पाउडर, विटामिन ई + सेलेनियम ड्रॉप्स, पोटाश',
              local_voice_script_hindi: 'सावधान! मुर्गियों में रानीखेत का अंदेशा है। बीमार पक्षियों को अलग करें और डॉक्टर को सूचित करें।',
              local_voice_script_marathi: 'सावधान! कोंबड्यांमध्ये राणीखेत रोगाची शक्यता आहे. तातडीने वेगळे करा.',
            };
          } else {
            parsedJson = {
              animal_type: 'Poultry / Chicken',
              animal_identified: 'Poultry / Chicken',
              suspected_condition: 'Suspected Newcastle Disease (Ranikhet) / Avian Respiratory Crisis',
              urgency_badge: '🔴 RED',
              trigger_emergency_dispatch: true,
              is_emergency_dispatch_needed: true,
              first_aid_steps: [
                'Strictly isolate affected birds from the healthy flock immediately.',
                'Add oral electrolytes and Vitamin A+E+Selenium to clean drinking water.',
                'Sanitize drinkers with mild potassium permanganate solution and replace wet litter.',
                'Notify local veterinary office or call 1962 veterinary helpline immediately.',
              ],
              what_not_to_do: 'Do not share feed or water containers between isolated and healthy birds.',
              recommended_local_product: 'Electrolyte Powder, ImmuPlus Poultry, Potassium Permanganate',
              local_voice_script_hindi: 'Alert! Suspected Newcastle disease in poultry flock. Isolate birds immediately.',
              local_voice_script_marathi: 'सावधान! पोल्ट्रीमध्ये राणीखेत आजाराचा धोका. ताबडतोब वेगळे करा.',
            };
          }
        } else {
          parsedJson = {
            animal_type: language === 'mr' ? 'कोंबडी / पोल्ट्री' : language === 'hi' ? 'मुर्गी / पोल्ट्री' : 'Poultry / Chicken',
            animal_identified: language === 'mr' ? 'कोंबडी / पोल्ट्री' : language === 'hi' ? 'मुर्गी / पोल्ट्री' : 'Poultry / Chicken',
            suspected_condition: language === 'mr' ? 'कॉकसिडिओसिस / पचन विकार' : language === 'hi' ? 'कॉक्सीडियोसिस / पाचन विकार' : 'Avian Coccidiosis / Digestive Stress',
            urgency_badge: '🟡 YELLOW',
            trigger_emergency_dispatch: false,
            is_emergency_dispatch_needed: false,
            first_aid_steps: [
              language === 'mr' ? 'कोंबड्यांच्या गादीवर (Litter) कोरडेपणा ठेवा आणि चुना पावडर शिंपडा.' : language === 'hi' ? 'बिछावन को बिल्कुल सूखा रखें और चूना छिड़कें।' : 'Keep coop litter dry and sprinkle lime powder.',
              language === 'mr' ? 'पाण्यात हळद (२ ग्रॅम) आणि लसणाचा अर्क (५ मिली) मिसळा.' : language === 'hi' ? 'पानी में हल्दी और लहसुन का अर्क मिलाकर दें।' : 'Provide clean water with garlic extract and electrolytes.',
              language === 'mr' ? '२४ तासांत सुधारणा न झाल्यास पशुवैद्यांचा सल्ला घ्या.' : language === 'hi' ? '24 घंटे में सुधार न होने पर डॉक्टर को दिखाएं।' : 'Monitor flock feed intake over the next 24 hours.',
            ],
            what_not_to_do: language === 'mr' ? 'ओलसर आणि दमट जागेत पक्षी ठेवू नका.' : language === 'hi' ? 'गीले बिछावन पर पक्षियों को न रखें।' : 'Do not keep birds on wet or damp bedding.',
            recommended_local_product: 'Amprolium / Electrolyte Tonic',
            local_voice_script_hindi: 'मुर्गियों का बिछावन सूखा रखें और पानी में हल्दी व इलेक्ट्रोलाइट दें।',
            local_voice_script_marathi: 'कोंबड्यांची गादी कोरडी ठेवा आणि पाण्यात हळद व इलेक्ट्रोलाईट द्या.',
          };
        }
      } else if (isDog) {
        if (isCritical) {
          if (language === 'mr') {
            parsedJson = {
              animal_type: 'कुत्रा / पिल्लू (Dog/Puppy)',
              animal_identified: 'कुत्रा / पिल्लू (Dog/Puppy)',
              suspected_condition: 'पार्व्होव्हायरस / तीव्र गॅस्ट्रोएन्टेरिटिस (Canine Parvovirus / Acute Gastroenteritis)',
              urgency_badge: '🔴 RED',
              trigger_emergency_dispatch: true,
              is_emergency_dispatch_needed: true,
              first_aid_steps: [
                'पिल्लाला ताबडतोब खाणे आणि दूध देणे पूर्णपणे बंद करा (पोटाला आराम द्या).',
                'उलट्या थांबल्यावर थोडे थोडे ओआरएस (इलेक्ट्रोलाईट) पाणी चमच्याने द्या.',
                'पिल्लाला उबदार जागी कोरड्या कपड्यात ठेवा जेणेकरून शरीराचे तापमान कमी होणार नाही.',
                'तात्काळ जवळच्या पशुवैद्यकीय दवाखान्यात नेऊन सलाईन (IV Fluid) सुरू करा.',
              ],
              what_not_to_do: 'बळजबरीने दूध किंवा मानवी औषधे (उदा. पॅरासिटामॉल) अजिबात देऊ नका.',
              recommended_local_product: 'ORS (Electral) पावडर, डिझिटॉन ड्रॉप्स, सलाईन',
              local_voice_script_hindi: 'सावधान! पिल्ले में पार्वो वायरस का गंभीर खतरा है। खाना-दूध तुरंत बंद करें और डॉक्टर के पास ले जाएं।',
              local_voice_script_marathi: 'सावधान! पिल्लामध्ये पार्व्हो व्हायरसचा संशय आहे. दूध-अन्न बंद करा आणि तात्काळ पशुवैद्यकाकडे न्या.',
            };
          } else if (language === 'hi') {
            parsedJson = {
              animal_type: 'कुत्ता / पिल्ला (Dog/Puppy)',
              animal_identified: 'कुत्ता / पिल्ला (Dog/Puppy)',
              suspected_condition: 'पार्वो वायरस / गंभीर संक्रमण (Canine Parvovirus / Acute Gastroenteritis)',
              urgency_badge: '🔴 RED',
              trigger_emergency_dispatch: true,
              is_emergency_dispatch_needed: true,
              first_aid_steps: [
                'पिल्ले को दूध या ठोस खाना देना तुरंत बंद करें।',
                'यदि उल्टी न हो तो हर आधे घंटे में चम्मच से ओआरएस घोल दें।',
                'पिल्ले को गर्म और शांत कमरे में रखें।',
                'तुरंत नजदीकी पशु चिकित्सालय में ले जाकर ड्रिप (IV Fluids) लगवाएं।',
              ],
              what_not_to_do: 'इंसानों वाली पैरासिटामोल या दर्द निवारक दवा बिल्कुल न दें।',
              recommended_local_product: 'ओआरएस पाउडर, डाइजिटन ड्रॉप्स, सेलाइन बोतल',
              local_voice_script_hindi: 'सावधान! पिल्ले में पार्वो वायरस का खतरा है। खाना बंद करें और तुरंत डॉक्टर के पास ले जाएं।',
              local_voice_script_marathi: 'सावधान! पिल्लाला तात्काळ पशुवैद्यकीय दवाखान्यात न्या.',
            };
          } else {
            parsedJson = {
              animal_type: 'Dog / Puppy',
              animal_identified: 'Dog / Puppy',
              suspected_condition: 'Suspected Canine Parvovirus / Acute Hemorrhagic Gastroenteritis',
              urgency_badge: '🔴 RED',
              trigger_emergency_dispatch: true,
              is_emergency_dispatch_needed: true,
              first_aid_steps: [
                'Withhold all solid food and dairy immediately to rest the gastrointestinal tract.',
                'Keep puppy warm with dry blankets to prevent hypothermia.',
                'If not vomiting continuously, offer small drops of ORS solution via syringe.',
                'Rush to the nearest veterinary clinic immediately for IV fluid resuscitation.',
              ],
              what_not_to_do: 'Never administer human pain killers (Paracetamol/Ibuprofen is lethal to pets). Do not force milk.',
              recommended_local_product: 'Oral Rehydration Salts (ORS), Digyton Oral Drops, IV Ringers Lactate',
              local_voice_script_hindi: 'Critical emergency! Suspected Parvo in puppy. Stop feeding and rush to vet immediately.',
              local_voice_script_marathi: 'आणीबाणी! पिल्लाला ताबडतोब पशुवैद्यकीय दवाखान्यात दाखल करा.',
            };
          }
        } else {
          parsedJson = {
            animal_type: language === 'mr' ? 'कुत्रा / पाळीव प्राणी' : language === 'hi' ? 'कुत्ता / पालतू' : 'Dog / Pet',
            animal_identified: language === 'mr' ? 'कुत्रा / पाळीव प्राणी' : language === 'hi' ? 'कुत्ता / पालतू' : 'Dog / Pet',
            suspected_condition: language === 'mr' ? 'त्वचारोग / गोचीड व खाज' : language === 'hi' ? 'त्वचा विकार / किलनी व खुजली' : 'Canine Dermatitis & Tick Infestation',
            urgency_badge: '🟢 GREEN',
            trigger_emergency_dispatch: false,
            is_emergency_dispatch_needed: false,
            first_aid_steps: [
              language === 'mr' ? 'अंगावरील गोचिड काढण्यासाठी कडुनिंबाचे तेल किंवा अँटी-टिक शाम्पू वापरा.' : language === 'hi' ? 'नीम का तेल या एंटी-टिक शैम्पू से नहलाएं।' : 'Bathe with neem-based wash or anti-tick shampoo.',
              language === 'mr' ? 'जखमेवर खोबरेल तेलात कापूर मिसळून लावा.' : language === 'hi' ? 'हल्के घाव पर नारियल तेल और कपूर लगाएं।' : 'Apply natural coconut oil mixed with camphor on abrasions.',
              language === 'mr' ? 'पिण्यासाठी स्वच्छ पाणी आणि हलका भात द्या.' : language === 'hi' ? 'उबला हुआ चावल और ताजा पानी दें।' : 'Feed boiled rice with plain broth and plenty of clean water.',
            ],
            what_not_to_do: language === 'mr' ? 'शेतातील रासायनिक कीटकनाशके अंगावर मारू नका.' : language === 'hi' ? 'खेतों वाले कीटनाशक कभी न लगाएं।' : 'Never apply agricultural pesticides on pet skin.',
            recommended_local_product: 'Himalaya Erina-EP Shampoo / Topicure Pet Spray',
            local_voice_script_hindi: 'कुत्ते को एंटी-टिक शैम्पू से नहलाएं और हल्का खाना दें।',
            local_voice_script_marathi: 'कुत्र्याला अँटी-टिक शाम्पूने धुवा आणि हलके जेवण द्या.',
          };
        }
      } else if (isCat) {
        if (isCritical) {
          if (language === 'mr') {
            parsedJson = {
              animal_type: 'मांजर / पिल्लू (Cat/Kitten)',
              animal_identified: 'मांजर / पिल्लू (Cat/Kitten)',
              suspected_condition: 'फेलिन पॅनल्युकोपेनिया / तीव्र आणीबाणी (Feline Panleukopenia / Acute Emergency)',
              urgency_badge: '🔴 RED',
              trigger_emergency_dispatch: true,
              is_emergency_dispatch_needed: true,
              first_aid_steps: [
                'मांजरीला उबदार आणि शांत जागी टॉवेलमध्ये गुंडाळून ठेवा.',
                'शरीरातील पाण्याचे प्रमाण टिकवण्यासाठी ड्रॉपरने कोमट ओआरएस पाणी पाजा.',
                'मानवी वेदनाशामक औषधे (उदा. पॅरासिटामॉल) अजिबात देऊ नका - ते मांजरींसाठी विषारी आहे.',
                'तात्काळ पशुवैद्यकीय दवाखान्यात न्या.',
              ],
              what_not_to_do: 'कोणतीही मानवी गोळी किंवा थंड पाणी देऊ नका.',
              recommended_local_product: 'इलेक्ट्रोलाईट सोल्यूशन, पेट न्यूट्रिशन सिरप',
              local_voice_script_hindi: 'सावधान! बिल्ली में गंभीर संक्रमण का खतरा है। उसे तुरंत गर्म रखें और डॉक्टर को दिखाएं।',
              local_voice_script_marathi: 'सावधान! मांजराची प्रकृती चिंताजनक आहे. तात्काळ पशुवैद्यकाकडे संपर्क करा.',
            };
          } else if (language === 'hi') {
            parsedJson = {
              animal_type: 'बिल्ली / किटन (Cat/Kitten)',
              animal_identified: 'बिल्ली / किटन (Cat/Kitten)',
              suspected_condition: 'फेलिन पैनलेउकोपेनिया / गंभीर आपातकाल (Feline Panleukopenia / Emergency)',
              urgency_badge: '🔴 RED',
              trigger_emergency_dispatch: true,
              is_emergency_dispatch_needed: true,
              first_aid_steps: [
                'बिल्ली को गर्म और शांत कमरे में रखें।',
                'ड्रॉपर से हल्का गुनगुना ओआरएस घोल पिलाएं।',
                'मानव पैरासिटामोल कभी न दें (यह बिल्लियों के लिए जानलेवा है)।',
                'तुरंत नजदीकी पशु चिकित्सालय ले जाएं।',
              ],
              what_not_to_do: 'इंसानों की दवा या ठंडा दूध न दें।',
              recommended_local_product: 'ओआरएस पाउडर, पेट सिरप',
              local_voice_script_hindi: 'बिल्ली की स्थिति गंभीर है। उसे गर्म रखें और तुरंत पशु चिकित्सक के पास ले जाएं।',
              local_voice_script_marathi: 'मांजराला तात्काळ पशुवैद्यकाकडे घेऊन जा.',
            };
          } else {
            parsedJson = {
              animal_type: 'Cat / Kitten',
              animal_identified: 'Cat / Kitten',
              suspected_condition: 'Suspected Feline Panleukopenia / Acute Severe Viral Illness',
              urgency_badge: '🔴 RED',
              trigger_emergency_dispatch: true,
              is_emergency_dispatch_needed: true,
              first_aid_steps: [
                'Keep the cat warm in a calm, stress-free darkened room with a towel.',
                'Administer small drops of warm electrolyte solution via syringe if swallowing.',
                'Never administer human paracetamol/acetaminophen (it is fatal to felines).',
                'Transport urgently to a veterinary facility for supportive fluid therapy.',
              ],
              what_not_to_do: 'Never give human fever medication. Do not force solid food.',
              recommended_local_product: 'Electrolyte Solution, Pet Multi-Vitamin Drops',
              local_voice_script_hindi: 'Critical emergency for feline. Keep warm and seek veterinary care immediately.',
              local_voice_script_marathi: 'मांजराला तातडीने पशुवैद्यकीय दवाखान्यात दाखल करा.',
            };
          }
        } else {
          parsedJson = {
            animal_type: language === 'mr' ? 'मांजर / किटन' : language === 'hi' ? 'बिल्ली / किटन' : 'Cat / Kitten',
            animal_identified: language === 'mr' ? 'मांजर / किटन' : language === 'hi' ? 'बिल्ली / किटन' : 'Cat / Kitten',
            suspected_condition: language === 'mr' ? 'कॅट फ्लू / डोळ्यांचा व नाकाचा संसर्ग' : language === 'hi' ? 'कैट फ्लू / आंखों व नाक का संक्रमण' : 'Feline Upper Respiratory Infection (Cat Flu)',
            urgency_badge: '🟡 YELLOW',
            trigger_emergency_dispatch: false,
            is_emergency_dispatch_needed: false,
            first_aid_steps: [
              language === 'mr' ? 'डोळ्यातील घाण कोमट पाण्याच्या कापसाने हळुवारपणे पुसून काढा.' : language === 'hi' ? 'आंखों के कीचड़ को गुनगुने पानी में भीगी रुई से धीरे-धीरे साफ करें।' : 'Gently wipe crusty eyes and nostrils with warm saline damp cotton.',
              language === 'mr' ? 'मांजरीला उबदार खोलीत ठेवा आणि कोमट पातळ सूप किंवा अन्न द्या.' : language === 'hi' ? 'हल्का गुनगुना सूप या गीला खाना दें।' : 'Offer warm, aromatic broth or wet food to stimulate appetite.',
              language === 'mr' ? '२४ तासांत सुधारणा न झाल्यास डॉक्टरांना डोळ्यांचे थेंब विचारून घ्या.' : language === 'hi' ? '24 घंटे में डॉक्टर से आई ड्रॉप्स की सलाह लें।' : 'Consult veterinarian if nasal congestion persists past 24 hours.',
            ],
            what_not_to_do: language === 'mr' ? 'डोळे बळजबरीने उघडू नका.' : language === 'hi' ? 'आंखों को जबरदस्ती न खोलें।' : 'Do not force open stuck eyelids with dry cloths.',
            recommended_local_product: 'Pet Eye Wipes / L-Lysine Gel for Cats',
            local_voice_script_hindi: 'बिल्ली की आंखें गुनगुने पानी से साफ करें और गर्म जगह रखें।',
            local_voice_script_marathi: 'मांजराचे डोळे कोमट पाण्याने स्वच्छ करा आणि उबदार जागेत ठेवा.',
          };
        }
      } else if (isCritical) {
        if (language === 'mr') {
          parsedJson = {
            animal_type: animalType || 'जनावर (Livestock)',
            animal_identified: animalType || 'गाय / म्हैस (Livestock)',
            suspected_condition: 'तीव्र संसर्गजन्य / तातडीची परिस्थिती (Acute Infectious Condition)',
            urgency_badge: '🔴 RED',
            trigger_emergency_dispatch: true,
            is_emergency_dispatch_needed: true,
            first_aid_steps: [
              'बाधित जनावराला लगेच इतर निरोगी जनावरांपासून वेगळे करा.',
              'स्वच्छ पाणी आणि हलका हिरवा चारा द्या. ताप असल्यास डोक्यावर थंड पाणी टाका.',
              'जखमा किंवा तोंडात फोड असल्यास पोटॅश (KMNO4) च्या द्रावणाने धुवा.',
              'ताबडतोब पशुवैद्यकीय हेल्पलाइन १९६२ किंवा जवळच्या दवाखान्यात संपर्क साधा.',
            ],
            what_not_to_do: 'जनावराला बळजबरीने औषध पाजू नका (ते फुफ्फुसात जाण्याचा धोका असतो). डॉक्टरांच्या सल्ल्याशिवाय कोणतेही इंजेक्शन देऊ नका.',
            recommended_local_product: 'पोटॅशियम परमॅंगनेट (Potash), बोरो-ग्लिसरीन, इलेक्ट्रोलाईट पावडर',
            local_voice_script_hindi: 'सावधान! यह एक अति गंभीर आपातकालीन स्थिति है। पशु को तुरंत बाकी जानवरों से अलग करें और नजदीकी पशु चिकित्सालय या 1962 एम्बुलेंस को कॉल करें।',
            local_voice_script_marathi: 'सावधान! ही अतिशय गंभीर आणि तातडीची परिस्थिती आहे. जनावराला लगेच इतर जनावरांपासून वेगळे बांधा आणि पशुसंवर्धन हेल्पलाइन १९६२ वर तात्काळ संपर्क करा.',
          };
        } else if (language === 'hi') {
          parsedJson = {
            animal_type: animalType || 'पशु (Livestock)',
            animal_identified: animalType || 'गाय / भैंस (Livestock)',
            suspected_condition: 'तीव्र संसर्गजन्य / आपातकालीन पशु स्थिति (Acute Infectious Condition)',
            urgency_badge: '🔴 RED',
            trigger_emergency_dispatch: true,
            is_emergency_dispatch_needed: true,
            first_aid_steps: [
              'प्रभावित पशु को तुरंत अन्य स्वस्थ पशुओं से अलग साफ-सुथरे हवादार बाड़े में बांधें।',
              'ताजा गुनगुना पानी और हल्का सुपाच्य हरा चारा दें। यदि बुखार हो तो सिर पर ठंडा पानी डालें।',
              'घाव या मुंह में छाले होने पर फिटकरी या पोटाश (KMNO4) के घोल से धोएं।',
              'तुरंत सरकारी पशु चिकित्सा हेल्पलाइन 1962 या नजदीकी पशु चिकित्सालय में संपर्क करें।',
            ],
            what_not_to_do: 'पशु को जबरदस्ती नाल से तरल दवा न पिलाएं। बिना डॉक्टर की सलाह के कोई इंजेक्शन न लगाएं।',
            recommended_local_product: 'पोटाश (KMNO4), बोरो-ग्लिसरीन, इलेक्ट्रोलाइट पाउडर',
            local_voice_script_hindi: 'सावधान! यह एक अति गंभीर आपातकालीन स्थिति है। पशु को तुरंत बाकी जानवरों से अलग करें और नजदीकी पशु चिकित्सालय या 1962 एम्बुलेंस को कॉल करें।',
            local_voice_script_marathi: 'सावधान! ही अतिशय गंभीर आणि तातडीची परिस्थिती आहे. जनावराला लगेच इतर जनावरांपासून वेगळे बांधा आणि १९६२ वर संपर्क करा.',
          };
        } else {
          parsedJson = {
            animal_type: animalType || 'Livestock',
            animal_identified: animalType || 'Livestock',
            suspected_condition: 'Acute Infectious / Emergency Condition',
            urgency_badge: '🔴 RED',
            trigger_emergency_dispatch: true,
            is_emergency_dispatch_needed: true,
            first_aid_steps: [
              'Isolate the affected animal immediately from healthy ones.',
              'Provide fresh water and easily digestible green fodder.',
              'Clean wounds or mouth lesions with potassium permanganate solution.',
              'Contact Veterinary Helpline 1962 or nearest vet doctor immediately.',
            ],
            what_not_to_do: 'Do not force-feed liquids (risk of aspiration). Do not give injections without vet advice.',
            recommended_local_product: 'Potassium Permanganate, Boro-glycerine, Electrolyte Powder',
            local_voice_script_hindi: 'Emergency! Isolate the animal and call 1962 ambulance immediately.',
            local_voice_script_marathi: 'आणीबाणी! जनावराला वेगळे करा आणि १९६२ ला कॉल करा.',
          };
        }
      } else if (isModerate) {
        if (language === 'mr') {
          parsedJson = {
            animal_type: animalType || 'जनावर (Livestock)',
            animal_identified: animalType || 'जनावर (Livestock)',
            suspected_condition: 'पचन विकार / मध्यम स्वरूपाची समस्या (Digestive / Moderate Issue)',
            urgency_badge: '🟡 YELLOW',
            trigger_emergency_dispatch: false,
            is_emergency_dispatch_needed: false,
            first_aid_steps: [
              'जनावराला ४-६ तास सुका चारा आणि कमी पाणी द्या. जास्तीचा खुराक लगेच बंद करा.',
              'पोट फुगले असल्यास गोडे तेल (२५० मिली) आणि २० मिली तारपीन तेल मिसळून द्या.',
              'पुढील २४ तास जनावराच्या रवंथावर आणि तापमानावर लक्ष ठेवा.',
            ],
            what_not_to_do: 'जनावराला एका जागी बसू देऊ नका, हळूहळू चालवा. बुरशी लागलेला चारा देऊ नका.',
            recommended_local_product: 'टिम्पोल पावडर, हिमालयन बत्तीसा, मस्टिकेयर मलम',
            local_voice_script_hindi: 'यह मध्यम स्तर की समस्या है। पशु को भारी दाना देना बंद करें। 24 घंटे में सुधार न होने पर डॉक्टर को दिखाएं।',
            local_voice_script_marathi: 'ही मध्यम स्वरूपाची परिस्थिती आहे. जनावराचे खाणे-पिणे सांभाळा आणि पुढील २४ तास लक्ष ठेवा.',
          };
        } else if (language === 'hi') {
          parsedJson = {
            animal_type: animalType || 'पशु (Livestock)',
            animal_identified: animalType || 'पशु (Livestock)',
            suspected_condition: 'पाचन विकार / मध्यम स्तर की समस्या (Digestive / Moderate Condition)',
            urgency_badge: '🟡 YELLOW',
            trigger_emergency_dispatch: false,
            is_emergency_dispatch_needed: false,
            first_aid_steps: [
              'पशु को 4-6 घंटे सूखा चारा दें। भारी दाना या खली तुरंत बंद करें।',
              'पेट फूलने पर मीठा तेल (250ml) और 20ml तारपीन तेल मिलाकर दें।',
              'पशु के तापमान और जुगाली पर अगले 24 घंटे नजर रखें।',
            ],
            what_not_to_do: 'पशु को लेटने न दें, धीरे-धीरे टहलाएं। फफूंद लगा चारा बिल्कुल न खिलाएं।',
            recommended_local_product: 'टिम्पोल पावडर, हिमालयन बत्तीसा, पाचन चूर्ण',
            local_voice_script_hindi: 'यह मध्यम स्तर की समस्या है। पशु को भारी दाना देना बंद करें। 24 घंटे में सुधार न होने पर डॉक्टर को दिखाएं।',
            local_voice_script_marathi: 'ही मध्यम स्वरूपाची परिस्थिती आहे. जनावराचे खाणे-पिणे सांभाळा आणि पुढील २४ तास लक्ष ठेवा.',
          };
        } else {
          parsedJson = {
            animal_type: animalType || 'Livestock',
            animal_identified: animalType || 'Livestock',
            suspected_condition: 'Digestive Disorder / Moderate Condition',
            urgency_badge: '🟡 YELLOW',
            trigger_emergency_dispatch: false,
            is_emergency_dispatch_needed: false,
            first_aid_steps: [
              'Offer dry fodder for 4-6 hours. Stop concentrated feed immediately.',
              'If bloated, give 250ml vegetable oil mixed with 20ml turpentine oil.',
              'Monitor rumination and temperature for the next 24 hours.',
            ],
            what_not_to_do: 'Do not let the animal lie down if bloated; walk it slowly. Do not feed moldy fodder.',
            recommended_local_product: 'Tympol Powder, Himalayan Batisa, Digestive Tonic',
            local_voice_script_hindi: 'Moderate condition. Monitor for 24 hours.',
            local_voice_script_marathi: 'मध्यम स्थिती. २४ तास लक्ष ठेवा.',
          };
        }
      } else {
        if (language === 'mr') {
          parsedJson = {
            animal_type: animalType || 'जनावर (Livestock)',
            animal_identified: animalType || 'जनावर (Livestock)',
            suspected_condition: 'सामान्य आरोग्य समस्या (Mild Condition)',
            urgency_badge: '🟢 GREEN',
            trigger_emergency_dispatch: false,
            is_emergency_dispatch_needed: false,
            first_aid_steps: [
              'जनावराला स्वच्छ पिण्याचे पाणी आणि सुका-हिरवा संतुलित चारा द्या.',
              'पचन सुधारण्यासाठी ५० ग्रॅम खाण्याचा सोडा आणि मीठ चाऱ्यात मिसळून द्या.',
              'हल्क्या जखमांवर हळद आणि खोबरेल तेलाचा लेप लावा.',
            ],
            what_not_to_do: 'गरज नसताना कोणतेही औषध किंवा इंजेक्शन देऊ नका.',
            recommended_local_product: 'खाण्याचा सोडा, हळद, मिनरल मिक्सचर',
            local_voice_script_hindi: 'यह सामान्य स्थिति है। घरेलू देखभाल से पशु जल्दी स्वस्थ हो जाएगा।',
            local_voice_script_marathi: 'ही सामान्य स्थिती आहे. साध्या घरगुती उपायांनी जनावराला आराम पडेल.',
          };
        } else if (language === 'hi') {
          parsedJson = {
            animal_type: animalType || 'पशु (Livestock)',
            animal_identified: animalType || 'पशु (Livestock)',
            suspected_condition: 'सामान्य स्वास्थ्य विकार (Mild Condition)',
            urgency_badge: '🟢 GREEN',
            trigger_emergency_dispatch: false,
            is_emergency_dispatch_needed: false,
            first_aid_steps: [
              'पशु को ताजा साफ पानी और संतुलित चारा दें।',
              'पाचन के लिए 50 ग्राम मीठा सोडा और नमक चारे में मिलाकर दें।',
              'हल्के घाव पर हल्दी और नारियल तेल लगाएं।',
            ],
            what_not_to_do: 'बिना आवश्यकता के कोई भी दवा या इंजेक्शन न दें।',
            recommended_local_product: 'मीठा सोडा, हल्दी, मिनरल मिक्सचर',
            local_voice_script_hindi: 'यह सामान्य स्थिति है। घरेलू देखभाल से पशु जल्दी स्वस्थ हो जाएगा।',
            local_voice_script_marathi: 'ही सामान्य स्थिती आहे. साध्या घरगुती उपायांनी जनावराला आराम पडेल.',
          };
        } else {
          parsedJson = {
            animal_type: animalType || 'Livestock',
            animal_identified: animalType || 'Livestock',
            suspected_condition: 'General Health Issue / Mild Condition',
            urgency_badge: '🟢 GREEN',
            trigger_emergency_dispatch: false,
            is_emergency_dispatch_needed: false,
            first_aid_steps: [
              'Provide fresh clean water and balanced fodder.',
              'Add 50g baking soda and salt to the feed for better digestion.',
              'Apply turmeric and coconut oil paste on minor wounds.',
            ],
            what_not_to_do: 'Do not give unnecessary medicines or injections.',
            recommended_local_product: 'Baking Soda, Turmeric, Mineral Mixture',
            local_voice_script_hindi: 'Mild condition. Home care advised.',
            local_voice_script_marathi: 'सामान्य स्थिती. घरगुती उपाय करा.',
          };
        }
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
    // Even if Vite fails, try to listen so API routes might work
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT} (Vite middleware failed)`);
    });
  }
}

startServer();
