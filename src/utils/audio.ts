import { VetDiagnosisResponse } from '../types';

export class SpeechVoiceManager {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static isCurrentlySpeaking = false;
  private static queue: string[] = [];
  private static currentLang: 'hi' | 'mr' | 'en' = 'hi';
  private static onQueueEnd?: () => void;
  private static onQueueStart?: () => void;
  private static onQueueError?: (err: any) => void;

  /**
   * Split long text into natural sentences (supporting Hindi purna viram '।', periods, newlines, exclamations)
   */
  private static splitIntoSentences(text: string): string[] {
    if (!text) return [];
    // Split on ।, ., \n, !, ?, ;
    const rawChunks = text.split(/([।\n.!?]+)/);
    const sentences: string[] = [];
    let temp = '';

    for (let i = 0; i < rawChunks.length; i++) {
      const part = rawChunks[i];
      if (/^[।\n.!?]+$/.test(part)) {
        temp += part;
        if (temp.trim().length > 0) {
          sentences.push(temp.trim());
          temp = '';
        }
      } else {
        temp += part;
      }
    }

    if (temp.trim().length > 0) {
      sentences.push(temp.trim());
    }

    return sentences.filter((s) => s.length > 0);
  }

  /**
   * Speak full text (broken down automatically into sentence chunks to prevent browser cutoff)
   */
  public static speakText(
    text: string,
    lang: 'hi' | 'mr' | 'en' = 'hi',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): boolean {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this environment');
      return false;
    }

    try {
      this.stop();

      const chunks = this.splitIntoSentences(text);
      if (chunks.length === 0) {
        if (onEnd) onEnd();
        return false;
      }

      this.queue = chunks;
      this.currentLang = lang;
      this.onQueueStart = onStart;
      this.onQueueEnd = onEnd;
      this.onQueueError = onError;
      this.isCurrentlySpeaking = true;

      if (this.onQueueStart) {
        this.onQueueStart();
      }

      this.playNextInQueue();
      return true;
    } catch (err) {
      console.error('Speech synthesis failure:', err);
      this.isCurrentlySpeaking = false;
      if (onError) onError(err);
      return false;
    }
  }

  private static playNextInQueue() {
    if (!this.synth || !this.isCurrentlySpeaking) return;

    if (this.queue.length === 0) {
      this.isCurrentlySpeaking = false;
      this.currentUtterance = null;
      if (this.onQueueEnd) {
        this.onQueueEnd();
      }
      return;
    }

    const nextChunk = this.queue.shift();
    if (!nextChunk || nextChunk.trim().length === 0) {
      this.playNextInQueue();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(nextChunk);
    this.currentUtterance = utterance;

    // Set voice language
    if (this.currentLang === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (this.currentLang === 'mr') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.93; // Clear natural pacing for Indian rural vernacular
    utterance.pitch = 1.0;

    // Match best available browser voice
    const voices = this.synth.getVoices();
    const targetPrefix =
      this.currentLang === 'hi' ? 'hi' : this.currentLang === 'mr' ? 'mr' : 'en';
    
    // Priority search: exact language prefix, fallback to hi if mr not found on some devices
    let matchedVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(targetPrefix)
    );
    if (!matchedVoice && this.currentLang === 'mr') {
      // Many Android/Chromium browsers pronounce Marathi well using Hindi phoneme engines
      matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith('hi'));
    }
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      this.playNextInQueue();
    };

    utterance.onerror = (e) => {
      // If user stopped or cancelled, ignore
      if (e.error === 'canceled' || e.error === 'interrupted') {
        this.isCurrentlySpeaking = false;
        return;
      }
      console.warn('Utterance step notice:', e);
      // Continue next sentence even if one chunk failed
      this.playNextInQueue();
    };

    this.synth.speak(utterance);
  }

  public static stop() {
    this.isCurrentlySpeaking = false;
    this.queue = [];
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  public static isSpeaking(): boolean {
    return this.isCurrentlySpeaking || Boolean(this.synth && this.synth.speaking);
  }
}

/**
 * Builds a comprehensive, natural spoken audio script in Hindi or Marathi
 * covering ALL triage findings: identified animal, suspected condition,
 * urgency alert level, doctor dispatch notice, all step-by-step first aid steps,
 * critical warning of what NOT to do, recommended store products, and helpline.
 */
export function buildCompleteTriageNarration(
  diagnosis: VetDiagnosisResponse,
  lang: 'hi' | 'mr'
): string {
  const badgeStr = (diagnosis.urgency_badge || '').toUpperCase();
  const isRed =
    badgeStr.includes('RED') ||
    badgeStr.includes('🔴') ||
    Boolean(diagnosis.is_emergency_dispatch_needed);
  const isYellow =
    !isRed && (badgeStr.includes('YELLOW') || badgeStr.includes('🟡'));

  if (lang === 'hi') {
    const parts: string[] = [];

    // Header & Identification
    parts.push(`पशु स्वास्थ्य जाँच रिपोर्ट।`);
    parts.push(
      `पशु का प्रकार: ${diagnosis.animal_identified || 'पशु'}।`
    );
    parts.push(
      `संभावित बीमारी या समस्या: ${diagnosis.suspected_condition}।`
    );

    // Urgency Alert & Action
    if (isRed) {
      parts.push(
        `आपातकालीन स्थिति: लाल अलर्ट। यह एक अति गंभीर आपातकालीन स्थिति है। तुरंत नजदीकी सरकारी पशु चिकित्सालय या मोबाइल पशु चिकित्सा एम्बुलेंस हेल्पलाइन 1962 पर संपर्क करें।`
      );
    } else if (isYellow) {
      parts.push(
        `आपातकालीन स्थिति: पीला अलर्ट। यह मध्यम स्तर की स्थिति है। पशु पर 24 घंटे निरंतर निगरानी रखें और घरेलू उपचार शुरू करें। यदि सुधार न हो तो डॉक्टर से परामर्श लें।`
      );
    } else {
      parts.push(
        `आपातकालीन स्थिति: हरा अलर्ट। यह सामान्य स्थिति है। सामान्य घरेलू प्राथमिक देखभाल पर्याप्त है।`
      );
    }

    // AI Summary script if available
    if (diagnosis.local_voice_script_hindi) {
      parts.push(diagnosis.local_voice_script_hindi);
    }

    // First Aid Steps (Complete step by step)
    if (diagnosis.first_aid_steps && diagnosis.first_aid_steps.length > 0) {
      parts.push(`प्राथमिक उपचार के जरूरी कदम इस प्रकार हैं:`);
      diagnosis.first_aid_steps.forEach((step, idx) => {
        parts.push(`कदम नंबर ${idx + 1}: ${step}।`);
      });
    }

    // What NOT to do
    if (diagnosis.what_not_to_do) {
      parts.push(
        `सावधानी और क्या न करें: ${diagnosis.what_not_to_do}।`
      );
    }

    // Recommended local product
    if (diagnosis.recommended_local_product) {
      parts.push(
        `निकटतम डेयरी सहकारी समिति या मेडिकल स्टोर से सुझाई गई सामग्री: ${diagnosis.recommended_local_product}।`
      );
    }

    // Closing helpline reminder
    parts.push(
      `किसी भी आपातकालीन स्थिति में तुरंत पशुपालन टोल फ्री हेल्पलाइन 1962 पर कॉल करें।`
    );

    return parts.join(' ');
  } else {
    // Marathi Script
    const parts: string[] = [];

    // Header & Identification
    parts.push(`पशु तपासणी व आरोग्य अहवाल.`);
    parts.push(
      `जनावराचा प्रकार: ${diagnosis.animal_identified || 'जनावर'}.`
    );
    parts.push(
      `संभाव्य आजार किंवा स्थिती: ${diagnosis.suspected_condition}.`
    );

    // Urgency Alert & Action
    if (isRed) {
      parts.push(
        `आणीबाणी पातळी: लाल अलर्ट. ही अतिशय गंभीर आणि तातडीची परिस्थिती आहे. कृपया लगेच जवळच्या पशुवैद्यकीय डॉक्टरांशी संपर्क साधा किंवा हेल्पलाइन 1962 वर तात्काळ कॉल करा.`
      );
    } else if (isYellow) {
      parts.push(
        `आणीबाणी पातळी: पिवळा अलर्ट. ही मध्यम स्वरूपाची परिस्थिती आहे. जनावरावर पुढील 24 तास काळजीपूर्वक देखरेख ठेवा. लक्षणे वाढल्यास त्वरित डॉक्टरांचा सल्ला घ्या.`
      );
    } else {
      parts.push(
        `आणीबाणी पातळी: हिरवा अलर्ट. ही सामान्य स्थिती आहे. साधे व सुरक्षित घरगुती प्राथमिक उपचार पुरेसे आहेत.`
      );
    }

    // AI Summary script if available
    if (diagnosis.local_voice_script_marathi) {
      parts.push(diagnosis.local_voice_script_marathi);
    }

    // First Aid Steps (Complete step by step)
    if (diagnosis.first_aid_steps && diagnosis.first_aid_steps.length > 0) {
      parts.push(`प्राथमिक उपचाराच्या आवश्यक पायऱ्या:`);
      diagnosis.first_aid_steps.forEach((step, idx) => {
        parts.push(`पायरी क्रमांक ${idx + 1}: ${step}.`);
      });
    }

    // What NOT to do
    if (diagnosis.what_not_to_do) {
      parts.push(
        `महत्त्वाची काळजी आणि काय करू नये: ${diagnosis.what_not_to_do}.`
      );
    }

    // Recommended local product
    if (diagnosis.recommended_local_product) {
      parts.push(
        `जवळच्या डेअरी सोसायटी किंवा मेडिकल स्टोअरमधून शिफारस केलेले औषध किंवा साहित्य: ${diagnosis.recommended_local_product}.`
      );
    }

    // Closing helpline reminder
    parts.push(
      `कोणत्याही तातडीच्या मदतीसाठी पशुसंवर्धन हेल्पलाइन 1962 वर त्वरित कॉल करा.`
    );

    return parts.join(' ');
  }
}

