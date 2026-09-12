import { VetDiagnosisResponse } from '../types';

/**
 * Phonetic sanitization to ensure high-fidelity, natural pronunciation
 * without emojis, acronym stutters, or unpronounceable symbols.
 */
export function sanitizeForSpeech(text: string, lang: 'hi' | 'mr' | 'en'): string {
  if (!text) return '';

  let res = text;

  // 1. Remove all emojis (red circles, warning signs, ambulances, animals, etc.)
  res = res.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '');

  // 2. Remove markdown syntax, quotes, and structural brackets
  res = res
    .replace(/[*_#`~>]/g, ' ')
    .replace(/["“”«»]/g, ' ')
    .replace(/[\[\]{}()]/g, ' ')
    .replace(/[-–—]{2,}/g, ' ')
    .replace(/\s+/g, ' ');

  // 3. Language-specific phonetic expansions
  if (lang === 'mr') {
    res = res
      .replace(/\bLSD\b/gi, 'लंपी त्वचा आजार')
      .replace(/\bFMD\b/gi, 'लाळ्या खुरकूत आजार')
      .replace(/\bHS\b/gi, 'घटसर्प आजार')
      .replace(/\bBQ\b/gi, 'फऱ्या आजार')
      .replace(/\bIV\b/gi, 'नसामधून सलाईन')
      .replace(/\bORS\b/gi, 'ओआरएस पाण्याचे द्रावण')
      .replace(/\b1962\b/g, 'एकोणीसशे बासष्ठ (१९६२)')
      .replace(/(\d+)\s*\/\s*(\d+)/g, '$1 पैकी $2')
      .replace(/\bRED\b/gi, 'अति तातडीचा लाल')
      .replace(/\bYELLOW\b/gi, 'मध्यम पिवळा')
      .replace(/\bGREEN\b/gi, 'सामान्य हिरवा');
  } else if (lang === 'hi') {
    res = res
      .replace(/\bLSD\b/gi, 'लंपी स्किन बीमारी')
      .replace(/\bFMD\b/gi, 'खुरपका मुंहपका बीमारी')
      .replace(/\bHS\b/gi, 'गलघोंटू बीमारी')
      .replace(/\bBQ\b/gi, 'लंगड़ा बुखार')
      .replace(/\bIV\b/gi, 'नस में सलाइन')
      .replace(/\bORS\b/gi, 'ओआरएस घोल')
      .replace(/\b1962\b/g, 'उन्नीस सौ बासठ (१९६२)')
      .replace(/(\d+)\s*\/\s*(\d+)/g, '$1 में से $2')
      .replace(/\bRED\b/gi, 'अति गंभीर लाल')
      .replace(/\bYELLOW\b/gi, 'मध्यम पीला')
      .replace(/\bGREEN\b/gi, 'सामान्य हरा');
  } else {
    // English
    res = res
      .replace(/\bLSD\b/gi, 'Lumpy Skin Disease')
      .replace(/\bFMD\b/gi, 'Foot and Mouth Disease')
      .replace(/\bHS\b/gi, 'Haemorrhagic Septicaemia')
      .replace(/\bBQ\b/gi, 'Black Quarter')
      .replace(/\bIV\b/gi, 'intravenous saline')
      .replace(/\bORS\b/gi, 'oral rehydration solution')
      .replace(/\b1962\b/g, 'nineteen sixty-two')
      .replace(/\bRED\b/gi, 'Emergency Red')
      .replace(/\bYELLOW\b/gi, 'Moderate Yellow')
      .replace(/\bGREEN\b/gi, 'Mild Green');
  }

  return res.replace(/\s+/g, ' ').trim();
}

export class SpeechVoiceManager {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;
  private static currentAudio: HTMLAudioElement | null = null;
  private static currentAudioBlobUrl: string | null = null;
  private static isCurrentlySpeaking = false;
  private static activeLang: 'hi' | 'mr' | 'en' | null = null;
  private static onQueueEnd?: () => void;
  private static onQueueStart?: () => void;
  private static onQueueError?: (err: any) => void;
  private static voices: SpeechSynthesisVoice[] = [];
  private static activeUtteranceQueue: SpeechSynthesisUtterance[] = [];
  private static queueIndex = 0;

  /**
   * Preload voices in background as soon as available
   */
  public static init() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        try {
          SpeechVoiceManager.voices = window.speechSynthesis.getVoices();
        } catch {
          // Ignore voice loading error
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Split long text into natural sentences (supporting Hindi/Marathi viram '।', periods, newlines, exclamations)
   */
  private static splitIntoSentences(text: string): string[] {
    if (!text) return [];
    const cleaned = text.trim();
    if (!cleaned) return [];

    const rawChunks = cleaned.split(/([।\n.!?]+|[;,]+)/);
    const sentences: string[] = [];
    let temp = '';

    for (let i = 0; i < rawChunks.length; i++) {
      const part = rawChunks[i];
      if (/^[।\n.!?;,]+$/.test(part)) {
        temp += part;
        if (temp.trim().length > 0) {
          sentences.push(temp.trim());
          temp = '';
        }
      } else {
        const words = part.split(/\s+/);
        for (const w of words) {
          if (!w) continue;
          if ((temp + ' ' + w).trim().length > 100) {
            if (temp.trim().length > 0) {
              sentences.push(temp.trim());
            }
            temp = w;
          } else {
            temp = temp ? temp + ' ' + w : w;
          }
        }
      }
    }

    if (temp.trim().length > 0) {
      sentences.push(temp.trim());
    }

    return sentences.filter((s) => s.length > 0);
  }

  /**
   * Primary voice playback method.
   * Attempts high-fidelity server synthesized MP3 via POST /api/tts.
   * If network fails or is offline, switches automatically to browser Web Speech API.
   */
  public static async speakText(
    text: string,
    lang: 'hi' | 'mr' | 'en' = 'hi',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): Promise<boolean> {
    this.stop();

    const cleaned = sanitizeForSpeech(text, lang);
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

    // Attempt 1: Fetch synthesized MP3 via POST /api/tts for highest voice fidelity
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lang,
          text: cleaned,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        if (blob.size > 500) {
          const blobUrl = URL.createObjectURL(blob);
          this.currentAudioBlobUrl = blobUrl;
          const audio = new Audio(blobUrl);
          this.currentAudio = audio;

          audio.onended = () => {
            this.cleanupAudio();
            this.isCurrentlySpeaking = false;
            this.activeLang = null;
            if (this.onQueueEnd) {
              const cb = this.onQueueEnd;
              this.onQueueEnd = undefined;
              cb();
            }
          };

          audio.onerror = (e) => {
            console.warn('Audio playback error, falling back to Web Speech synthesis:', e);
            this.cleanupAudio();
            this.fallbackWebSpeech(cleaned, lang);
          };

          await audio.play();
          return true;
        }
      }
    } catch (err) {
      console.warn('Primary TTS fetch encountered error, using Web Speech fallback:', err);
      this.cleanupAudio();
    }

    // Attempt 2: High-accuracy browser Web Speech API fallback
    return this.fallbackWebSpeech(cleaned, lang);
  }

  /**
   * Robust chunk-by-chunk browser SpeechSynthesis fallback
   * Prevents Chrome's 15-second cutoff bug and ensures correct Devanagari Hindi/Marathi pronunciation.
   */
  private static fallbackWebSpeech(text: string, lang: 'hi' | 'mr' | 'en'): boolean {
    if (!this.synth) {
      this.isCurrentlySpeaking = false;
      this.activeLang = null;
      if (this.onQueueError) this.onQueueError(new Error('Speech synthesis not supported in this browser.'));
      if (this.onQueueEnd) this.onQueueEnd();
      return false;
    }

    try {
      this.synth.cancel();
      if (this.synth.paused) {
        this.synth.resume();
      }

      const sentences = this.splitIntoSentences(text);
      if (sentences.length === 0) {
        this.isCurrentlySpeaking = false;
        this.activeLang = null;
        if (this.onQueueEnd) this.onQueueEnd();
        return false;
      }

      // Voice selection
      const availableVoices = this.synth.getVoices();
      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (lang === 'mr') {
        // Look for Marathi voice first
        matchedVoice = availableVoices.find((v) => v.lang.toLowerCase().startsWith('mr'));
        // Fallback to Hindi voice (Devanagari script phonetic perfection)
        if (!matchedVoice) {
          matchedVoice = availableVoices.find(
            (v) => v.lang.toLowerCase().startsWith('hi') || v.name.includes('Hindi') || v.name.includes('हिन्दी')
          );
        }
      } else if (lang === 'hi') {
        matchedVoice = availableVoices.find(
          (v) => v.lang.toLowerCase().startsWith('hi') || v.name.includes('Hindi') || v.name.includes('हिन्दी')
        );
      } else {
        // English: prefer Indian English (en-IN) or natural English voices
        matchedVoice =
          availableVoices.find((v) => v.lang.toLowerCase().includes('en-in')) ||
          availableVoices.find((v) => v.lang.toLowerCase().startsWith('en'));
      }

      this.activeUtteranceQueue = sentences.map((sentence) => {
        const u = new SpeechSynthesisUtterance(sentence);
        if (matchedVoice) {
          u.voice = matchedVoice;
          u.lang = matchedVoice.lang;
        } else {
          // If no specific voice matched
          if (lang === 'mr' || lang === 'hi') {
            u.lang = 'hi-IN';
          } else {
            u.lang = 'en-IN';
          }
        }
        u.rate = lang === 'en' ? 0.95 : 0.92;
        u.pitch = 1.0;
        return u;
      });

      this.queueIndex = 0;
      this.playNextUtterance();
      return true;
    } catch (err) {
      console.error('Web Speech fallback encountered error:', err);
      this.isCurrentlySpeaking = false;
      this.activeLang = null;
      if (this.onQueueEnd) this.onQueueEnd();
      if (this.onQueueError) this.onQueueError(err);
      return false;
    }
  }

  private static playNextUtterance() {
    if (!this.synth || this.queueIndex >= this.activeUtteranceQueue.length) {
      this.isCurrentlySpeaking = false;
      this.activeLang = null;
      this.activeUtteranceQueue = [];
      this.queueIndex = 0;
      if (this.onQueueEnd) {
        const cb = this.onQueueEnd;
        this.onQueueEnd = undefined;
        cb();
      }
      return;
    }

    const currentUtterance = this.activeUtteranceQueue[this.queueIndex];

    currentUtterance.onend = () => {
      this.queueIndex++;
      this.playNextUtterance();
    };

    currentUtterance.onerror = (e) => {
      console.warn('Utterance playback error on sentence index:', this.queueIndex, e);
      this.queueIndex++;
      if (this.queueIndex < this.activeUtteranceQueue.length) {
        this.playNextUtterance();
      } else {
        this.isCurrentlySpeaking = false;
        this.activeLang = null;
        if (this.onQueueEnd) this.onQueueEnd();
      }
    };

    try {
      this.synth.speak(currentUtterance);
    } catch (e) {
      console.warn('Synth.speak call failed:', e);
      this.isCurrentlySpeaking = false;
      this.activeLang = null;
      if (this.onQueueEnd) this.onQueueEnd();
    }
  }

  private static cleanupAudio() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch {
        // Ignore audio pause errors
      }
      this.currentAudio = null;
    }
    if (this.currentAudioBlobUrl) {
      try {
        URL.revokeObjectURL(this.currentAudioBlobUrl);
      } catch {
        // Ignore blob revoke error
      }
      this.currentAudioBlobUrl = null;
    }
  }

  public static stop() {
    this.isCurrentlySpeaking = false;
    this.activeLang = null;
    this.activeUtteranceQueue = [];
    this.queueIndex = 0;

    this.cleanupAudio();

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Ignore cancel errors
      }
    }

    if (this.onQueueEnd) {
      const cb = this.onQueueEnd;
      this.onQueueEnd = undefined;
      cb();
    }
  }

  public static isSpeaking(): boolean {
    return (
      this.isCurrentlySpeaking ||
      Boolean(this.currentAudio && !this.currentAudio.paused) ||
      Boolean(this.synth && this.synth.speaking)
    );
  }

  public static getActiveLang(): 'hi' | 'mr' | 'en' | null {
    return this.activeLang;
  }
}

// Pre-initialize voices
if (typeof window !== 'undefined') {
  SpeechVoiceManager.init();
}

/**
 * Builds a natural, complete, and articulate spoken triage guide
 * in Marathi, Hindi, or English.
 *
 * Mode:
 * - 'full': Comprehensive step-by-step guidance including first aid steps,
 *           what NOT to do, store product advice, and 1962 helpline.
 * - 'summary': Concise spoken triage announcement and immediate caution.
 */
export function buildTriageVoiceScript(
  diagnosis: VetDiagnosisResponse,
  lang: 'mr' | 'hi' | 'en',
  mode: 'full' | 'summary' = 'full'
): string {
  const badgeStr = (diagnosis.urgency_badge || '').toUpperCase();
  const isRed =
    badgeStr.includes('RED') ||
    badgeStr.includes('🔴') ||
    Boolean(diagnosis.is_emergency_dispatch_needed);
  const isYellow =
    !isRed && (badgeStr.includes('YELLOW') || badgeStr.includes('🟡'));

  // 1. MARATHI SCRIPT
  if (lang === 'mr') {
    const parts: string[] = [];
    parts.push(`पशु आरोग्य तपासणी अहवाल.`);
    parts.push(`जनावराचा प्रकार: ${diagnosis.animal_identified || 'जनावर'}.`);
    parts.push(`संभाव्य आजार: ${diagnosis.suspected_condition}.`);

    if (isRed) {
      parts.push(
        `आणीबाणी पातळी: लाल अलर्ट. ही अतिशय तातडीची आणि गंभीर परिस्थिती आहे. तात्काळ उपचार सुरू करणे आवश्यक आहे.`
      );
    } else if (isYellow) {
      parts.push(
        `आणीबाणी पातळी: पिवळा अलर्ट. ही मध्यम स्वरूपाची परिस्थिती आहे. जनावरावर लक्ष ठेवा आणि प्राथमिक काळजी सुरू करा.`
      );
    } else {
      parts.push(
        `आणीबाणी पातळी: हिरवा अलर्ट. ही सामान्य व सौम्य स्थिती आहे. घरगुती प्रथमोपचार पुरेसे आहेत.`
      );
    }

    if (diagnosis.local_voice_script_marathi) {
      parts.push(diagnosis.local_voice_script_marathi);
    }

    if (mode === 'full') {
      if (diagnosis.first_aid_steps && diagnosis.first_aid_steps.length > 0) {
        parts.push(`तातडीने करावयाचे प्रथमोपचार खालीलप्रमाणे आहेत:`);
        diagnosis.first_aid_steps.forEach((step, idx) => {
          parts.push(`पायरी ${idx + 1}: ${step}.`);
        });
      }

      if (diagnosis.what_not_to_do) {
        parts.push(`महत्त्वाची सावधगिरी आणि काय करू नये: ${diagnosis.what_not_to_do}.`);
      }

      if (diagnosis.recommended_local_product) {
        parts.push(`उपयुक्त औषध किंवा साहित्य: ${diagnosis.recommended_local_product}.`);
      }
    }

    parts.push(`अधिक मदतीसाठी सरकारी पशु हेल्पलाइन एकोणीसशे बासष्ठ (1962) वर त्वरित संपर्क करा.`);
    return sanitizeForSpeech(parts.join(' '), 'mr');
  }

  // 2. HINDI SCRIPT
  if (lang === 'hi') {
    const parts: string[] = [];
    parts.push(`पशु स्वास्थ्य जाँच रिपोर्ट।`);
    parts.push(`पशु का प्रकार: ${diagnosis.animal_identified || 'पशु'}।`);
    parts.push(`संभावित बीमारी: ${diagnosis.suspected_condition}।`);

    if (isRed) {
      parts.push(
        `आपातकालीन स्तर: लाल अलर्ट। यह अति गंभीर आपातकालीन स्थिति है। तुरंत उपचार और सुरक्षा जरूरी है।`
      );
    } else if (isYellow) {
      parts.push(
        `आपातकालीन स्तर: पीला अलर्ट। यह मध्यम स्तर की स्थिति है। पशु पर निगरानी रखें और प्राथमिक देखभाल शुरू करें।`
      );
    } else {
      parts.push(
        `आपातकालीन स्तर: हरा अलर्ट। यह सामान्य स्थिति है। साधारण घरेलू देखभाल पर्याप्त है।`
      );
    }

    if (diagnosis.local_voice_script_hindi) {
      parts.push(diagnosis.local_voice_script_hindi);
    }

    if (mode === 'full') {
      if (diagnosis.first_aid_steps && diagnosis.first_aid_steps.length > 0) {
        parts.push(`जरूरी प्राथमिक उपचार इस प्रकार हैं:`);
        diagnosis.first_aid_steps.forEach((step, idx) => {
          parts.push(`कदम नंबर ${idx + 1}: ${step}।`);
        });
      }

      if (diagnosis.what_not_to_do) {
        parts.push(`सावधानी और क्या न करें: ${diagnosis.what_not_to_do}।`);
      }

      if (diagnosis.recommended_local_product) {
        parts.push(`सुझाई गई उपयोगी सामग्री: ${diagnosis.recommended_local_product}।`);
      }
    }

    parts.push(`आपातकालीन सहायता के लिए पशु चिकित्सा हेल्पलाइन उन्नीस सौ बासठ (1962) पर कॉल करें।`);
    return sanitizeForSpeech(parts.join(' '), 'hi');
  }

  // 3. ENGLISH SCRIPT
  const parts: string[] = [];
  parts.push(`Veterinary Health Triage Report.`);
  parts.push(`Identified animal: ${diagnosis.animal_identified || 'Livestock'}.`);
  parts.push(`Suspected condition: ${diagnosis.suspected_condition}.`);

  if (isRed) {
    parts.push(
      `Triage Urgency: Emergency Red Alert. This is a critical condition requiring immediate attention.`
    );
  } else if (isYellow) {
    parts.push(
      `Triage Urgency: Moderate Yellow Alert. Active monitoring and prompt first aid are advised.`
    );
  } else {
    parts.push(
      `Triage Urgency: Mild Green Alert. This is a non-critical condition; standard supportive care is recommended.`
    );
  }

  if (diagnosis.local_voice_script_english) {
    parts.push(diagnosis.local_voice_script_english);
  }

  if (mode === 'full') {
    if (diagnosis.first_aid_steps && diagnosis.first_aid_steps.length > 0) {
      parts.push(`Recommended first-aid steps:`);
      diagnosis.first_aid_steps.forEach((step, idx) => {
        parts.push(`Step ${idx + 1}: ${step}.`);
      });
    }

    if (diagnosis.what_not_to_do) {
      parts.push(`Crucial precaution, what not to do: ${diagnosis.what_not_to_do}.`);
    }

    if (diagnosis.recommended_local_product) {
      parts.push(`Recommended local remedy or supportive product: ${diagnosis.recommended_local_product}.`);
    }
  }

  parts.push(`For immediate veterinary ambulance assistance, call animal emergency helpline nineteen sixty-two.`);
  return sanitizeForSpeech(parts.join(' '), 'en');
}

/**
 * Backward compatibility alias for buildCompleteTriageNarration
 */
export function buildCompleteTriageNarration(
  diagnosis: VetDiagnosisResponse,
  lang: 'hi' | 'mr' | 'en'
): string {
  return buildTriageVoiceScript(diagnosis, lang, 'full');
}
