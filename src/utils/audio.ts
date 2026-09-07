import { VetDiagnosisResponse } from '../types';

export class SpeechVoiceManager {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;
  private static currentAudio: HTMLAudioElement | null = null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static isCurrentlySpeaking = false;
  private static activeLang: 'hi' | 'mr' | 'en' | null = null;
  private static onQueueEnd?: () => void;
  private static onQueueStart?: () => void;
  private static onQueueError?: (err: any) => void;

  /**
   * Split long text into natural sentences (supporting Hindi purna viram '।', periods, newlines, exclamations)
   */
  private static splitIntoSentences(text: string): string[] {
    if (!text) return [];
    // Sanitize text: remove surrounding quotes, markdown bold/bullets
    const cleaned = text
      .replace(/["“”«»]/g, '')
      .replace(/[*_#`~]/g, '')
      .trim();

    if (!cleaned) return [];

    // Split on ।, ., \n, !, ?, ;
    const rawChunks = cleaned.split(/([।\n.!?]+)/);
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
   * Speak full text in Marathi, Hindi, or English.
   * Uses server-side /api/tts endpoint first for authentic pronunciation and cross-device support,
   * falling back automatically to the browser Web Speech API.
   */
  public static async speakText(
    text: string,
    lang: 'hi' | 'mr' | 'en' = 'hi',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): Promise<boolean> {
    this.stop();

    const cleaned = text
      .replace(/["“”«»*_#`~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) {
      if (onEnd) onEnd();
      return false;
    }

    this.activeLang = lang;
    this.isCurrentlySpeaking = true;
    this.onQueueStart = onStart;
    this.onQueueEnd = onEnd;
    this.onQueueError = onError;

    if (this.onQueueStart) {
      this.onQueueStart();
    }

    // Attempt 1: Server streaming audio via /api/tts
    try {
      const audioUrl = `/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(cleaned)}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        this.isCurrentlySpeaking = false;
        this.activeLang = null;
        this.currentAudio = null;
        if (this.onQueueEnd) this.onQueueEnd();
      };

      audio.onerror = (e) => {
        console.warn('HTML5 Audio playback error from /api/tts, using WebSpeech fallback:', e);
        this.currentAudio = null;
        this.fallbackWebSpeech(cleaned, lang);
      };

      await audio.play();
      return true;
    } catch (err) {
      console.warn('Audio.play() error, attempting WebSpeech fallback:', err);
      this.currentAudio = null;
      return this.fallbackWebSpeech(cleaned, lang);
    }
  }

  private static fallbackWebSpeech(text: string, lang: 'hi' | 'mr' | 'en'): boolean {
    if (!this.synth) {
      this.isCurrentlySpeaking = false;
      this.activeLang = null;
      if (this.onQueueError) this.onQueueError(new Error('TTS unavailable'));
      if (this.onQueueEnd) this.onQueueEnd();
      return false;
    }

    try {
      this.synth.cancel();
      if (this.synth.paused) {
        this.synth.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      if (lang === 'mr') {
        utterance.lang = 'mr-IN';
      } else if (lang === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      utterance.rate = 0.93;
      utterance.pitch = 1.0;

      const voices = this.synth.getVoices();
      let matchedVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(lang)
      );
      if (!matchedVoice && lang === 'mr') {
        matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith('hi'));
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      } else if (lang === 'mr') {
        utterance.lang = 'hi-IN';
      }

      utterance.onend = () => {
        this.isCurrentlySpeaking = false;
        this.activeLang = null;
        this.currentUtterance = null;
        if (this.onQueueEnd) this.onQueueEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Utterance error:', e);
        this.isCurrentlySpeaking = false;
        this.activeLang = null;
        this.currentUtterance = null;
        if (this.onQueueEnd) this.onQueueEnd();
        if (this.onQueueError) this.onQueueError(e);
      };

      this.synth.speak(utterance);
      return true;
    } catch (err) {
      console.error('Web Speech fallback failure:', err);
      this.isCurrentlySpeaking = false;
      this.activeLang = null;
      this.currentUtterance = null;
      if (this.onQueueEnd) this.onQueueEnd();
      if (this.onQueueError) this.onQueueError(err);
      return false;
    }
  }

  public static stop() {
    this.isCurrentlySpeaking = false;
    this.activeLang = null;

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch (e) {
        // Ignore audio stop errors
      }
      this.currentAudio = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // Ignore cancel errors
      }
    }

    this.currentUtterance = null;
    if (this.onQueueEnd) {
      const cb = this.onQueueEnd;
      this.onQueueEnd = undefined;
      cb();
    }
  }

  public static isSpeaking(): boolean {
    return this.isCurrentlySpeaking || Boolean(this.currentAudio && !this.currentAudio.paused);
  }

  public static getActiveLang(): 'hi' | 'mr' | 'en' | null {
    return this.activeLang;
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

