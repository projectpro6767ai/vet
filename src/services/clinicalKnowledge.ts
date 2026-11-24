import { VetDiagnosisResponse } from '../types';

export interface ConditionRule {
  id: string;
  match: (query: string, species: string) => boolean;
  diagnose: (lang: 'mr' | 'hi' | 'en') => VetDiagnosisResponse;
}

export function detectSpecies(query: string): string {
  if (query.includes('poultry') || query.includes('chicken') || query.includes('hen') || query.includes('cock') || query.includes('कोंबडी') || query.includes('मुर्गी') || query.includes('चूजा') || query.includes('पक्षी')) {
    return 'poultry';
  }
  if (query.includes('dog') || query.includes('puppy') || query.includes('कुत्रा') || query.includes('कुत्ता') || query.includes('पिल्लू') || query.includes('पिल्ला')) {
    return 'dog';
  }
  if (query.includes('cat') || query.includes('kitten') || query.includes('मांजर') || query.includes('बिल्ली')) {
    return 'cat';
  }
  if (query.includes('horse') || query.includes('donkey') || query.includes('घोडा') || query.includes('घोड़ा') || query.includes('गधा') || query.includes('तबेला')) {
    return 'equine';
  }
  if (query.includes('goat') || query.includes('sheep') || query.includes('lamb') || query.includes('बकरी') || query.includes('बकरा') || query.includes('मेंढी') || query.includes('मेंढा') || query.includes('भेड़') || query.includes('बोकड')) {
    return 'goat_sheep';
  }
  return 'bovine'; // default Cattle / Buffalo
}

export const CLINICAL_RULES: ConditionRule[] = [
  // 1. Toxicity / Poisoning / Urea / Pesticides
  {
    id: 'toxicity_poisoning',
    match: (q) =>
      q.includes('poison') ||
      q.includes('toxicity') ||
      q.includes('विषबाधा') ||
      q.includes('विषाक्तता') ||
      q.includes('कीटकनाशक') ||
      q.includes('कीटनाशक') ||
      q.includes('यूरिया') ||
      q.includes('urea') ||
      q.includes('रोगोर') ||
      q.includes('rogor') ||
      q.includes('snake') ||
      q.includes('साप चावला') ||
      q.includes('सांप काटा') ||
      (q.includes('froth') && q.includes('tremor')),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'पशुधन (Livestock)' : lang === 'hi' ? 'पशु (Livestock)' : 'Livestock',
      suspected_condition:
        lang === 'mr'
          ? 'तीव्र विषबाधा / कीटकनाशक विषाक्तता (Acute Toxicity / Suspected Poisoning)'
          : lang === 'hi'
          ? 'तीव्र विषाक्तता / कीटनाशक जहर (Acute Toxicity / Poisoning)'
          : 'Acute Toxicity / Suspected Poisoning',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Life-Threatening Emergency: Severe toxicity alert. Contact 1962 or nearest Veterinary Officer immediately!',
      first_aid_steps: [
        lang === 'mr'
          ? 'जनावराला ताबडतोब ५०० ग्रॅम गूळ आणि २०० मिली गोडेतेल / जवस तेल पाजा (पोटातील विष शोषून घेण्यास मदत होते).'
          : lang === 'hi'
          ? 'पशु को तुरंत 500 ग्राम गुड़ और 200 ml मीठा तेल/सरसों का तेल पिलाएं।'
          : 'Drench animal with 500g jaggery mixed with 200ml vegetable/linseed oil to neutralize and slow toxin absorption.',
        lang === 'mr'
          ? 'शक्य असल्यास ॲक्टिव्हेटेड चारकोल (ला Field Charcoal) पावडर १०० ग्रॅम पाण्यात मिसळून द्या.'
          : lang === 'hi'
          ? 'सक्रिय चारकोल (Activated Charcoal) 100 ग्राम पानी में घोलकर पिलाएं।'
          : 'Administer 100g Activated Charcoal suspended in lukewarm water.',
        lang === 'mr'
          ? 'संशयित कीटकनाशक किंवा विषारी चारा जनावरापासून तात्काळ दूर करा.'
          : lang === 'hi'
          ? 'संदिग्ध जहरीला चारा या कीटनाशक तुरंत पशु की पहुंच से दूर करें।'
          : 'Immediately remove suspected toxic feed, chemicals, or contaminated water.',
        lang === 'mr'
          ? 'जनावराच्या डोक्यावर आणि शरीरावर गार पाणी ओता आणि शांत सावलीच्या ठिकाणी ठेवा.'
          : lang === 'hi'
          ? 'पशु के सिर पर ठंडा पानी डालें और हवादार छाया में रखें।'
          : 'Pour cool water over head to prevent hyperthermia and place in shaded, quiet area.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'जनावराला जबरीने पाजताना श्वसननलिकेत औषध जाणार नाही याची दक्षता घ्या; उलट्या करण्याचा प्रयत्न करू नका.'
          : lang === 'hi'
          ? 'जबर्दस्ती पानी या दवा फेफड़ों में न जाने दें; उल्टा लटकाने का प्रयास न करें।'
          : 'Never force liquids into a choking or convulsing animal to avoid fatal aspiration pneumonia.',
      recommended_local_product: 'Activated Charcoal Suspension (Toxol / Antidote Bolus) + Oral Electrolyte',
      local_voice_script_english: 'Emergency! Suspected toxicity. Give jaggery and vegetable oil immediately and call veterinary emergency 1962.',
      local_voice_script_hindi: 'सावधान! पशु में विषबाधा का खतरा है। तुरंत गुड़ और मीठा तेल पिलाएं तथा 1962 पर कॉल करें।',
      local_voice_script_marathi: 'सावधान! जनावरामध्ये तीव्र विषबाधा झाली आहे. ताबडतोब गूळ आणि गोडेतेल द्या आणि १९६२ वर कॉल करा.',
    }),
  },

  // 2. Rabies Alert
  {
    id: 'rabies_alert',
    match: (q) =>
      q.includes('rabies') ||
      q.includes('रेबीज') ||
      q.includes('पिसाळ') ||
      q.includes('पागल कुत्ता') ||
      q.includes('hydrophobia') ||
      q.includes('अलर्क'),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'प्राणी (Rabies Suspect)' : lang === 'hi' ? 'पशु (Rabies Suspect)' : 'Animal (Rabies Suspect)',
      suspected_condition:
        lang === 'mr'
          ? 'संशयित रेबीज (Suspected Rabies - हायड्रोफोबिया / पिसाळणे)'
          : lang === 'hi'
          ? 'संदिग्ध रेबीज (Suspected Rabies - घातक विषाणु संक्रमण)'
          : 'Suspected Rabies (Fatal Zoonotic Alert)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Fatal Zoonotic Danger: Strict human and animal quarantine required. Contact State Veterinary Authorities immediately!',
      first_aid_steps: [
        lang === 'mr'
          ? 'प्राण्याला लोखंडी पिंजऱ्यात किंवा बंदिस्त खोलीत सुरक्षितपणे बांधून इतरांपासून वेगळे करा.'
          : lang === 'hi'
          ? 'पशु को तुरंत सुरक्षित बाड़े या पिंजरे में बंद करें और बिल्कुल पास न जाएं।'
          : 'Strictly confine and isolate the suspected animal in a secure, locked enclosure.',
        lang === 'mr'
          ? 'प्राण्याच्या लाळेचा संपर्क मानवी त्वचा किंवा जखमेशी येऊ देऊ नका.'
          : lang === 'hi'
          ? 'पशु की लार का संपर्क मानव त्वचा या किसी घाव से बिल्कुल न होने दें।'
          : 'Avoid any direct contact with animal saliva. Wear thick gloves and safety goggles.',
        lang === 'mr'
          ? 'कोणी चावले असल्यास जखम वाहत्या पाण्याखाली साबणाने किमान १५ मिनिटे धुवा आणि लगेच शासकीय रुग्णालयात अँटी-रेबीज लस घ्या.'
          : lang === 'hi'
          ? 'यदि किसी को काटा हो तो घाव को 15 मिनट तक साबुन व पानी से धोएं और तुरंत सरकारी अस्पताल में रेबीज टीका लगवाएं।'
          : 'If bitten or scratched, wash wound thoroughly under running water with soap for 15 minutes and seek post-exposure prophylaxis.',
        lang === 'mr'
          ? 'स्थानिक पशुसंवर्धन विभाग आणि महानगरपालिका / ग्रामपंचायतीला तातडीने सूचित करा.'
          : lang === 'hi'
          ? 'स्थानीय पशुपालन विभाग और ग्राम पंचायत को तुरंत सूचित करें।'
          : 'Notify municipal veterinary officers and local public health officials immediately.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'प्राण्याला मारहाण करू नका किंवा तोंडात हात घालू नका.'
          : lang === 'hi'
          ? 'पशु के मुंह में हाथ न डालें या गले में फंसी वस्तु निकालने का प्रयास न करें।'
          : 'Never put bare hands into the animal mouth to check for foreign bodies.',
      recommended_local_product: 'Human Post-Exposure Prophylaxis (Rabivax/Abhayrab) + Carbolic Soap Wash',
      local_voice_script_english: 'Critical safety alert! Suspected rabies. Strictly isolate the animal and do not touch its saliva.',
      local_voice_script_hindi: 'अत्यंत गंभीर चेतावनी! रेबीज का खतरा है। पशु से दूर रहें और लार को बिल्कुल न छुएं।',
      local_voice_script_marathi: 'गंभीर इशारा! रेबीजचा संशय आहे. प्राण्याला सुरक्षितपणे वेगळे करा आणि लाळ लागू देऊ नका.',
    }),
  },

  // 3. Hemorrhagic Septicemia (HS / घटसर्प / गलघोंटू)
  {
    id: 'hemorrhagic_septicemia',
    match: (q) =>
      q.includes('hs') ||
      q.includes('hemorrhagic') ||
      q.includes('septicaemia') ||
      q.includes('septicemia') ||
      q.includes('घटसर्प') ||
      q.includes('गलघोंटू') ||
      q.includes('galyala suz') ||
      q.includes('gale me sujan') ||
      q.includes('गळ्याला सूज') ||
      q.includes('गले में सूजन') ||
      (q.includes('throat') && (q.includes('swelling') || q.includes('breath') || q.includes('fever'))) ||
      (q.includes('snoring') && q.includes('fever')) ||
      q.includes('घुरघुराहट') ||
      q.includes('घरघर'),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'गाय / म्हैस (Cattle/Buffalo)' : lang === 'hi' ? 'गाय / भैंस (Cattle/Buffalo)' : 'Cattle / Buffalo',
      suspected_condition:
        lang === 'mr'
          ? 'घटसर्प / तीव्र गळसुज (Hemorrhagic Septicemia - HS)'
          : lang === 'hi'
          ? 'गलघोंटू रोग / तीव्र कंठशोध (Hemorrhagic Septicemia - HS)'
          : 'Hemorrhagic Septicemia (HS / Shipping Fever)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Fatal Bacterial Emergency: Immediate high-dose antibiotic therapy required within hours. Calling 1962 dispatch!',
      first_aid_steps: [
        lang === 'mr'
          ? 'जनावराला ताबडतोब हवादार, मोकळ्या आणि सावलीच्या गोठ्यात उभे ठेवा; श्वसनाचा मार्ग मोकळा ठेवा.'
          : lang === 'hi'
          ? 'पशु को तुरंत खुली, हवादार जगह पर रखें ताकि सांस लेने में आसानी हो।'
          : 'Move animal to a cool, open, well-ventilated shed with unhindered airflow.',
        lang === 'mr'
          ? 'गळ्यातील सूज कमी करण्यासाठी गळ्यावर बर्फाने किंवा थंड पाण्याच्या पट्ट्यांनी हलके शेका.'
          : lang === 'hi'
          ? 'गले की सूजन पर ठंडे पानी की पट्टी या बर्फ से धीरे-धीरे सेकें।'
          : 'Apply cold wet compresses or ice packs gently around the throat swelling to ease airway distress.',
        lang === 'mr'
          ? 'जनावराला जबरदस्तीने पाणी किंवा औषध पाजू नका, कारण घसा सुजल्यामुळे अन्ननलिका बंद झालेली असते.'
          : lang === 'hi'
          ? 'पशु को जबरदस्ती कुछ भी न पिलाएं, गले में सूजन से दम घुट सकता है।'
          : 'Strictly avoid drenching liquids; swallowing is paralyzed and can cause suffocation.',
        lang === 'mr'
          ? 'पशुवैद्यकीय अधिकाऱ्याकडून तातडीने सल्फोनामाईड / ऑक्सिटेट्रासायक्लिन इंजेक्शन द्या.'
          : lang === 'hi'
          ? 'पशु चिकित्सक से तुरंत एंटीबायोटिक (सल्फा या ऑक्सीटेट्रासाइक्लिन) इंजेक्शन लगवाएं।'
          : 'Urgent veterinary intervention: High-dose intravenous sulfonamides or broad-spectrum oxytetracycline.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'गळ्यावर गरम शेक देऊ नका किंवा जनावराच्या गळ्यावर दबाव आणू नका.'
          : lang === 'hi'
          ? 'गले पर गरम तेल न लगाएं या सूजन को दबाने की कोशिश न करें।'
          : 'Do not apply hot ointments, rub hard, or lance the neck swelling.',
      recommended_local_product: 'Immediate Veterinary Sulfadimidine / Oxytetracycline Injection + Antipyretic',
      local_voice_script_english: 'Urgent! Suspected Hemorrhagic Septicemia with throat swelling. Do not drench liquids and call vet 1962 immediately.',
      local_voice_script_hindi: 'अति आवश्यक! गाय भैंस में गलघोंटू के लक्षण हैं। जबरदस्ती पानी न पिलाएं और तुरंत डॉक्टर 1962 को बुलाएं।',
      local_voice_script_marathi: 'तातडीचा इशारा! जनावरामध्ये घटसर्पाची गळसुज आहे. काहीही पाजू नका आणि लगेच १९६२ वर संपर्क करा.',
    }),
  },

  // 4. Black Quarter (BQ / फऱ्या / लंगड़ा बुखार)
  {
    id: 'black_quarter',
    match: (q) =>
      q.includes('bq') ||
      q.includes('black quarter') ||
      q.includes('blackleg') ||
      q.includes('फऱ्या') ||
      q.includes('लंगड़ा बुखार') ||
      q.includes('चरचरिया') ||
      q.includes('char char') ||
      q.includes('crepit') ||
      (q.includes('thigh') && q.includes('swelling')) ||
      (q.includes('पायाला सूज') && (q.includes('ताप') || q.includes('fever'))),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'गाय / बैल / म्हैस' : lang === 'hi' ? 'गाय / बैल / भैंस' : 'Cattle / Buffalo',
      suspected_condition:
        lang === 'mr'
          ? 'फऱ्या रोग / चरचरिया (Black Quarter - BQ)'
          : lang === 'hi'
          ? 'लंगड़ा बुखार / फड़किया / चरचरिया (Black Quarter - BQ)'
          : 'Black Quarter (BQ / Clostridial Myositis)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Critical Clostridial Emergency: Urgent high-dose crystalline penicillin injection required within hours!',
      first_aid_steps: [
        lang === 'mr'
          ? 'जनावराला चालायला लावू नका; पूर्ण विश्रांतीसाठी मऊ गवताच्या किंवा भुशाच्या अंथरुणावर ठेवा.'
          : lang === 'hi'
          ? 'पशु को बिल्कुल न चलाएं; नरम बिछावन पर आराम से लेटने दें।'
          : 'Keep animal completely at rest on soft, thick straw bedding; avoid any movement.',
        lang === 'mr'
          ? 'बाधित जनावराला निरोगी जनावरांपासून ताबडतोब वेगळे बांधा.'
          : lang === 'hi'
          ? 'बीमार पशु को तुरंत स्वस्थ मवेशियों से अलग करें।'
          : 'Strictly isolate the affected animal from other young cattle and calves.',
        lang === 'mr'
          ? 'सूज आलेल्या जागेवर बर्फाने हलके शेका; सूज दाबू नका किंवा कापू नका.'
          : lang === 'hi'
          ? 'सूजन वाली जगह पर ठंडा सेक करें, चीरा लगाने की कोशिश न करें।'
          : 'Apply cold compresses to the affected muscle swelling; never puncture or lance the skin.',
        lang === 'mr'
          ? 'पशुवैद्यकाकडून ताबडतोब पेनिसिलिन (Penicillin) चा मोठा डोस आणि वेदनाशामक इंजेक्शन द्या.'
          : lang === 'hi'
          ? 'पशु चिकित्सक से तुरंत पेनिसिलिन और दर्द निवारक इंजेक्शन लगवाएं।'
          : 'Urgent veterinary therapy: Massive dose Penicillin G intramuscularly and around the lesion perimeter.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'सूज आलेल्या स्नायूंवर गरम डाग देणे किंवा सुरीने कापणे टाळा (संसर्ग वेगाने पसरतो).'
          : lang === 'hi'
          ? 'सूजन को गरम लोहे से न दाग़ें और न ही चीरा लगाएं।'
          : 'Never brand with hot iron or make incisions in the crepitant swelling.',
      recommended_local_product: 'Veterinary Penicillin G / Amoxicillin Injection + Meloxicam Anti-inflammatory',
      local_voice_script_english: 'Emergency! Suspected Black Quarter with muscle crackling swelling. Immediate penicillin treatment required.',
      local_voice_script_hindi: 'सावधान! पशु में लंगड़ा बुखार (फऱ्या) के लक्षण हैं। सूजन पर चीरा न लगाएं और डॉक्टर को तुरंत बुलाएं।',
      local_voice_script_marathi: 'सावधान! जनावरात फऱ्या रोगाची चरचर सूज आहे. डाग देऊ नका आणि तातडीने पशुवैद्यकीय उपचार सुरू करा.',
    }),
  },

  // 5. Babesiosis / Red Water / Tick Fever (लाल पेशाब / बबेसियोसिस)
  {
    id: 'babesiosis_red_water',
    match: (q) =>
      q.includes('red water') ||
      q.includes('red urine') ||
      q.includes('लाल पेशाब') ||
      q.includes('लाल लघवी') ||
      q.includes('रक्त मूतणे') ||
      q.includes('lal peshab') ||
      q.includes('lal laghvi') ||
      q.includes('babesia') ||
      q.includes('theileria') ||
      q.includes('coffee urine'),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'गाय / म्हैस (Cattle/Buffalo)' : lang === 'hi' ? 'गाय / भैंस (Cattle/Buffalo)' : 'Cattle / Buffalo',
      suspected_condition:
        lang === 'mr'
          ? 'बबेसियोसिस / गोचीड ताप (Red Water / Babesiosis - लाल लघवी)'
          : lang === 'hi'
          ? 'बबेसिओसिस / लाल पेशाब रोग (Bovine Babesiosis / Tick Fever)'
          : 'Bovine Babesiosis (Red Water / Protozoal Tick Fever)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Urgent Protozoal Emergency: Severe red blood cell destruction. Specific antiprotozoal injection required immediately!',
      first_aid_steps: [
        lang === 'mr'
          ? 'जनावराला दिवसभर गुळाचे पाणी आणि भरपूर इलेक्ट्रोलाइट्स पिण्यास द्या (शक्ती टिकवण्यासाठी).'
          : lang === 'hi'
          ? 'पशु को दिनभर गुड़ का पानी और ओआरएस इलेक्ट्रोलाइट्स पिलाएं।'
          : 'Drench animal with fresh jaggery solution and electrolytes to combat anemia and dehydration.',
        lang === 'mr'
          ? 'जनावराला थेट उन्हात ठेवू नका; थंड आणि सावलीच्या गोठ्यात विश्रांती द्या.'
          : lang === 'hi'
          ? 'पशु को सीधी धूप से बचाकर ठंडी हवादार छाया में रखें।'
          : 'House in cool, shaded quarters to reduce thermal stress on oxygen-deprived red blood cells.',
        lang === 'mr'
          ? 'गोठ्यातील व अंगावरील गोचीड नियंत्रणासाठी फ्ल्युमेथ्रीन किंवा सायपरमेथ्रीनचा सुरक्षित वापर करा.'
          : lang === 'hi'
          ? 'पशु के शरीर और बाड़े से किलनी/चिचड़ी हटाने के लिए कीटनाशक दवा का प्रयोग करें।'
          : 'Apply tick-control pour-on (Flumethrin) to eliminate vector ticks from cattle and shed.',
        lang === 'mr'
          ? 'पशुवैद्यकाकडून डिमिनाझीन ॲसिट्युरेट (Berenil) चे अचूक वजनानुसार इंजेक्शन तातडीने द्या.'
          : lang === 'hi'
          ? 'पशु चिकित्सक से तुरंत बेरेनिल (Diminazene) इंजेक्शन लगवाएं।'
          : 'Immediate veterinary administration of Diminazene Aceturate (Berenil) or Imidocarb.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'जनावराला जास्त काम किंवा लांबचा प्रवास करू देऊ नका (रक्त कमी झाल्यामुळे हृदय बंद पडू शकते).'
          : lang === 'hi'
          ? 'पशु को बिल्कुल न चलाएं, खून की कमी से हार्ट फेल हो सकता है।'
          : 'Do not exercise or move the anemic animal; physical exertion can trigger fatal heart failure.',
      recommended_local_product: 'Diminazene Aceturate (Berenil 7%) + Iron & B-Complex Injection + Liver Tonic',
      local_voice_script_english: 'Urgent alert! Red water tick fever detected. Provide jaggery water and get anti-protozoal injection immediately.',
      local_voice_script_hindi: 'सावधान! पशु में लाल पेशाब (बबेसिओसिस) के लक्षण हैं। गुड़ का पानी दें और तुरंत डॉक्टर से बेरेनिल इंजेक्शन लगवाएं।',
      local_voice_script_marathi: 'तातडीचा इशारा! लाल लघवी (गोचीड ताप) चे लक्षण आहे. गुळाचे पाणी द्या आणि तातडीने डॉक्टरांकडून इंजेक्शन घ्या.',
    }),
  },

  // 6. Goat / Sheep PPR (Peste des Petits Ruminants / Goat Plague)
  {
    id: 'goat_ppr',
    match: (q, species) =>
      (species === 'goat_sheep' || q.includes('goat') || q.includes('sheep') || q.includes('शेळी') || q.includes('बकरी')) &&
      (q.includes('ppr') ||
        q.includes('प्लेग') ||
        q.includes('देवी') ||
        (q.includes('fever') && q.includes('diarrhea')) ||
        (q.includes('ताप') && q.includes('जुलाब')) ||
        (q.includes('बुखार') && q.includes('दस्त')) ||
        (q.includes('mouth') && q.includes('scour'))),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'शेळी / मेंढी (Goat/Sheep)' : lang === 'hi' ? 'बकरी / भेड़ (Goat/Sheep)' : 'Goat / Sheep',
      suspected_condition:
        lang === 'mr'
          ? 'पीपीआर रोग / शेळ्यांची देवी (Peste des Petits Ruminants - PPR)'
          : lang === 'hi'
          ? 'पीपीआर रोग / बकरियों का प्लेग (Goat Plague - PPR)'
          : 'Peste des Petits Ruminants (PPR / Goat Plague)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Highly Contagious Caprine Viral Emergency: Immediate quarantine and fluid resuscitation required!',
      first_aid_steps: [
        lang === 'mr'
          ? 'बाधित शेळ्यांना कळपातील इतर निरोगी शेळ्यांपासून ताबडतोब वेगळे करा.'
          : lang === 'hi'
          ? 'प्रभावित बकरियों को तुरंत स्वस्थ झुंड से पूरी तरह अलग करें।'
          : 'Immediately quarantine all sick goats away from healthy flock in a dry pen.',
        lang === 'mr'
          ? 'तोंडात व हिरड्यांवर तयार झालेले फोड पोटॅशियम परमँगनेट (KMNO4 ०.१%) किंवा तुरटीच्या पाण्याने स्वच्छ धुवा.'
          : lang === 'hi'
          ? 'मुंह के छालों को पोटाश (KMNO4) या फिटकरी के हल्के घोल से दिन में 2 बार साफ करें।'
          : 'Clean oral ulcers and mouth lesions twice daily using mild 0.1% potassium permanganate or alum wash.',
        lang === 'mr'
          ? 'जुलाबामुळे आलेले डिहायड्रेशन रोखण्यासाठी ताजे ओआरएस (ORS) आणि गुळाचे पाणी वारंवार पाजा.'
          : lang === 'hi'
          ? 'दस्त से निर्जलीकरण रोकने के लिए ओआरएस (ORS) और गुड़ का घोल बार-बार पिलाएं।'
          : 'Administer oral rehydration electrolytes with jaggery frequently to counteract severe dehydration.',
        lang === 'mr'
          ? 'दुय्यम जिवाणू संसर्ग रोखण्यासाठी पशुवैद्यकाकडून लाँग-ॲक्टिंग अँटीबायोटिक आणि वेदनाशामक द्या.'
          : lang === 'hi'
          ? 'पशु चिकित्सक से एंटीबायोटिक और लिवर टॉनिक इंजेक्शन लगवाएं।'
          : 'Veterinary broad-spectrum antibiotic cover and supportive antipyretic to prevent secondary pneumonia.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'आजारी शेळ्यांचा चारा व भांडी इतर शेळ्यांना वापरू नका; तीव्र संसर्ग असतो.'
          : lang === 'hi'
          ? 'बीमार बकरी का बचा हुआ चारा स्वस्थ बकरियों को न खिलाएं।'
          : 'Never mix feed pans or grazing areas between sick and healthy flock members.',
      recommended_local_product: 'Oral Electrolyte Powder + Enrofloxacin / Oxytetracycline + B-Complex Syrup',
      local_voice_script_english: 'Warning! Suspected PPR goat plague. Isolate sick goats and wash mouth sores with mild alum water.',
      local_voice_script_hindi: 'सावधान! बकरियों में पीपीआर रोग का खतरा है। बीमार बकरी को तुरंत अलग करें और ओआरएस घोल दें।',
      local_voice_script_marathi: 'सावधान! शेळ्यांमध्ये पीपीआर रोगाचे लक्षण आहे. बाधित शेळीला लगेच वेगळे करा आणि ओआरएस पाणी द्या.',
    }),
  },

  // 7. Goat / Sheep Enterotoxemia (Pulpy Kidney / फड़किया)
  {
    id: 'goat_enterotoxemia',
    match: (q, species) =>
      (species === 'goat_sheep' || q.includes('goat') || q.includes('शेळी') || q.includes('बकरी')) &&
      (q.includes('enterotoxemia') ||
        q.includes('pulpy kidney') ||
        q.includes('फड़किया') ||
        q.includes('fadkiya') ||
        q.includes('convulsion') ||
        q.includes('तड़प') ||
        (q.includes('overeating') && q.includes('goat'))),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'शेळी / बोकड' : lang === 'hi' ? 'बकरी / बकरा' : 'Goat / Sheep',
      suspected_condition:
        lang === 'mr'
          ? 'फडकिया रोग / आंत्रविषक्तता (Enterotoxemia - Pulpy Kidney)'
          : lang === 'hi'
          ? 'फड़किया रोग / आंत्रविषाक्तता (Enterotoxemia - Pulpy Kidney)'
          : 'Enterotoxemia (Pulpy Kidney Disease)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Fatal Clostridial Toxemia: Rapid mortality risk. Emergency antitoxin and alkalinizing therapy required!',
      first_aid_steps: [
        lang === 'mr'
          ? 'शेळीला धान्य, पेंड किंवा जास्त प्रमाणात चारा देणे ताबडतोब पूर्णपणे बंद करा.'
          : lang === 'hi'
          ? 'दाना, अनाज या चोकर तुरंत बंद कर दें; केवल सूखा चारा दें।'
          : 'Immediately stop all grain, concentrates, and lush green forage feeding.',
        lang === 'mr'
          ? 'पोटातील आम्ल कमी करण्यासाठी २० ग्रॅम खाण्याचा सोडा २०० मिली पाण्यात मिसळून पाजा.'
          : lang === 'hi'
          ? '20 ग्राम मीठा सोडा (Baking Soda) पानी में घोलकर तुरंत पिलाएं।'
          : 'Administer 20g sodium bicarbonate in 200ml lukewarm water to neutralize ruminal acidosis.',
        lang === 'mr'
          ? 'शेळीच्या डोक्यावर थंड पाण्याची धार धरा आणि मान एका बाजूला तिरपी ठेवा (उलटी फुफ्फुसात जाऊ नये).'
          : lang === 'hi'
          ? 'सिर पर ठंडा पानी डालें और गर्दन सीधी रखें ताकि झाग फेफड़ों में न जाए।'
          : 'Keep head elevated and slightly turned to prevent aspiration of frothy saliva.',
        lang === 'mr'
          ? 'पशुवैद्यकाकडून पेनिसिलिन किंवा अँटीटॉक्सिन इंजेक्शन तातडीने द्या.'
          : lang === 'hi'
          ? 'पशु चिकित्सक से तुरंत पेनिसिलिन इंजेक्शन और एंटी-टॉक्सिन लगवाएं।'
          : 'Urgent veterinary therapy: High-dose penicillin and B-complex electrolytes.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'शेळीला भरपूर पाणी किंवा जड धान्य एकदम देऊ नका.'
          : lang === 'hi'
          ? 'पशु को अचानक भारी मात्रा में अनाज या बासी चारा न दें।'
          : 'Never reintroduce concentrates until rumen function is fully normalized.',
      recommended_local_product: 'Sodium Bicarbonate + Activated Charcoal Suspension + Veterinary Penicillin',
      local_voice_script_english: 'Emergency! Suspected enterotoxemia in goat. Stop all grains immediately and give baking soda water.',
      local_voice_script_hindi: 'सावधान! बकरी में फड़किया रोग के लक्षण हैं। दाना तुरंत बंद करें और मीठा सोडा पानी में घोलकर दें।',
      local_voice_script_marathi: 'सावधान! शेळीत फडकिया रोगाचा धोका आहे. खुराक पूर्ण बंद करा आणि खाण्याचा सोडा पाण्यात मिसळून द्या.',
    }),
  },

  // 8. Goat / Sheep Bottle Jaw (Parasitic Haemonchosis / गळ्याखाली सूज)
  {
    id: 'goat_bottle_jaw',
    match: (q, species) =>
      (species === 'goat_sheep' || q.includes('goat') || q.includes('शेळी') || q.includes('बकरी')) &&
      (q.includes('bottle jaw') ||
        q.includes('गळ्याखाली') ||
        q.includes('जबड़े के नीचे') ||
        q.includes('haemonchus') ||
        q.includes('gholi') ||
        (q.includes('jaw') && q.includes('swelling'))),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'शेळी / मेंढी' : lang === 'hi' ? 'बकरी / भेड़' : 'Goat / Sheep',
      suspected_condition:
        lang === 'mr'
          ? 'बॉटल जॉ / पोटात जंत (Bottle Jaw - Parasitic Haemonchosis)'
          : lang === 'hi'
          ? 'बॉटल जॉ / पेट के कीड़े (Bottle Jaw - Haemonchosis / Anemia)'
          : 'Bottle Jaw (Severe Parasitic Gastroenteritis / Haemonchosis)',
      urgency_badge: '🟡 YELLOW',
      is_emergency_dispatch_needed: false,
      trigger_emergency_dispatch: false,
      doctor_status: 'Moderate Parasitic Anemia: Deworming with broad-spectrum anthelmintic and hematinic tonic required.',
      first_aid_steps: [
        lang === 'mr'
          ? 'शेळीच्या वजनानुसार योग्य जंतांचे औषध (Closantel किंवा Ivermectin) पशुवैद्यकाच्या सल्ल्याने द्या.'
          : lang === 'hi'
          ? 'वजन के अनुसार पेट के कीड़े की दवा (Closantel या Ivermectin) दें।'
          : 'Administer targeted anthelmintic (Closantel or Ivermectin) based on accurate body weight.',
        lang === 'mr'
          ? 'रक्तवाढीसाठी गूळ (५० ग्रॅम) आणि आयर्न टॉनिक (लोहयुक्त औषध) रोज सकाळी द्या.'
          : lang === 'hi'
          ? 'खून की कमी दूर करने के लिए गुड़ और आयरन टॉनिक (Feritas) रोजाना दें।'
          : 'Supplement daily with 50g jaggery and oral hematinic tonic (iron + copper + vitamin B12).',
        lang === 'mr'
          ? 'शेळ्यांना पहाटे दव पडलेल्या गवतावर चरण्यास नेऊ नका (जंतांच्या अळ्या गवताच्या टोकावर असतात).'
          : lang === 'hi'
          ? 'सुबह ओस वाली घास पर चराने से बचें, धूप निकलने के बाद ही चराएं।'
          : 'Graze only after morning dew dries; infective larvae migrate to blade tips during early morning dew.',
        lang === 'mr'
          ? 'गोठ्याची स्वच्छता ठेवा आणि दर ३ महिन्यांनी नियमित जंतनिर्मूलन करा.'
          : lang === 'hi'
          ? 'बाड़े को सूखा रखें और हर 3 महीने पर नियमित कृमिनाशक दवा दें।'
          : 'Keep bedding dry and implement strategic 3-month rotational flock deworming.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'गळ्याखालील सूज दाबू नका किंवा सुईने फोडू नका (हे रक्तातील प्रोटिन कमी झाल्यामुळे साचलेले पाणी असते).'
          : lang === 'hi'
          ? 'गले के नीचे की सूजन को सुई से न फोड़ें।'
          : 'Do not attempt to lance or aspirate the submandibular edema fluid.',
      recommended_local_product: 'Closantel Drench (Zycloz / Flukiver) + Sharkoferrol / Feritas Iron Tonic',
      local_voice_script_english: 'Bottle jaw parasitic anemia. Administer veterinary dewormer and daily jaggery iron supplement.',
      local_voice_script_hindi: 'बकरी में पेट के कीड़ों से सूजन (बॉटल जॉ) है। कीड़े की दवा दें और गुड़ व आयरन टॉनिक पिलाएं।',
      local_voice_script_marathi: 'शेळीच्या गळ्याखालील सूज जंतांमुळे आहे. योग्य जंतांचे औषध द्या आणि गुळ-लोह टॉनिक चालू करा.',
    }),
  },

  // 9. Equine Colic (Horse / Donkey rolling in pain)
  {
    id: 'equine_colic',
    match: (q, species) =>
      (species === 'equine' || q.includes('horse') || q.includes('घोडा') || q.includes('घोड़ा') || q.includes('donkey') || q.includes('गधा')) &&
      (q.includes('colic') ||
        q.includes('rolling') ||
        q.includes('पोटदुखी') ||
        q.includes('पेट दर्द') ||
        q.includes('pawing') ||
        q.includes('kicking belly') ||
        q.includes('घाम')),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'घोडा / गाढव (Equine)' : lang === 'hi' ? 'घोड़ा / गधा (Equine)' : 'Horse / Donkey',
      suspected_condition:
        lang === 'mr'
          ? 'घोड्याचे तीव्र पोटदुखी / कोलिक (Equine Colic - Acute Abdominal Emergency)'
          : lang === 'hi'
          ? 'घोड़े का पेट दर्द / शूल (Equine Colic - Acute Emergency)'
          : 'Equine Colic (Acute Abdominal Crisis)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Critical Equine Emergency: High risk of intestinal torsion/strangulation. Urgent veterinary examination required!',
      first_aid_steps: [
        lang === 'mr'
          ? 'घोड्याला जमिनीवर सतत लोळू देऊ नका (आतड्यांना पीळ पडण्याचा धोका असतो); त्याला हलके-हलके चालवा.'
          : lang === 'hi'
          ? 'घोड़े को जमीन पर लोटने न दें (आंतों में ऐंठन हो सकती है); उसे धीरे-धीरे टहलाते रहें।'
          : 'Prevent violent rolling which risks fatal intestinal torsion; walk the horse slowly on flat ground.',
        lang === 'mr'
          ? 'कोणतेही धान्य, दाना किंवा गवत खाणे तात्काळ पूर्णपणे बंद करा.'
          : lang === 'hi'
          ? 'दाना, अनाज या घास तुरंत हटा लें; कुछ भी खाने न दें।'
          : 'Strictly withhold all grain, hay, and concentrates immediately.',
        lang === 'mr'
          ? 'जबरीने तोंडावाटे तेल किंवा औषध पाजू नका; घोडा उलटी करू शकत नाही.'
          : lang === 'hi'
          ? 'मुंह से जबरदस्ती तेल या दवा न पिलाएं।'
          : 'Do not administer oral drenches without a nasogastric stomach tube.',
        lang === 'mr'
          ? 'पशुवैद्यकीय तज्ज्ञांकडून नासो-गॅस्ट्रिक नळीने तपासणी आणि अँटीस्पास्मोडिक (Spasmonil / Flunixin) इंजेक्शन द्या.'
          : lang === 'hi'
          ? 'पशु चिकित्सक से तुरंत दर्द निवारक (Flunixin Meglumine) इंजेक्शन लगवाएं।'
          : 'Urgent veterinary intervention: Flunixin Meglumine analgesia and nasogastric decompression.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'घोड्याला जास्त धावू देऊ नका आणि वेदनेमुळे स्वतःला इजा करून घेण्यापासून सावध रहा.'
          : lang === 'hi'
          ? 'घोड़े को तेज न दौड़ाएं और न ही भूखे पेट दवा खिलाएं।'
          : 'Do not trot or exhaust the horse; avoid giving human painkillers.',
      recommended_local_product: 'Flunixin Meglumine (Megaludyne) Injection + Liquid Paraffin (via Stomach Tube)',
      local_voice_script_english: 'Emergency! Equine colic detected. Keep horse walking slowly, prevent rolling, and call vet immediately.',
      local_voice_script_hindi: 'अति गंभीर! घोड़े में कोलिक पेट दर्द के लक्षण हैं। लोटने न दें, टहलाएं और तुरंत डॉक्टर बुलाएं।',
      local_voice_script_marathi: 'गंभीर इशारा! घोड्यामध्ये कोलिक पोटदुखी आहे. लोळू देऊ नका, हळूहळू चालवा आणि लगेच डॉक्टरांना बोलवा.',
    }),
  },

  // 10. Lumpy Skin Disease (LSD)
  {
    id: 'lumpy_skin_disease',
    match: (q) =>
      q.includes('lump') ||
      q.includes('nodule') ||
      q.includes('लंपी') ||
      q.includes('गाठ') ||
      q.includes('गांठ') ||
      q.includes('skin bump') ||
      q.includes('pox'),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'गाय / गोवंश (Cattle)' : lang === 'hi' ? 'गाय / गोवंश (Cattle)' : 'Cattle / Cow',
      suspected_condition:
        lang === 'mr'
          ? 'लंपी त्वचा रोग (Lumpy Skin Disease - LSD)'
          : lang === 'hi'
          ? 'लम्पी त्वचा रोग (Lumpy Skin Disease - LSD)'
          : 'Lumpy Skin Disease (LSD)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Contagious Viral Disease: Strict bio-security isolation required. Government 1962 dispatch advised.',
      first_aid_steps: [
        lang === 'mr'
          ? 'बाधित जनावराला निरोगी जनावरांपासून ताबडतोब पूर्णपणे वेगळे करा.'
          : lang === 'hi'
          ? 'संक्रमित पशु को तुरंत बाकी स्वस्थ पशुओं से अलग बाड़े में रखें।'
          : 'Strictly isolate the affected animal from all healthy stock in a fly-proof stall.',
        lang === 'mr'
          ? 'त्वचेवरील गाठींवर कडुनिंब, हळद आणि कापूर मिश्रित खोबरेल तेलाचा लेप लावा.'
          : lang === 'hi'
          ? 'त्वचा की गांठों पर नीम, हल्दी और कपूर मिला नारियल तेल लगाएं।'
          : 'Apply a soothing herbal paste of neem leaves, turmeric powder, and camphor in coconut oil on skin nodules.',
        lang === 'mr'
          ? 'गोठ्यात डास, गोचीड आणि माश्यांवर नियंत्रणासाठी कडुनिंबाचा आणि कापराचा धूर करा.'
          : lang === 'hi'
          ? 'मच्छर, मक्खी और किलनी भगाने के लिए बाड़े में नीम के पत्तों का धुआं करें।'
          : 'Fumigate the cattle shed using dry neem leaves and camphor to deter vector flies and mosquitoes.',
        lang === 'mr'
          ? 'रोगप्रतिकारशक्तीसाठी गूळ, काळी मिरी, आले आणि हळद यांचा पाचक गोळा खायला द्या.'
          : lang === 'hi'
          ? 'प्रतिरोधक क्षमता बढ़ाने के लिए गुड़, काली मिर्च, सोंठ और हल्दी का लड्डू बनाकर खिलाएं।'
          : 'Feed Ayurvedic immunity bolus: Jaggery, black pepper, ginger, and turmeric twice daily.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'गाठी फोडण्याचा किंवा ब्लेडने कापण्याचा अजिबात प्रयत्न करू नका.'
          : lang === 'hi'
          ? 'गांठों को फोड़ने या ब्लेड से खुरचने की कोशिश बिल्कुल न करें।'
          : 'Never pierce, squeeze, or attempt to lance the cutaneous nodules.',
      recommended_local_product: 'Topical Neem-Turmeric Ointment / Charmil Spray + Paracetamol Bolus',
      local_voice_script_english: 'Caution! Suspected Lumpy Skin Disease. Isolate animal and apply neem turmeric paste to skin nodules.',
      local_voice_script_hindi: 'सावधान! पशु में लम्पी त्वचा रोग के लक्षण हैं। पशु को तुरंत अलग करें और नीम हल्दी का लेप लगाएं।',
      local_voice_script_marathi: 'सावधान! जनावरात लंपी त्वचा रोगाचे लक्षण आहे. बाधित जनावराला वेगळे करा आणि कडुनिंब-हळद तेल लावा.',
    }),
  },

  // 11. Foot and Mouth Disease (FMD)
  {
    id: 'foot_and_mouth_disease',
    match: (q) =>
      q.includes('fmd') ||
      q.includes('खुरकूत') ||
      q.includes('लाळ्या') ||
      q.includes('लाळ') ||
      q.includes('लार') ||
      q.includes('छाले') ||
      q.includes('blister') ||
      q.includes('drool') ||
      q.includes('mouth sore') ||
      q.includes('खुरपका') ||
      q.includes('मुंहपका'),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'गाय / म्हैस (Cattle/Buffalo)' : lang === 'hi' ? 'गाय / भैंस (Cattle/Buffalo)' : 'Cattle / Buffalo',
      suspected_condition:
        lang === 'mr'
          ? 'लाळ्या खुरकूत रोग (Foot and Mouth Disease - FMD)'
          : lang === 'hi'
          ? 'खुरपका-मुंहपका रोग (Foot and Mouth Disease - FMD)'
          : 'Foot and Mouth Disease (FMD)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Highly Contagious Viral Disease: Immediate quarantine and mucosal antiseptic washing required.',
      first_aid_steps: [
        lang === 'mr'
          ? 'तोंडातील फोड पोटॅशियम परमँगनेटच्या (लाल औषध) हलक्या गुलाबी पाण्याने किंवा तुरटीच्या पाण्याने स्वच्छ धुवा.'
          : lang === 'hi'
          ? 'मुंह के छालों को लाल दवा (पोटाश) या फिटकरी के हल्के घोल से धोएं।'
          : 'Wash mouth blisters twice daily with a very dilute (pink) potassium permanganate (0.1%) or alum solution.',
        lang === 'mr'
          ? 'खुरांमधील जखमा धुवून त्यावर फिनाइल किंवा जंतुनाशक मलम आणि कापूर लावा जेणेकरून माश्या बसणार नाहीत.'
          : lang === 'hi'
          ? 'खुरों के घाव साफ करके बोरिक एसिड व हल्दी का लेप लगाएं ताकि मक्खियां न बैठें।'
          : 'Clean foot lesions and apply neem-turmeric oil with camphor to prevent blowfly strike and maggot infestation.',
        lang === 'mr'
          ? 'जनावराला खाणे सोपे जावे म्हणून मऊ, हिरवा चारा, लापशी किंवा उकडलेली मका/गूळ पाणी द्या.'
          : lang === 'hi'
          ? 'मुलायम हरा चारा, दलिया या गुड़ की पतली लापसी खिलाएं ताकि चबाने में दर्द न हो।'
          : 'Provide soft, palatable diet: Cooked rice gruel, lukewarm jaggery water, and tender chopped green forage.',
        lang === 'mr'
          ? 'गोठ्यात चुन्याची पावडर पसरून कोरडी आणि स्वच्छ जागा ठेवा.'
          : lang === 'hi'
          ? 'बाड़े के फर्श पर सूखा चूना छिड़कें और फर्श को सूखा रखें।'
          : 'Spread dry slaked lime on the shed floor to decontaminate viral viral shedding.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'जनावराला चिखलात किंवा खडकाळ रस्त्यावर चालवू नका; खुरांतील जखमा चिघळू शकतात.'
          : lang === 'hi'
          ? 'पशु को कीचड़ या पक्के खुरदुरे रास्ते पर बिल्कुल न चलने दें।'
          : 'Do not allow the animal to walk through mud, water-logged tracks, or harsh rocky surfaces.',
      recommended_local_product: 'Potassium Permanganate Crystals + Himax Antiseptic Ointment + Topicure Spray',
      local_voice_script_english: 'Warning! Suspected Foot and Mouth Disease. Wash mouth with mild pink potash water and keep hooves clean.',
      local_voice_script_hindi: 'सावधान! खुरपका-मुंहपका रोग के लक्षण हैं। मुंह को लाल दवा से धोएं और खुरों पर मक्खी न बैठने दें।',
      local_voice_script_marathi: 'सावधान! लाळ्या खुरकूत रोगाचे लक्षण आहे. तोंड तुरटीच्या पाण्याने धुवा आणि खुरांना स्वच्छ ठेवा.',
    }),
  },

  // 12. Clinical Mastitis
  {
    id: 'clinical_mastitis',
    match: (q) =>
      q.includes('mastitis') ||
      q.includes('कास') ||
      q.includes('थन') ||
      q.includes('थनैल') ||
      q.includes('udder') ||
      q.includes('teat') ||
      q.includes('blood in milk') ||
      q.includes('दूध में खून') ||
      q.includes('रक्त दूध') ||
      (q.includes('दूध') && (q.includes('गाठी') || q.includes('पिवळ') || q.includes('कमी'))),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'दुभती गाय / म्हैस' : lang === 'hi' ? 'दुधारू गाय / भैंस' : 'Dairy Cow / Buffalo',
      suspected_condition:
        lang === 'mr'
          ? 'कासदाह / मस्टायटिस (Clinical Mastitis / Udder Inflammation)'
          : lang === 'hi'
          ? 'थनैल रोग / स्तनशोथ (Clinical Mastitis)'
          : 'Clinical Mastitis (Bovine Udder Infection)',
      urgency_badge: '🟡 YELLOW',
      is_emergency_dispatch_needed: false,
      trigger_emergency_dispatch: false,
      doctor_status: 'Moderate Bacterial Infection: Frequent milk evacuation and herbal EVM topical paste advised. Intramammary tube if not resolved in 24h.',
      first_aid_steps: [
        lang === 'mr'
          ? 'बाधित सडातून खराब, गाठी असलेले दूध दर २ तासांनी पूर्णपणे पिळून काढा आणि जमिनीत पुरा (जनावराखाली पडू देऊ नका).'
          : lang === 'hi'
          ? 'संक्रमित थन से खराब दूध हर 2 घंटे में पूरी तरह निचोड़कर जमीन में गाड़ दें।'
          : 'Completely strip out the infected milk from affected quarter every 2 hours and safely discard away from shed.',
        lang === 'mr'
          ? 'कास गरम आणि सुजलेली असल्यास बर्फाने किंवा थंड पाण्याच्या पट्ट्यांनी १०-१५ मिनिटे शेका.'
          : lang === 'hi'
          ? 'थन में सूजन व गर्मी होने पर ठंडे पानी या बर्फ की पट्टी से 10 मिनट सेक करें।'
          : 'Apply cold wet towels or ice compresses for 10-15 minutes to reduce acute heat and edema.',
        lang === 'mr'
          ? 'एनडीडीबीचा पारंपारिक मलम लावा: २५० ग्रॅम कोरफड, ५० ग्रॅम हळद आणि १५ ग्रॅम चुना एकत्र बारीक वाटून कासेवर लेप लावा.'
          : lang === 'hi'
          ? 'NDDB का घरेलू लेप लगाएं: 250g घृतकुमारी (एलोवेरा), 50g हल्दी और 15g चूना पीसकर थन पर दिन में 3 बार लेप करें।'
          : 'Apply NDDB Ethnoveterinary paste: Blend 250g Aloe vera, 50g turmeric powder, and 15g edible slaked lime into a smooth paste and apply over udder.',
        lang === 'mr'
          ? 'दुधाची धार पिळताना अंगठा मोडून पिळू नका, पूर्ण हाताने (Full Hand Milking) धार काढा.'
          : lang === 'hi'
          ? 'दूध हमेशा पूरे हाथ से (फुल हैंड) निकालें, अंगूठा मोड़कर न दबाएं।'
          : 'Always practice full-hand milking; never use thumb-knuckle stripping which damages teat tissues.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'कासेवर गरम पाणी ओतू नका आणि अस्वच्छ हातांनी दूध काढू नका.'
          : lang === 'hi'
          ? 'थन पर गरम पानी न डालें और गंदे हाथों से दूध न दुहें।'
          : 'Do not apply hot water on inflamed udder or use contaminated teat cannulas.',
      recommended_local_product: 'Mastilep Gel / Wisprec Ointment / Trisodium Citrate Powder (Masti-Kit)',
      local_voice_script_english: 'Mastitis detected. Frequently strip out spoiled milk and apply aloe vera turmeric paste.',
      local_voice_script_hindi: 'गाय भैंस में थनैल के लक्षण हैं। थन से खराब दूध बार-बार निकालें और एलोवेरा-हल्दी का लेप लगाएं।',
      local_voice_script_marathi: 'जनावराच्या कासेला सूज (मस्टायटिस) आहे. खराब दूध वारंवार पिळून काढा आणि कोरफड-हळद लेप लावा.',
    }),
  },

  // 13. Acute Bloat / Tympany (पोटफुगी / अफरा)
  {
    id: 'acute_bloat_tympany',
    match: (q) =>
      q.includes('bloat') ||
      q.includes('अफरा') ||
      q.includes('पोट फुग') ||
      q.includes('पेट फूल') ||
      q.includes('tympany') ||
      (q.includes('belly') && q.includes('swollen')),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'गाय / म्हैस / बैल' : lang === 'hi' ? 'गाय / भैंस / बैल' : 'Ruminant (Cow/Buffalo)',
      suspected_condition:
        lang === 'mr'
          ? 'तीव्र पोटफुगी / अफरा (Acute Rumen Tympany / Bloat)'
          : lang === 'hi'
          ? 'अफरा रोग / पेट फूलना (Acute Rumen Tympany / Bloat)'
          : 'Acute Rumen Tympany (Bloat)',
      urgency_badge: '🟡 YELLOW',
      is_emergency_dispatch_needed: false,
      trigger_emergency_dispatch: false,
      doctor_status: 'Moderate Rumen Distention: Administer antifoaming agent and carminative spices. Emergency trocarization needed only if suffocating.',
      first_aid_steps: [
        lang === 'mr'
          ? 'जनावराच्या तोंडाआड लाकडी काठी आडवी बांधा (जेणेकरून जनावर चघळेल आणि ढेकर येऊन गॅस बाहेर पडेल).'
          : lang === 'hi'
          ? 'पशु के मुंह में आड़ी लकड़ी बांधें ताकि वह जुगाली करे और डकार आने से गैस निकले।'
          : 'Fasten a smooth wooden gag across the mouth to stimulate continuous chewing, salivation, and eructation.',
        lang === 'mr'
          ? '१०० मिली गोडेतेल / जवस तेल + ५० मिली हिंग आणि आल्याचा रस एकत्र करून पाजा (पोटातील फेस फुटतो).'
          : lang === 'hi'
          ? '100 मिली मीठा तेल (अलसी या सरसों) में 10 ग्राम हींग मिलाकर पिलाएं ताकि झाग टूटे।'
          : 'Drench with 100-200ml vegetable/mustard/linseed oil mixed with 10g asafoetida (hing) and ginger to break froth.',
        lang === 'mr'
          ? 'जनावराच्या डाव्या कुशीवर दोन्ही हातांनी हलक्या हाताने खालून वर मालिश करा.'
          : lang === 'hi'
          ? 'पशु की बाईं कोख पर नीचे से ऊपर की ओर धीरे-धीरे मालिश करें।'
          : 'Gently massage the left paralumbar fossa (left flank) in upward strokes to assist gas expulsion.',
        lang === 'mr'
          ? 'जनावराला चढावर उभे करा (पुढील पाय उंच आणि मागील पाय खाली ठेवा).'
          : lang === 'hi'
          ? 'पशु के आगे के पैर किसी ऊंची ढलान पर रखें ताकि फेफड़ों पर दबाव कम हो।'
          : 'Stand the animal on an upward incline (forequarters elevated) to relieve pressure on the diaphragm.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'अनुभवी पशुवैद्यकाशिवाय सुरीने किंवा तीक्ष्ण वस्तूने पोट टोचण्याचा प्रयत्न करू नका.'
          : lang === 'hi'
          ? 'बिना डॉक्टर के चाकू या सुई से पेट में छेद करने का प्रयास न करें।'
          : 'Never puncture the left flank with kitchen knives or unsterilized needles without a qualified vet.',
      recommended_local_product: 'Bloatosil / Tympol / Blotasil Oral Emulsion + Asafoetida (Hing)',
      local_voice_script_english: 'Bloat detected. Tie a wooden gag in mouth, drench linseed oil with asafoetida, and elevate front legs.',
      local_voice_script_hindi: 'पशु में अफरा के लक्षण हैं। मुंह में लकड़ी बांधें, सरसों तेल में हींग मिलाकर दें और आगे के पैर ऊंचे रखें।',
      local_voice_script_marathi: 'जनावराचे पोट फुगले आहे. तोंडात काठी बांधा, गोडेतेलात हिंग मिसळून पाजा आणि पुढील पाय उंच ठेवा.',
    }),
  },

  // 14. Downer Cow / Milk Fever (Post-Partum Hypocalcemia)
  {
    id: 'downer_cow_milk_fever',
    match: (q) =>
      q.includes('downer') ||
      q.includes('milk fever') ||
      q.includes('hypocalcemia') ||
      q.includes('उठ नहीं') ||
      q.includes('उठू शकत नाही') ||
      q.includes('cannot stand') ||
      q.includes('unable to stand') ||
      (q.includes('lying') && (q.includes('calving') || q.includes('ब्यांत'))),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'व्यायलेली गाय / म्हैस' : lang === 'hi' ? 'ताजा ब्याई गाय / भैंस' : 'Freshly Calved Cow / Buffalo',
      suspected_condition:
        lang === 'mr'
          ? 'मिल्क फिव्हर / कॅल्शियमची तीव्र कमतरता (Milk Fever / Hypocalcemia)'
          : lang === 'hi'
          ? 'मिल्क फीवर / प्रसवकालीन कैल्शियम कमी (Milk Fever / Hypocalcemia)'
          : 'Bovine Milk Fever (Post-Partum Hypocalcemia / Downer Syndrome)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Metabolic Emergency: Serum calcium crash. Intravenous Calcium Borogluconate required within 4 hours!',
      first_aid_steps: [
        lang === 'mr'
          ? 'जनावराला पोटावर बसावून ठेवा (छातीवर भार देऊन बसावा, एका अंगावर आडवे पडू देऊ नका; अन्यथा फुफ्फुसावर ताण येतो).'
          : lang === 'hi'
          ? 'पशु को छाती के बल बैठाएं (स्टर्नल पोजीशन), एक तरफ करवट लेकर लेटने न दें।'
          : 'Prop animal into sternal recumbency (sitting upright on chest) using straw bales to prevent rumen bloating.',
        lang === 'mr'
          ? 'जनावराचे कान आणि शरीर थंड पडले असल्यास गोणपाटाने किंवा घोंगडीने अंग झाकून ठेवा आणि चोळा.'
          : lang === 'hi'
          ? 'कान और पैर ठंडे हों तो बोरी या कंबल से ढंकें और सूखी घास से रगड़ें।'
          : 'Rub ears and limbs with dry gunny bags; cover with a warm blanket if hypothermic.',
        lang === 'mr'
          ? 'जनावराचे संपूर्ण दूध अजिबात काढू नका; वासराला पिण्यापुरतेच थोडे दूध काढा.'
          : lang === 'hi'
          ? 'पशु का पूरा दूध बिल्कुल न दुहें, केवल बछड़े के पीने लायक ही निकालें।'
          : 'Do not completely strip out the udder; complete milking drops blood calcium further.',
        lang === 'mr'
          ? 'पशुवैद्यकाकडून कॅल्शियम बोरोर्ग्लुकोनेट (Mifex / Calboro) सलाईन शिरेतून (IV) सावकाश चढवा.'
          : lang === 'hi'
          ? 'पशु चिकित्सक से तुरंत नस द्वारा कैल्शियम (Mifex / Calboro) चढ़वाएं।'
          : 'Veterinary emergency: Slow intravenous infusion of Calcium Borogluconate (Mifex).',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'जनावर बेशुद्ध किंवा मान टाकून बसले असल्यास तोंडावाटे काहीही पाजण्याचा प्रयत्न करू नका (फुफ्फुसात जाऊ शकते).'
          : lang === 'hi'
          ? 'बेहोश या बैठी गाय के मुंह में कोई भी तरल न डालें, सांस नली में जा सकता है।'
          : 'Never drench oral liquids into a recumbent, semi-conscious cow due to swallowed paralysis.',
      recommended_local_product: 'IV Calcium Borogluconate (Mifex) + Oral Calcium Gel (Cal-Up / Ostovet)',
      local_voice_script_english: 'Urgent! Milk fever calcium crash. Sit cow upright on chest, keep warm, and call vet for calcium injection.',
      local_voice_script_hindi: 'अति आवश्यक! गाय में मिल्क फीवर के लक्षण हैं। गाय को छाती के बल बैठाएं और तुरंत डॉक्टर से कैल्शियम चढ़वाएं।',
      local_voice_script_marathi: 'तातडीचा इशारा! गायीला मिल्क फिव्हर आहे. तिला छातीवर सरळ बसवून ठेवा आणि लगेच कॅल्शियम सलाईन द्या.',
    }),
  },

  // 15. Canine Parvovirus
  {
    id: 'canine_parvovirus',
    match: (q, species) =>
      (species === 'dog' || q.includes('dog') || q.includes('puppy') || q.includes('कुत्रा') || q.includes('कुत्ता')) &&
      (q.includes('parvo') ||
        q.includes('vomit') ||
        q.includes('blood') ||
        q.includes('उलटी') ||
        q.includes('दुर्गंधी') ||
        q.includes('smell') ||
        (q.includes('diarrhea') && q.includes('dog'))),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'कुत्रा / पिल्लू (Dog/Puppy)' : lang === 'hi' ? 'कुत्ता / पिल्ला (Dog/Puppy)' : 'Dog / Puppy',
      suspected_condition:
        lang === 'mr'
          ? 'कॅनाइन पार्व्होव्हायरस / रक्तमिश्रित जुलाब (Canine Parvovirus - CPV)'
          : lang === 'hi'
          ? 'कैनाइन पार्वो वायरस / खूनी दस्त (Canine Parvovirus - CPV)'
          : 'Canine Parvovirus (Acute Hemorrhagic Enteritis)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Life-Threatening Viral Emergency: Rapid dehydration and sepsis. Intravenous fluids (RL/DNS) required immediately!',
      first_aid_steps: [
        lang === 'mr'
          ? 'तोंडावाटे अन्न आणि पाणी देणे तात्पुरते थांबवा (पाण्याने आणखी उलट्या होतात).'
          : lang === 'hi'
          ? 'मुंह से खाना और पानी तुरंत बंद कर दें (पानी से भी उल्टी हो सकती है)।'
          : 'Withhold all oral food and water completely to rest the severely inflamed gut.',
        lang === 'mr'
          ? 'पिल्लाला उबदार ठिकाणी मऊ कपड्यावर ठेवा; शरीराचे तापमान कमी होऊ देऊ नका.'
          : lang === 'hi'
          ? 'पिल्ले को गर्म कपड़े पर रखें और ठंड से बचाएं।'
          : 'Keep the puppy warm and cozy using blankets and hot water bottles.',
        lang === 'mr'
          ? 'पिल्लाला इतर निरोगी कुत्र्यांपासून पूर्णपणे वेगळे ठेवा (अतिसंसर्गजन्य आजार).'
          : lang === 'hi'
          ? 'संक्रमित पिल्ले को दूसरे स्वस्थ कुत्तों से तुरंत अलग करें।'
          : 'Strictly isolate from all other dogs; the virus is highly infectious.',
        lang === 'mr'
          ? 'पशुवैद्यकीय दवाखान्यात नेऊन तातडीने सलाईन (IV Fluid), अँटी-एमेटिक (उलटीचे औषध) आणि अँटीबायोटिक सुरू करा.'
          : lang === 'hi'
          ? 'पशु अस्पताल ले जाकर तुरंत नस द्वारा सलाइन (IV ड्रिप) और उल्टी रोकने का इंजेक्शन लगवाएं।'
          : 'Immediate veterinary emergency: IV fluid resuscitation (Ringer Lactate), Ondansetron antiemetic, and broad-spectrum antibiotics.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'कुत्र्याला माणसाचे पॅरासिटामॉल किंवा वेदनाशामक औषध देऊ नका (कुत्र्यांसाठी ते विषारी असते).'
          : lang === 'hi'
          ? 'इंसानों की पैरासिटामोल या दर्द की दवा बिल्कुल न दें (कुत्तों के लिए जानलेवा)।'
          : 'Never administer human painkillers or paracetamol, which causes fatal liver and kidney failure in dogs.',
      recommended_local_product: 'IV Ringer Lactate + Ondansetron Injection + Ceftriaxone Antibiotic',
      local_voice_script_english: 'Emergency! Suspected canine parvovirus. Stop oral food and water, keep puppy warm, and start IV fluids immediately.',
      local_voice_script_hindi: 'सावधान! पिल्ले में पार्वो वायरस के लक्षण हैं। मुंह से खाना-पानी बंद करें और तुरंत डॉक्टर से ड्रिप लगवाएं।',
      local_voice_script_marathi: 'सावधान! पिल्लामध्ये पार्व्होव्हायरसचे लक्षण आहे. तोंडातून अन्न-पाणी बंद करा आणि तातडीने सलाईन सुरू करा.',
    }),
  },

  // 16. Poultry Ranikhet / Newcastle
  {
    id: 'poultry_ranikhet',
    match: (q, species) =>
      (species === 'poultry' || q.includes('poultry') || q.includes('chicken') || q.includes('कोंबडी') || q.includes('मुर्गी')) &&
      (q.includes('neck') ||
        q.includes('ranikhet') ||
        q.includes('newcastle') ||
        q.includes('twist') ||
        q.includes('paralysis') ||
        q.includes('green diarrhea')),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'कोंबडी / पोल्ट्री' : lang === 'hi' ? 'मुर्गी / पोल्ट्री' : 'Poultry / Chicken',
      suspected_condition:
        lang === 'mr'
          ? 'राणीखेत रोग / मान मुरगळणे (Newcastle Disease - Ranikhet)'
          : lang === 'hi'
          ? 'रानीखेत रोग / गर्दन घूमना (Newcastle Disease - Ranikhet)'
          : 'Newcastle Disease (Ranikhet / Avian Paramyxovirus)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Severe Avian Epidemic: Strict flock quarantine and biosecurity disinfection required!',
      first_aid_steps: [
        lang === 'mr'
          ? 'बाधित पक्ष्यांना निरोगी कळपापासून तातडीने पूर्णपणे वेगळे करा.'
          : lang === 'hi'
          ? 'प्रभावित मुर्गियों को तुरंत स्वस्थ झुंड से अलग करें।'
          : 'Strictly isolate all symptomatic birds immediately from the healthy flock.',
        lang === 'mr'
          ? 'पिण्याच्या पाण्यात व्हिटॅमिन ई + सेलेनियम आणि इलेक्ट्रोलाइट्स मिसळा.'
          : lang === 'hi'
          ? 'पीने के पानी में विटामिन ई + सेलेनियम और इलेक्ट्रोलाइट पाउडर मिलाएं।'
          : 'Add Vitamin E + Selenium and oral electrolytes to clean drinking water.',
        lang === 'mr'
          ? 'शेडमध्ये चुना पावडर पसरून गादी कोरडी आणि उबदार ठेवा.'
          : lang === 'hi'
          ? 'बाड़े में सूखा चूना छिड़कें और बिछावन को सूखा रखें।'
          : 'Spread dry slaked lime on coop floor to maintain dry, warm litter.',
        lang === 'mr'
          ? 'भांडी पोटॅशियम परमॅंगनेटच्या द्रावणाने स्वच्छ धुवा.'
          : lang === 'hi'
          ? 'पानी के बर्तनों को पोटाश (KMNO4) के घोल से धोएं।'
          : 'Sanitize drinkers with 0.1% potassium permanganate solution.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'आजारी पक्ष्यांचा संपर्क निरोगी पक्ष्यांशी येऊ देऊ नका.'
          : lang === 'hi'
          ? 'बीमार मुर्गियों का दाना-पानी स्वस्थ पक्षियों से न मिलाएं।'
          : 'Do not share feed or water containers with healthy flock.',
      recommended_local_product: 'Electrolyte Powder + ImmuPlus Poultry Tonic + Slaked Lime',
      local_voice_script_english: 'Warning! Suspected Newcastle disease in poultry flock. Immediate isolation required.',
      local_voice_script_hindi: 'सावधान! मुर्गियों में रानीखेत रोग का खतरा है। तुरंत अलग करें और पानी में इलेक्ट्रोलाइट दें।',
      local_voice_script_marathi: 'सावधान! कोंबड्यांमध्ये राणीखेत रोगाचा धोका आहे. बाधित पक्ष्यांना लगेच वेगळे करा.',
    }),
  },

  // 17. Poultry Coccidiosis / Enteritis
  {
    id: 'poultry_coccidiosis',
    match: (q, species) => species === 'poultry' || q.includes('poultry') || q.includes('कोंबडी') || q.includes('मुर्गी'),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'कोंबडी / पोल्ट्री' : lang === 'hi' ? 'मुर्गी / पोल्ट्री' : 'Poultry / Chicken',
      suspected_condition:
        lang === 'mr'
          ? 'कॉकसिडिओसिस / पोल्ट्री पचन विकार (Coccidiosis / Digestive Stress)'
          : lang === 'hi'
          ? 'कॉक्सीडियोसिस / पाचन तनाव (Coccidiosis / Enteritis)'
          : 'Avian Coccidiosis / Digestive Stress',
      urgency_badge: '🟡 YELLOW',
      is_emergency_dispatch_needed: false,
      trigger_emergency_dispatch: false,
      doctor_status: 'Moderate poultry stress: Maintain clean, dry litter and monitor flock feed intake for 24 hours.',
      first_aid_steps: [
        lang === 'mr'
          ? 'गादी (Litter) पूर्णपणे कोरडी ठेवा आणि ओली गादी ताबडतोब बदला.'
          : lang === 'hi'
          ? 'गीले बिछावन को तुरंत बदलें और फर्श सूखा रखें।'
          : 'Keep coop litter completely dry and replace any wet patches.',
        lang === 'mr'
          ? 'पिण्याच्या पाण्यात हळद (२ ग्रॅम) आणि लसणाचा अर्क (५ मिली प्रति लिटर) मिसळा.'
          : lang === 'hi'
          ? 'पानी में हल्दी और लहसुन का अर्क मिलाकर दें।'
          : 'Add crushed garlic extract (5ml) and turmeric (2g) per liter of drinking water.',
        lang === 'mr'
          ? 'पचन सुधारण्यासाठी पाण्यात थोडे ताक आणि इलेक्ट्रोलाइट्स द्या.'
          : lang === 'hi'
          ? 'पाचन सुधार के लिए छाछ और ओआरएस पानी में दें।'
          : 'Provide mild probiotic whey water with electrolytes for gut recovery.',
        lang === 'mr'
          ? '२४ तासांत सुधारणा न झाल्यास स्थानिक औषध विक्रेत्याकडून अँटी-कॉकसिडिअल औषध घ्या.'
          : lang === 'hi'
          ? '24 घंटे में सुधार न होने पर एंटी-कॉक्सीडियल दवा दें।'
          : 'If symptoms persist beyond 24 hours, administer veterinary coccidiostat.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'दमट किंवा ओलसर जागेत पक्षी ठेवू नका.'
          : lang === 'hi'
          ? 'मुर्गियों को सीलन वाली जगह पर न रखें।'
          : 'Do not keep birds in damp, poorly ventilated cages.',
      recommended_local_product: 'Amprolium Powder / Neodox-Forte / Electrolyte Solution',
      local_voice_script_english: 'Poultry digestive stress. Keep bedding dry and provide garlic turmeric water.',
      local_voice_script_hindi: 'मुर्गियों का बिछावन सूखा रखें और पानी में हल्दी व लहसुन का रस दें।',
      local_voice_script_marathi: 'कोंबड्यांची गादी कोरडी ठेवा आणि हळद-लसूण पाणी द्या.',
    }),
  },

  // 18. Calf Scours / Dehydration (नवजात वासरांची हगवण)
  {
    id: 'calf_scours',
    match: (q) =>
      (q.includes('calf') || q.includes('वासरू') || q.includes('बछड़ा') || q.includes('बछिया')) &&
      (q.includes('diarrhea') || q.includes('scour') || q.includes('हगवण') || q.includes('दस्त') || q.includes('सफेद दस्त')),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'नवजात वासरू (Young Calf)' : lang === 'hi' ? 'नवजात बछड़ा (Young Calf)' : 'Young Calf',
      suspected_condition:
        lang === 'mr'
          ? 'वासरांचा पांढरा संडास / अतिसार (Calf Scours / Severe Dehydration)'
          : lang === 'hi'
          ? 'बछड़े का सफेद दस्त / अतिसार (Neonatal Calf Scours)'
          : 'Neonatal Calf Scours (Severe Dehydration Crisis)',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'High Calf Mortality Risk: Rapid electrolyte loss. Warmth and oral electrolyte rehydration required immediately!',
      first_aid_steps: [
        lang === 'mr'
          ? 'दूध पाजणे तात्पुरते थांबवा आणि दर २ तासांनी २०० मिली कोमट ओआरएस (ORS) इलेक्ट्रोलाइट पाणी पाजा.'
          : lang === 'hi'
          ? 'दूध पिलाना कुछ घंटे रोकें और हर 2 घंटे पर 200 ml गुनगुना ओआरएस घोल पिलाएं।'
          : 'Temporarily withdraw milk; feed 200ml lukewarm oral rehydration electrolyte solution every 2 hours.',
        lang === 'mr'
          ? 'वासराला कोरड्या, उबदार आणि मऊ अंथरुणावर ठेवा; अंग थंड पडू देऊ नका.'
          : lang === 'hi'
          ? 'बछड़े को सूखे व गर्म बिछावन पर रखें, ठंड बिल्कुल न लगने दें।'
          : 'Keep calf warm on deep dry straw bedding; guard against hypothermia.',
        lang === 'mr'
          ? 'जुलाब थांबवण्यासाठी इसबगोल भुशी (१० ग्रॅम) आणि हळद कोमट पाण्यात मिसळून द्या.'
          : lang === 'hi'
          ? 'दस्त रोकने के लिए 10 ग्राम ईसबगोल की भूसी और हल्दी पानी में दें।'
          : 'Administer 10g Psyllium husk (Isabgol) with turmeric in lukewarm water.',
        lang === 'mr'
          ? 'पशुवैद्यकाकडून अँटी-डायरियल आणि इलेक्ट्रोलाइट सलाईन इंजेक्शन द्या.'
          : lang === 'hi'
          ? 'पशु चिकित्सक से तुरंत एंटीबायोटिक और ड्रिप लगवाएं।'
          : 'Veterinary antibiotic coverage (Enrofloxacin / Amoxicillin) and parenteral fluid therapy.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'वासराला थंड पाणी किंवा शिळे दूध पाजू नका.'
          : lang === 'hi'
          ? 'बछड़े को ठंडा पानी या बासी दूध न पिलाएं।'
          : 'Never feed cold water or sour milk to a scouring dehydrated calf.',
      recommended_local_product: 'Oral Electrolyte Powder (Calf-Lyte) + Neblon Anti-diarrhoeal Powder',
      local_voice_script_english: 'Caution! Calf diarrhea causes rapid dehydration. Keep calf warm and give warm ORS solution.',
      local_voice_script_hindi: 'सावधान! बछड़े में सफेद दस्त है। बछड़े को गर्म रखें और गुनगुना ओआरएस घोल बार-बार पिलाएं।',
      local_voice_script_marathi: 'सावधान! वासराला जुलाब होत आहेत. वासराला उबदार ठेवा आणि कोमट ओआरएस पाणी पाजा.',
    }),
  },

  // 19. High Fever / Pyrexia
  {
    id: 'high_fever',
    match: (q) =>
      q.includes('fever') ||
      q.includes('ताप') ||
      q.includes('बुखार') ||
      q.includes('104') ||
      q.includes('105') ||
      q.includes('106') ||
      q.includes('pyrexia') ||
      q.includes('shiver'),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'पशुधन (Livestock)' : lang === 'hi' ? 'पशु (Livestock)' : 'Livestock',
      suspected_condition:
        lang === 'mr'
          ? 'तीव्र संसर्गजन्य ताप / ज्वर (High Fever / Pyrexia of Unknown Origin)'
          : lang === 'hi'
          ? 'तीव्र बुखार / संक्रामक ज्वर (High Fever / Pyrexia)'
          : 'Acute Bovine Pyrexia (High Fever)',
      urgency_badge: '🟡 YELLOW',
      is_emergency_dispatch_needed: false,
      trigger_emergency_dispatch: false,
      doctor_status: 'Moderate Systemic Fever: Provide antipyretic hydrotherapy and paracetamol bolus. Vet evaluation if >104F after 12 hours.',
      first_aid_steps: [
        lang === 'mr'
          ? 'ताप उतरवण्यासाठी जनावराच्या डोक्यावर आणि मानेवर थंड पाण्याची हलकी धार धरा.'
          : lang === 'hi'
          ? 'बुखार कम करने के लिए सिर और गर्दन पर ठंडे पानी की पट्टी रखें।'
          : 'Apply cold water compresses or pour cool water over the animal head and neck.',
        lang === 'mr'
          ? 'जनावराला थेट उन्हात ठेवू नका; थंड, सावलीच्या आणि मोकळ्या गोठ्यात बांधा.'
          : lang === 'hi'
          ? 'पशु को धूप से बचाकर हवादार व ठंडी छाया में रखें।'
          : 'House in a shaded, well-ventilated stall away from direct sunshine.',
        lang === 'mr'
          ? 'पिण्याच्या पाण्यात थोडे मीठ, गूळ आणि इलेक्ट्रोलाइट पावडर मिसळून पाजा.'
          : lang === 'hi'
          ? 'पीने के पानी में थोड़ा गुड़, नमक और ओआरएस घोलकर दें।'
          : 'Provide fresh drinking water enriched with jaggery and electrolytes.',
        lang === 'mr'
          ? 'ताप १०४ अंशांपेक्षा जास्त असल्यास पशुवैद्यकीय पॅरासिटामॉल किंवा मेलोक्सिकॅम गोळी द्या.'
          : lang === 'hi'
          ? 'तापमान 104°F से अधिक होने पर पशु चिकित्सक की सलाह से पैरासिटामोल बोली दें।'
          : 'Administer veterinary Paracetamol/Meloxicam bolus if rectal temp exceeds 104°F.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'जनावराला जबरदस्तीने जड धान्य किंवा आंबोण खायला घालू नका.'
          : lang === 'hi'
          ? 'तेज बुखार में पशु पर भारी दाना या खली का दबाव न डालें।'
          : 'Do not force feed heavy concentrates during peak fever spikes.',
      recommended_local_product: 'Melonex Plus Bolus / Paracetamol Veterinary Bolus + Electrolyte',
      local_voice_script_english: 'Fever detected. Apply cold water compress to head and provide fresh jaggery water.',
      local_voice_script_hindi: 'पशु को बुखार है। सिर पर ठंडे पानी की पट्टी रखें और गुड़ का पानी पिलाएं।',
      local_voice_script_marathi: 'जनावराला ताप आला आहे. डोक्यावर गार पाण्याच्या पट्ट्या ठेवा आणि गुळाचे पाणी द्या.',
    }),
  },

  // 20. Uterine / Vaginal Prolapse (फूल दिखाना / कांच पडणे)
  {
    id: 'prolapse_emergency',
    match: (q) =>
      q.includes('prolapse') ||
      q.includes('कांच') ||
      q.includes('फूल') ||
      q.includes('वांग') ||
      q.includes('गर्भाशय बाहेर') ||
      q.includes('uterus'),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'गाय / म्हैस' : lang === 'hi' ? 'गाय / भैंस' : 'Cow / Buffalo',
      suspected_condition:
        lang === 'mr'
          ? 'गर्भाशय बाहेर पडणे / कांच (Uterine/Vaginal Prolapse)'
          : lang === 'hi'
          ? 'फूल दिखाना / गर्भाशय बाहर आना (Uterine/Vaginal Prolapse)'
          : 'Uterine / Vaginal Prolapse',
      urgency_badge: '🔴 RED',
      is_emergency_dispatch_needed: true,
      trigger_emergency_dispatch: true,
      doctor_status: 'Surgical Emergency: Prolapsed organ exposed. Professional replacement and purse-string suture needed immediately!',
      first_aid_steps: [
        lang === 'mr'
          ? 'बाहेर पडलेला अवयव जमिनीवरील धूळ, माती आणि शेणापासून वाचवण्यासाठी स्वच्छ सुती कापडाने किंवा प्लास्टिक शीटवर ठेवा.'
          : lang === 'hi'
          ? 'बाहर निकले अंग को मिट्टी व गोबर से बचाने के लिए साफ चादर या पॉलीथिन पर रखें।'
          : 'Keep exposed prolapsed mass elevated on a clean plastic sheet or moist cloth off the dung floor.',
        lang === 'mr'
          ? 'अवयव पोटॅशियम परमँगनेटच्या हलक्या पाण्याने किंवा तुरटीच्या पाण्याने हलक्या हाताने स्वच्छ धुवा.'
          : lang === 'hi'
          ? 'अंग को हल्के पोटाश पानी (KMNO4) या फिटकरी के ठंडे घोल से धोएं।'
          : 'Wash prolapsed tissue gently with cold 0.1% potassium permanganate or mild alum water.',
        lang === 'mr'
          ? 'जनावराचे मागील पाय थोडे उंचावर ठेवा (उतार जमिनीवर उभे करा).'
          : lang === 'hi'
          ? 'पशु के पिछले पैर किसी ऊंची ढलान पर रखें ताकि दबाव कम हो।'
          : 'Stand the animal with hindquarters elevated to lessen abdominal strain.',
        lang === 'mr'
          ? 'पशुवैद्यक येईपर्यंत अवयवाला कोरडे पडू देऊ नका; त्यावर खोबरेल तेल किंवा लिक्विड पॅराफिन लावा.'
          : lang === 'hi'
          ? 'अंग को सूखने न दें; उस पर नारियल तेल या लिक्विड पैराफिन लगाएं।'
          : 'Keep tissue lubricated with clean coconut oil or liquid paraffin until the vet arrives.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'अस्वच्छ हातांनी किंवा ताकद लावून अवयव आत ढकलण्याचा प्रयत्न करू नका (फाटू शकते).'
          : lang === 'hi'
          ? 'जबरदस्ती अंदर धकेलने की कोशिश न करें, नस फट सकती है।'
          : 'Never use rough force or unwashed hands to push the mass inside.',
      recommended_local_product: 'Liquid Paraffin + Potassium Permanganate + Clean Gauze Cloth',
      local_voice_script_english: 'Emergency! Prolapse detected. Keep exposed tissue clean, elevated on a clean sheet, and call vet immediately.',
      local_voice_script_hindi: 'सावधान! पशु में गर्भाशय बाहर आने की समस्या है। अंग को साफ कपड़े पर रखें और तुरंत डॉक्टर को बुलाएं।',
      local_voice_script_marathi: 'तातडीचा इशारा! जनावराचे गर्भाशय बाहेर आले आहे. अवयव स्वच्छ कापडावर ठेवा आणि लगेच डॉक्टरांना बोलवा.',
    }),
  },

  // 21. Ticks / Wound / Maggots (गोचीड / जखम / आळ्या)
  {
    id: 'ticks_wound_maggots',
    match: (q) =>
      q.includes('tick') ||
      q.includes('गोचीड') ||
      q.includes('किलनी') ||
      q.includes('चिचड') ||
      q.includes('wound') ||
      q.includes('जखम') ||
      q.includes('घाव') ||
      q.includes('maggot') ||
      q.includes('कीडे') ||
      q.includes('कीड़े'),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'पशुधन (Livestock)' : lang === 'hi' ? 'पशु (Livestock)' : 'Livestock',
      suspected_condition:
        lang === 'mr'
          ? 'गोचीड प्रादुर्भाव / किडे पडलेली जखम (External Parasites / Maggot Wound)'
          : lang === 'hi'
          ? 'किलनी प्रकोप / कीड़ेदार घाव (Tick Infestation / Maggot Wound)'
          : 'External Parasite Infestation / Maggot Wound',
      urgency_badge: '🟢 GREEN',
      is_emergency_dispatch_needed: false,
      trigger_emergency_dispatch: false,
      doctor_status: 'Mild Skin & Parasite Issue: Topical wound cleaning and fly-repellent herbal spray sufficient.',
      first_aid_steps: [
        lang === 'mr'
          ? 'जखमेतील किडे काढण्यासाठी कापूर खोबरेल तेलात किंवा टर्पेन्टाइन तेलात मिसळून कापसाच्या बोळ्याने जखमेत भरा.'
          : lang === 'hi'
          ? 'घाव के कीड़े मारने के लिए कपूर को नारियल तेल में घोलकर घाव पर लगाएं।'
          : 'Pack wound with camphor dissolved in coconut oil or turpentine to safely suffocate maggots.',
        lang === 'mr'
          ? 'गोचीड काढण्यासाठी कडुनिंबाचे तेल किंवा सिटापोन / ब्युटॉक्स द्रावण सुरक्षितपणे अंगावर लावा.'
          : lang === 'hi'
          ? 'किलनी हटाने के लिए नीम का तेल या ब्यूटॉक्स दवा पानी में मिलाकर लगाएं।'
          : 'Apply dilute Deltamethrin (Butox) or neem oil spray across tick clusters on dewlap and udder.',
        lang === 'mr'
          ? 'जखमेवर माश्या बसू नयेत म्हणून हळद आणि कडुनिंब लेप किंवा टॉपिक्युअर स्प्रे मारा.'
          : lang === 'hi'
          ? 'घाव पर मक्खी न बैठे इसके लिए हल्दी-नीम का लेप या टॉपिक्योर स्प्रे करें।'
          : 'Spray herbal fly-repellent (Topicure / Charmil) twice daily on open abrasions.',
        lang === 'mr'
          ? 'गोठ्यातील भेगांमध्ये चुना आणि कीटकनाशक पावडर टाकून गोचीड नष्ट करा.'
          : lang === 'hi'
          ? 'बाड़े की दीवारों और फर्श पर चूना छिड़कें।'
          : 'White-wash cattle shed walls with slaked lime to eliminate tick crevices.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'हाताने गोचीड ओढून काढताना त्याचे तोंड जनावराच्या त्वचेत राहू देऊ नका.'
          : lang === 'hi'
          ? 'हाथ से किलनी न खींचें, उसका मुंह अंदर रहने से घाव पक जाता है।'
          : 'Do not yank ticks forcefully with bare hands leaving mouthparts embedded.',
      recommended_local_product: 'Topicure Spray / Scavon Vet Cream / Butox 12.5mg/ml',
      local_voice_script_english: 'Skin wound and ticks detected. Apply camphor oil to maggots and use herbal wound spray.',
      local_voice_script_hindi: 'पशु में घाव और किलनी की समस्या है। कपूर का तेल लगाएं और नीम का लेप करें।',
      local_voice_script_marathi: 'जनावराच्या जखमेवर कापूर-खोबरेल तेल लावा आणि गोचीड नियंत्रणासाठी कडुनिंब तेल वापरा.',
    }),
  },

  // 22. Respiratory / Cough / Bronchitis
  {
    id: 'respiratory_cough',
    match: (q) =>
      q.includes('cough') ||
      q.includes('खोकला') ||
      q.includes('खांसी') ||
      q.includes('शिंका') ||
      q.includes('pneumonia') ||
      q.includes('discharge') ||
      q.includes('wheez'),
    diagnose: (lang) => ({
      app_name: 'Vet-Mitra AI (Clinical Engine)',
      animal_identified: lang === 'mr' ? 'पशुधन (Livestock)' : lang === 'hi' ? 'पशु (Livestock)' : 'Livestock',
      suspected_condition:
        lang === 'mr'
          ? 'श्वसन विकार / खोकला आणि सर्दी (Bovine Respiratory Infection / Bronchitis)'
          : lang === 'hi'
          ? 'श्वसन संक्रमण / खांसी और जुकाम (Respiratory Infection / Cough)'
          : 'Bovine Respiratory Infection (Cough / Bronchitis)',
      urgency_badge: '🟡 YELLOW',
      is_emergency_dispatch_needed: false,
      trigger_emergency_dispatch: false,
      doctor_status: 'Moderate Respiratory Stress: Administer herbal cough bolus and steam inhalation. Vet visit if wheezing worsens.',
      first_aid_steps: [
        lang === 'mr'
          ? 'जनावराला निलगिरी तेल किंवा कडुनिंबाच्या पानांची वाफ (स्टीम) १० मिनिटे द्या (श्वासनलिका मोकळी होते).'
          : lang === 'hi'
          ? 'नीलगिरी तेल या नीम के पत्तों की भाप पशु को दें।'
          : 'Administer steam inhalation using eucalyptus oil or camphor in boiling water.',
        lang === 'mr'
          ? 'खो Universal EVM मिश्रण द्या: आले, हळद, काळी मिरी, तुळशी आणि गूळ एकत्र बारीक वाटून गोळा करून खायला द्या.'
          : lang === 'hi'
          ? 'अदरक, हल्दी, काली मिर्च, तुलसी और गुड़ का काढ़ा बनाकर गुनगुना पिलाएं।'
          : 'Feed Ayurvedic expectorant bolus: Crushed ginger, turmeric, black pepper, tulsi, and jaggery.',
        lang === 'mr'
          ? 'जनावराला थेट थंड वारे किंवा पावसाच्या संपर्कापासून दूर ठेवा.'
          : lang === 'hi'
          ? 'पशु को सीधी ठंडी हवा या बारिश से बचाएं।'
          : 'Shield animal from cold drafty winds and damp floorboards.',
        lang === 'mr'
          ? 'स्वच्छ आणि ताजे कोमट पाणी पिण्यास द्या.'
          : lang === 'hi'
          ? 'पशु को हल्का गुनगुना पानी पीने को दें।'
          : 'Provide fresh, lukewarm drinking water throughout the day.',
      ],
      what_not_to_do:
        lang === 'mr'
          ? 'जनावराला धुळीत किंवा धुराच्या गोठ्यात बांधू नका.'
          : lang === 'hi'
          ? 'धूल या धुएं वाली जगह पर पशु को न बांधें।'
          : 'Do not confine in dusty, smoky, or unventilated barns.',
      recommended_local_product: 'Kaf-Kure Powder / Expe-Vet Cough Syrup / Respowin Bolus',
      local_voice_script_english: 'Respiratory cough detected. Give ginger turmeric jaggery bolus and steam inhalation.',
      local_voice_script_hindi: 'पशु में खांसी के लक्षण हैं। अदरक, हल्दी और गुड़ का मिश्रण दें और भाप दिलाएं।',
      local_voice_script_marathi: 'जनावराला खोकला आहे. आले, हळद आणि गुळाचा गोळा द्या आणि निलगिरीची वाफ द्या.',
    }),
  },
];

export function getGeneralIndigestionDiagnosis(lang: 'mr' | 'hi' | 'en'): VetDiagnosisResponse {
  return {
    app_name: 'Vet-Mitra AI (Clinical Engine)',
    animal_identified: lang === 'mr' ? 'पशुधन (Livestock)' : lang === 'hi' ? 'पशु (Livestock)' : 'Livestock',
    suspected_condition:
      lang === 'mr'
        ? 'सामान्य अपचन / भूक मंदावणे (Simple Indigestion / Off Feed)'
        : lang === 'hi'
        ? 'साधारण अपच / भूख में कमी (Simple Indigestion / Off Feed)'
        : 'Simple Indigestion / Anorexia',
    urgency_badge: '🟢 GREEN',
    is_emergency_dispatch_needed: false,
    trigger_emergency_dispatch: false,
    doctor_status: 'Mild digestive sluggishness: Administer digestive appetizer powder and fresh green fodder.',
    first_aid_steps: [
      lang === 'mr'
        ? 'पाचक मसाला द्या: ५० ग्रॅम जिरे, ५० ग्रॅम धने, २५ ग्रॅम ओवा आणि ५० ग्रॅम गूळ एकत्र करून गोळा करून खायला द्या.'
        : lang === 'hi'
        ? 'पाचक मिश्रण दें: 50g जीरा, 50g धनिया, 25g अजवाइन और गुड़ मिलाकर पेड़ा बनाकर खिलाएं।'
        : 'Feed digestive bolus: 50g cumin seeds, 50g coriander, 25g carom seeds (Ajwain), and 50g jaggery.',
      lang === 'mr'
        ? 'जनावराच्या रवंथाला चालना देण्यासाठी ५० ग्रॅम खाण्याचा soda पिण्याच्या पाण्यात किंवा चाऱ्यात द्या.'
        : lang === 'hi'
        ? 'जुगाली बढ़ाने के लिए 50 ग्राम मीठा सोडा (खाने का सोडा) पानी में दें।'
        : 'Provide 50g sodium bicarbonate (baking soda) in drinking water to buffer rumen pH.',
      lang === 'mr'
        ? 'बुरशी लागलेला किंवा शिळा चारा काढून टाका; ताजा, सुका आणि हिरवा चारा द्या.'
        : lang === 'hi'
        ? 'फफूंद लगा या बासी चारा हटाकर ताजा सूखा व हरा चारा दें।'
        : 'Remove moldy or spoiled feed; provide clean dry hay and fresh green forage.',
      lang === 'mr'
        ? 'जनावराला दिवसभरात स्वच्छ व ताजे पिण्याचे पाणी मुबलक प्रमाणात उपलब्ध ठेवा.'
        : lang === 'hi'
        ? 'पशु को दिनभर साफ और ताजा पानी उपलब्ध कराएं।'
        : 'Ensure free access to clean, uncontaminated drinking water.',
    ],
    what_not_to_do:
      lang === 'mr'
        ? 'जास्त प्रमाणात खुराक किंवा आंबोण एकदम देऊ नका.'
        : lang === 'hi'
        ? 'एक साथ बहुत ज्यादा दाना या खली न खिलाएं।'
        : 'Do not overfeed high-carbohydrate grains or abrupt feed switches.',
    recommended_local_product: 'Himalayan Batisa / Ruchamax Digestive Powder / Rumbion Bolus',
    local_voice_script_english: 'Simple indigestion. Administer digestive appetizer and fresh baking soda water.',
    local_voice_script_hindi: 'पशु को जीरा, अजवाइन और गुड़ का पाचक मिश्रण दें तथा ताजा पानी पिलाएं।',
    local_voice_script_marathi: 'जनावराला जिरे, ओवा आणि गुळाचा गोळा द्या आणि खाण्याचा सोडा पाण्यात मिसळून द्या.',
    source: 'clinical_rule_engine',
  };
}
