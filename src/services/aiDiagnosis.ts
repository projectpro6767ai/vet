import { GoogleGenAI, Type } from '@google/genai';
import { VetDiagnosisResponse } from '../types';
import { detectSpecies, CLINICAL_RULES, getGeneralIndigestionDiagnosis } from './clinicalKnowledge';

export interface DiagnosisRequest {
  animalType?: string;
  symptomsText?: string;
  imageBase64?: string | null;
  imageMimeType?: string;
  audioBase64?: string | null;
  audioMimeType?: string;
  language?: string;
}

// Map language codes to readable names
const LANGUAGE_MAP: Record<string, string> = {
  hi: 'Hindi (हिन्दी)',
  mr: 'Marathi (मराठी)',
  en: 'English',
};

/**
 * Executes veterinary triage using Google Gemini AI models.
 * If API key is missing or model calls fail, falls back gracefully to the comprehensive clinical engine.
 */
export async function triageWithGemini(req: DiagnosisRequest): Promise<VetDiagnosisResponse> {
  const {
    animalType = '',
    symptomsText = '',
    imageBase64,
    imageMimeType = 'image/jpeg',
    audioBase64,
    audioMimeType = 'audio/webm',
    language = 'en',
  } = req;

  // Retrieve API key from environment dynamically
  const apiKey =
    process.env.GEMINI_API_KEY ||
    (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) ||
    '';

  const targetLangName = LANGUAGE_MAP[language] || 'English';

  // If no Gemini API key is configured in this environment (e.g. deployed on Vercel without env vars)
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('GEMINI_API_KEY is not configured. Running High-Precision Clinical Rule Engine fallback.');
    const ruleResult = triageWithClinicalEngine(animalType, symptomsText, language);
    ruleResult.diagnostic_note =
      'Generated via On-Device High-Precision Clinical Rule Engine. To activate Gemini AI Multimodal Vision & Audio, add GEMINI_API_KEY to your Vercel Project Settings > Environment Variables.';
    return ruleResult;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are "Vet-Mitra AI Engine", an authoritative, expert veterinary triage assistant specialized in Indian livestock (Cow/Cattle, Buffalo, Goat, Sheep, Horse, Pig) and domestic animals (Poultry/Chicken, Dogs/Puppies, Cats/Kittens).

OBJECTIVE:
Deliver clinically precise, scientifically validated, and practical veterinary triage tailored for Indian farmers and pet owners.

DIAGNOSTIC ACCURACY RULES (CRITICAL):
1. SPECIES CORRELATION:
   - Accurately identify the exact animal category from user input/image (${animalType || 'from image or text'}).
   - For Goats/Sheep: Differentiate Peste des Petits Ruminants (PPR), Enterotoxemia (Pulpy Kidney), Contagious Caprine Pleuropneumonia (CCPP), Goat Pox, and Bottle Jaw (Haemonchosis). Do NOT misidentify goats as cattle.
   - For Cattle/Buffalo: Differentiate Lumpy Skin Disease (LSD), Foot and Mouth Disease (FMD), Hemorrhagic Septicemia (HS / गलघोंटू / घटसर्प), Black Quarter (BQ / फऱ्या / लंगड़ा बुखार), Clinical Mastitis, Acute Tympany/Bloat, Milk Fever (Hypocalcemia), Babesiosis (Tick Fever / Red Water), and Uterine Prolapse.
   - For Poultry: Differentiate Newcastle Disease (Ranikhet / ND - torticollis/twisted neck), Infectious Bursal Disease (Gumboro / IBD), Coccidiosis (bloody droppings), and Fowl Pox.
   - For Dogs/Puppies: Differentiate Canine Parvovirus (foul bloody diarrhea/vomiting in young pups - life threatening), Canine Distemper, Rabies (hyper-salivation, aggression/jaw drop - ZOONOTIC DANGER), and Tick Fever.
   - For Equines: Differentiate Equine Colic (rolling, pawing, sweating - critical surgical/medical emergency) and Tetanus.

2. SPECIFIC HALLMARK SYMPTOM DIFFERENTIATIONS:
   - High fever + swollen throat/neck + loud snoring/gasping breathing in cattle = Hemorrhagic Septicemia (HS / घटसर्प / गलघोंटू) -> 🔴 RED EMERGENCY.
   - High fever + acute lameness + hot painful thigh/shoulder swelling that crackles (crepitation) when pressed = Black Quarter (BQ / फऱ्या / लंगड़ा बुखार) -> 🔴 RED EMERGENCY.
   - High fever + red/coffee-colored urine + tick infestation = Babesiosis / Tick Fever (लाल पेशाब / रक्त मूतणे) -> 🔴 RED EMERGENCY.
   - Freshly calved cow + unable to stand + S-neck curve + cold ears = Milk Fever / Hypocalcemia (मिल्क फिव्हर) -> 🔴 RED EMERGENCY.
   - Distended left flank like a tight drum + kicking at belly + laboured breathing = Acute Bloat / Tympany (अफरा / पोटफुगी) -> 🟡 YELLOW (or 🔴 RED if suffocating).
   - Swollen, hot, firm udder + clots/flakes or blood in milk = Clinical Mastitis (कासदाह / थनैल) -> 🟡 YELLOW (or 🔴 RED if recumbent septic).
   - Multiple firm circumscribed round skin nodules all over body = Lumpy Skin Disease (LSD) -> 🔴 RED.
   - Frothing at mouth + blisters/sores on tongue, dental pad, and hoof clefts = Foot and Mouth Disease (FMD) -> 🔴 RED.
   - Animal ingested pesticide-sprayed crops / fertilizer / poisonous plant + muscle tremors + convulsions + frothing = Acute Toxicity / Poisoning -> 🔴 RED.

3. BALANCED TRIAGE SEVERITY:
   - 🟢 GREEN (Mild / Home Care): Simple indigestion, minor ticks, superficial clean cuts, mild lack of appetite without fever. Safe home/herbal care (NDDB Ethnoveterinary EVM formulations). Set trigger_emergency_dispatch: false.
   - 🟡 YELLOW (Moderate Care / Monitor): Acute bloat without choking, moderate diarrhea, clinical mastitis, respiratory cough without throat swelling, non-spreading skin lesions. First aid + paravet consultation. Set trigger_emergency_dispatch: false.
   - 🔴 RED (Urgent Veterinary Required): Hemorrhagic Septicemia (HS), Black Quarter (BQ), LSD, FMD, Babesiosis, Downer cow, Prolapse, Parvovirus, Newcastle neck paralysis, Rabies, Equine Colic, acute poisoning, fever >105°F. Set trigger_emergency_dispatch: true.

4. LANGUAGE REQUIREMENT:
   The user has requested the output in ${targetLangName}. 
   ALL JSON string fields (animal_type, animal_identified, suspected_condition, first_aid_steps, what_not_to_do, recommended_local_product) MUST be written in ${targetLangName}.

OUTPUT FORMAT (Strict JSON):
{
  "animal_type": "Identified Animal (in ${targetLangName})",
  "animal_identified": "Identified Animal (in ${targetLangName})",
  "suspected_condition": "Condition name (in ${targetLangName})",
  "urgency_badge": "🟢 GREEN" | "🟡 YELLOW" | "🔴 RED",
  "trigger_emergency_dispatch": false | true,
  "is_emergency_dispatch_needed": false | true,
  "first_aid_steps": [
    "Step 1 (in ${targetLangName})",
    "Step 2 (in ${targetLangName})",
    "Step 3 (in ${targetLangName})",
    "Step 4 (in ${targetLangName})"
  ],
  "what_not_to_do": "Life-saving warning against dangerous common mistakes (in ${targetLangName})",
  "recommended_local_product": "Generic herbal EVM product or standard Indian veterinary OTC medicine (in ${targetLangName})",
  "local_voice_script_english": "Clean spoken 2-sentence conversational advice in English for voice readout without any emojis or markdown symbols",
  "local_voice_script_hindi": "Clean spoken 2-sentence conversational advice in Hindi without any emojis",
  "local_voice_script_marathi": "Clean spoken 2-sentence conversational advice in Marathi without any emojis"
}`;

    const promptParts: any[] = [];

    // Multimodal image part
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      promptParts.push({
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    // Multimodal audio part
    if (audioBase64) {
      const cleanAudio = audioBase64.replace(/^data:[^;]+;base64,/, '');
      promptParts.push({
        inlineData: {
          mimeType: audioMimeType || 'audio/webm',
          data: cleanAudio,
        },
      });
    }

    const userPromptText = `Farmer Veterinary Inquiry:
- Animal Category / Stated: ${animalType || 'Inspect attached image or symptoms'}
- Farmer Reported Symptoms: ${symptomsText || 'Please visually inspect the attached image or listen to audio'}
- Preferred Language: ${language}

Provide an accurate, balanced veterinary triage diagnosis based strictly on the symptoms and visual evidence.`;

    promptParts.push({
      text: userPromptText,
    });

    const modelCandidates = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let response: any = null;
    let usedModel = 'gemini-3.8-flash';

    for (const modelName of modelCandidates) {
      try {
        usedModel = modelName;
        response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: promptParts,
          },
          config: {
            systemInstruction,
            temperature: 0.1,
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
                local_voice_script_english: {
                  type: Type.STRING,
                  description: 'Fluent spoken English advice for voice readout without emojis',
                },
                local_voice_script_hindi: { type: Type.STRING },
                local_voice_script_marathi: { type: Type.STRING },
              },
              required: [
                'suspected_condition',
                'urgency_badge',
                'first_aid_steps',
                'what_not_to_do',
                'recommended_local_product',
                'local_voice_script_english',
                'local_voice_script_hindi',
                'local_voice_script_marathi',
              ],
            },
          },
        });

        if (response && response.text) {
          break;
        }
      } catch (err) {
        console.warn(`Model ${modelName} call failed, trying next candidate:`, err);
      }
    }

    if (response && response.text) {
      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(response.text);
      } catch {
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedJson = JSON.parse(cleaned);
      }

      if (parsedJson) {
        const isEmergency = Boolean(
          parsedJson.is_emergency_dispatch_needed ||
            parsedJson.trigger_emergency_dispatch ||
            String(parsedJson.urgency_badge).includes('RED') ||
            String(parsedJson.urgency_badge).includes('🔴')
        );

        let urgencyBadge = '🟢 GREEN';
        if (isEmergency) {
          urgencyBadge = '🔴 RED';
        } else if (
          String(parsedJson.urgency_badge).toUpperCase().includes('YELLOW') ||
          String(parsedJson.urgency_badge).includes('🟡')
        ) {
          urgencyBadge = '🟡 YELLOW';
        }

        let doctorStatus = 'Mild condition: Safe home/herbal care provided. Routine monitoring advised.';
        if (isEmergency) {
          doctorStatus = 'Emergency alert sent to nearest Mobile Veterinary Unit (1962). Immediate medical dispatch required!';
        } else if (urgencyBadge === '🟡 YELLOW') {
          doctorStatus = 'Moderate case: Monitor for 24 hours. If symptoms persist or worsen, contact local paravet.';
        }

        const cleanCondition = String(parsedJson.suspected_condition || 'Condition Under Observation').replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
        const animalLabel = parsedJson.animal_identified || parsedJson.animal_type || animalType || 'Livestock';

        return {
          app_name: 'Vet-Mitra AI',
          animal_identified: animalLabel,
          suspected_condition: cleanCondition,
          urgency_badge: urgencyBadge,
          is_emergency_dispatch_needed: isEmergency,
          trigger_emergency_dispatch: isEmergency,
          doctor_status: doctorStatus,
          first_aid_steps: Array.isArray(parsedJson.first_aid_steps) && parsedJson.first_aid_steps.length > 0
            ? parsedJson.first_aid_steps
            : ['Provide clean water and easily digestible fodder.', 'Keep animal in a dry, ventilated shed.'],
          what_not_to_do: parsedJson.what_not_to_do || 'Do not administer human medications without veterinary consultation.',
          recommended_local_product: parsedJson.recommended_local_product || 'Electrolyte Powder, Neem Decoction',
          local_voice_script_english:
            parsedJson.local_voice_script_english ||
            `Alert: Suspected condition in ${animalLabel} is ${cleanCondition}. Please follow the recommended first-aid steps immediately.`,
          local_voice_script_hindi:
            parsedJson.local_voice_script_hindi ||
            `सावधान! ${animalLabel} में ${cleanCondition} के लक्षण पाए गए हैं। तुरंत प्राथमिक उपचार करें और 1962 पर संपर्क करें।`,
          local_voice_script_marathi:
            parsedJson.local_voice_script_marathi ||
            `सावधान! ${animalLabel} मध्ये ${cleanCondition} चे लक्षण आढळले आहे. तातडीने प्रथमोपचार करा आणि १९६२ वर संपर्क करा.`,
          source: 'gemini_ai',
          model_used: usedModel,
        };
      }
    }
  } catch (err: any) {
    console.error('Gemini AI inference encountered error:', err);
  }

  // Graceful fallback to High-Precision Clinical Rule Engine
  const fallback = triageWithClinicalEngine(animalType, symptomsText, language);
  fallback.diagnostic_note =
    'Diagnosis generated using On-Device High-Precision Clinical Engine. To enable Gemini AI Multimodal Vision & Audio on Vercel, ensure GEMINI_API_KEY is configured in Vercel Project Settings.';
  return fallback;
}

/**
 * High-Precision Multi-Lingual Veterinary Clinical Rule Engine
 * Accurately classifies 20+ distinct conditions across cattle, buffalo, goat, sheep, poultry, dog, cat, horse.
 */
export function triageWithClinicalEngine(
  animalType: string,
  symptomsText: string,
  language: string = 'en'
): VetDiagnosisResponse {
  const query = `${animalType || ''} ${symptomsText || ''}`.toLowerCase();
  const lang: 'mr' | 'hi' | 'en' = language === 'mr' ? 'mr' : language === 'hi' ? 'hi' : 'en';
  const species = detectSpecies(query);

  for (const rule of CLINICAL_RULES) {
    if (rule.match(query, species)) {
      const diag = rule.diagnose(lang);
      diag.source = 'clinical_rule_engine';
      return diag;
    }
  }

  return getGeneralIndigestionDiagnosis(lang);
}
