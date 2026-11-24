import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { VetDiagnosisResponse } from '../types';
import { triageWithClinicalEngine } from './aiDiagnosis';

dotenv.config({ path: '.env', override: true });

export interface DiagnosisRequest {
  animalType?: string;
  symptomsText?: string;
  imageBase64?: string | null;
  imageMimeType?: string;
  audioBase64?: string | null;
  audioMimeType?: string;
  language?: string;
}

const LANGUAGE_MAP: Record<string, string> = {
  hi: 'Hindi (हिन्दी)',
  mr: 'Marathi (मराठी)',
  en: 'English',
};

// Model configurations for Groq
const GROQ_TEXT_MODEL = 'openai/gpt-oss-120b';
const GROQ_VISION_MODEL = 'qwen/qwen3.8-27b';

function getGroqClient(): Groq {
  dotenv.config({ path: '.env', override: true });
  const apiKey = (process.env.GROQ_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  return new Groq({ apiKey });
}

const SYSTEM_INSTRUCTION = `You are "Vet-Mitra AI Engine", an authoritative, expert veterinary triage assistant specialized in Indian livestock (Cow/Cattle, Buffalo, Goat, Sheep, Horse, Pig) and domestic animals (Poultry/Chicken, Dogs/Puppies, Cats/Kittens).

OBJECTIVE:
Deliver clinically precise, scientifically validated, and practical veterinary triage tailored for Indian farmers and pet owners.

DIAGNOSTIC ACCURACY RULES (CRITICAL):
1. SPECIES CORRELATION:
   - Accurately identify the exact animal category from user input/image.
   - For Goats/Sheep: Differentiate PPR, Enterotoxemia, CCPP, Goat Pox, and Bottle Jaw.
   - For Cattle/Buffalo: Differentiate Lumpy Skin Disease (LSD), Foot and Mouth Disease (FMD), Hemorrhagic Septicemia (HS / गलघोंटू), Black Quarter (BQ / फऱ्या), Clinical Mastitis, Acute Tympany/Bloat, Milk Fever, Babesiosis.
   - For Poultry: Differentiate Newcastle Disease (Ranikhet), Gumboro, Coccidiosis.
   - For Dogs/Puppies: Differentiate Parvovirus, Distemper, Rabies, Tick Fever.
   - For Equines: Differentiate Colic, Tetanus.

2. BALANCED TRIAGE SEVERITY:
   - 🟢 GREEN (Mild / Home Care): Simple indigestion, minor ticks, superficial clean cuts. Safe home/herbal care.
   - 🟡 YELLOW (Moderate Care / Monitor): Acute bloat without choking, moderate diarrhea, clinical mastitis.
   - 🔴 RED (Urgent Veterinary Required): HS, BQ, LSD, FMD, Babesiosis, Downer cow, Parvovirus, Rabies, Colic. Set trigger_emergency_dispatch: true.

OUTPUT FORMAT (Strict JSON):
{
  "animal_type": "Identified Animal",
  "animal_identified": "Identified Animal",
  "suspected_condition": "Condition name",
  "urgency_badge": "🟢 GREEN" | "🟡 YELLOW" | "🔴 RED",
  "trigger_emergency_dispatch": false | true,
  "is_emergency_dispatch_needed": false | true,
  "first_aid_steps": [
    "Step 1",
    "Step 2",
    "Step 3",
    "Step 4"
  ],
  "what_not_to_do": "Life-saving warning against dangerous mistakes",
  "recommended_local_product": "Generic herbal EVM or OTC medicine",
  "local_voice_script_english": "Clean spoken 2-sentence conversational advice in English without emojis",
  "local_voice_script_hindi": "Clean spoken 2-sentence conversational advice in Hindi without emojis",
  "local_voice_script_marathi": "Clean spoken 2-sentence conversational advice in Marathi without emojis"
}`;

/**
 * Call Groq API for veterinary triage
 */
async function callGroq(req: DiagnosisRequest): Promise<{ result: any; model: string }> {
  const groq = getGroqClient();
  const { animalType = '', symptomsText = '', imageBase64, imageMimeType = 'image/jpeg', language = 'en' } = req;
  const targetLangName = LANGUAGE_MAP[language] || 'English';

  const userPrompt = `Farmer Veterinary Inquiry:
- Animal Category: ${animalType || 'Inspect attached image or symptoms'}
- Symptoms: ${symptomsText || 'Inspect attached image or audio'}
- Target Language: ${targetLangName}

Return valid JSON matching the requested schema.`;

  const messages: any[] = [
    {
      role: 'system',
      content: `${SYSTEM_INSTRUCTION}\n\nIMPORTANT: ALL string fields MUST be translated into ${targetLangName}. Return ONLY valid JSON.`,
    },
  ];

  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: userPrompt },
        {
          type: 'image_url',
          image_url: {
            url: `data:${imageMimeType};base64,${cleanBase64}`,
          },
        },
      ],
    });
  } else {
    messages.push({ role: 'user', content: userPrompt });
  }

  const modelToUse = imageBase64 ? GROQ_VISION_MODEL : GROQ_TEXT_MODEL;

  const completion = await groq.chat.completions.create({
    model: modelToUse,
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from Groq');
  return { result: JSON.parse(content), model: modelToUse };
}

/**
 * Centralized AI Router using Groq with On-Device Clinical Rule Engine fallback
 */
export async function routeAiInference(req: DiagnosisRequest): Promise<VetDiagnosisResponse> {
  let rawResult: any = null;
  let usedModel = GROQ_TEXT_MODEL;

  try {
    const response = await callGroq(req);
    rawResult = response.result;
    usedModel = response.model;
  } catch (err: any) {
    console.warn('[AI Router] Groq inference failed, falling back to Clinical Rule Engine:', err?.message || err);
    const fallbackResult = triageWithClinicalEngine(req.animalType || '', req.symptomsText || '', req.language || 'en');
    fallbackResult.diagnostic_note = `Notice: Groq AI experienced a temporary rate limit or connection issue. Routed via On-Device High-Precision Clinical Rule Engine.`;
    return fallbackResult;
  }

  if (rawResult) {
    const isEmergency = Boolean(
      rawResult.is_emergency_dispatch_needed ||
        rawResult.trigger_emergency_dispatch ||
        String(rawResult.urgency_badge).includes('RED') ||
        String(rawResult.urgency_badge).includes('🔴')
    );

    let urgencyBadge = '🟢 GREEN';
    if (isEmergency) {
      urgencyBadge = '🔴 RED';
    } else if (
      String(rawResult.urgency_badge).toUpperCase().includes('YELLOW') ||
      String(rawResult.urgency_badge).includes('🟡')
    ) {
      urgencyBadge = '🟡 YELLOW';
    }

    let doctorStatus = 'Mild condition: Safe home/herbal care provided. Routine monitoring advised.';
    if (isEmergency) {
      doctorStatus = 'Emergency alert sent to nearest Mobile Veterinary Unit (1962). Immediate medical dispatch required!';
    } else if (urgencyBadge === '🟡 YELLOW') {
      doctorStatus = 'Moderate case: Monitor for 24 hours. If symptoms persist or worsen, contact local paravet.';
    }

    const cleanCondition = String(rawResult.suspected_condition || 'Condition Under Observation').replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    const animalLabel = rawResult.animal_identified || rawResult.animal_type || req.animalType || 'Livestock';

    return {
      app_name: 'Vet-Mitra AI',
      animal_identified: animalLabel,
      suspected_condition: cleanCondition,
      urgency_badge: urgencyBadge,
      is_emergency_dispatch_needed: isEmergency,
      trigger_emergency_dispatch: isEmergency,
      doctor_status: doctorStatus,
      first_aid_steps: Array.isArray(rawResult.first_aid_steps) && rawResult.first_aid_steps.length > 0
        ? rawResult.first_aid_steps
        : ['Provide clean water and easily digestible fodder.', 'Keep animal in a dry, ventilated shed.'],
      what_not_to_do: rawResult.what_not_to_do || 'Do not administer human medications without veterinary consultation.',
      recommended_local_product: rawResult.recommended_local_product || 'Electrolyte Powder, Neem Decoction',
      local_voice_script_english:
        rawResult.local_voice_script_english ||
        `Alert: Suspected condition in ${animalLabel} is ${cleanCondition}. Please follow the recommended first-aid steps immediately.`,
      local_voice_script_hindi:
        rawResult.local_voice_script_hindi ||
        `सावधान! ${animalLabel} में ${cleanCondition} के लक्षण पाए गए हैं। तुरंत प्राथमिक उपचार करें और 1962 पर संपर्क करें।`,
      local_voice_script_marathi:
        rawResult.local_voice_script_marathi ||
        `सावधान! ${animalLabel} मध्ये ${cleanCondition} चे लक्षण आढळले आहे. तातडीने प्रथमोपचार करा आणि १९६२ वर संपर्क करा.`,
      source: 'ai_router_groq',
      model_used: usedModel,
      diagnostic_note: `Processed via GROQ (${usedModel}).`,
    };
  }

  return triageWithClinicalEngine(req.animalType || '', req.symptomsText || '', req.language || 'en');
}

/**
 * Test connection for Groq AI provider
 */
export async function testProviderConnection(): Promise<{ success: boolean; message: string; model: string }> {
  try {
    const groq = getGroqClient();
    await groq.chat.completions.create({
      model: GROQ_TEXT_MODEL,
      messages: [{ role: 'user', content: 'Ping connection test. Reply with OK.' }],
      max_tokens: 30,
    });
    return {
      success: true,
      message: `Groq connection successful (${GROQ_TEXT_MODEL})`,
      model: GROQ_TEXT_MODEL,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `GROQ connection failed: ${err?.message || 'Unknown error'}`,
      model: GROQ_TEXT_MODEL,
    };
  }
}
