import { PresetSymptomCase } from '../types';

export const PRESET_CASES: PresetSymptomCase[] = [
  {
    id: 'lumpy-skin-cow',
    title: {
      en: 'Cow with Skin Nodules & Fever',
      hi: 'गाय: त्वचा पर सख्त गांठें व तेज बुखार (लंपी स्किन)',
      mr: 'गाय: अंगावर कडक गाठी व तीव्र ताप (लम्पी स्कीन)',
    },
    animalType: 'Cow (गाय)',
    tag: 'Red Alert / Urgent',
    expectedUrgency: '🔴 RED',
    iconName: 'AlertTriangle',
    description: {
      en: 'Multiple 2-5cm round lumps all over body, nasal discharge, 104°F fever, reduced milk.',
      hi: 'शरीर भर 2-5 सेमी की उभरी सख्त गांठें, नाक से पानी, 104°F बुखार और दूध में भारी कमी।',
      mr: 'अंगावर २-५ सेमीच्या गोल गाठी, नाकातून पाणी, १०४°F ताप आणि दुधात घट.',
    },
    sampleSymptoms: 'My HF crossbred cow has developed numerous round hard lumps (2-4 cm) over her neck, back, and legs since yesterday. High fever (around 104°F), watery eye discharge, stopped eating feed, and milk dropped by 70%.',
  },
  {
    id: 'fmd-buffalo',
    title: {
      en: 'Buffalo with Hoof Sores & Drooling (FMD)',
      hi: 'भैंस: खुर में घाव, मुंह में छाले व लार (खुरपका-मुंहपका)',
      mr: 'म्हैस: खुरांना जखमा व तोंडातून लाळ (लाळ्या खुरकूत)',
    },
    animalType: 'Buffalo (भैंस)',
    tag: 'Red Alert / Urgent',
    expectedUrgency: '🔴 RED',
    iconName: 'Footprints',
    description: {
      en: 'Vesicles and sores between hooves, severe limping, ropy saliva dripping from mouth.',
      hi: 'पैरों के खुरों के बीच घाव, लंगड़ा कर चलना, मुंह से तार जैसी गाढ़ी लार टपकना।',
      mr: 'पायांच्या खुरांच्या बेचक्यात जखमा, लंगडणे आणि तोंडातून सतत लाळ गळणे.',
    },
    sampleSymptoms: 'Murrah buffalo is limping severely on both hind feet. There are deep red open sores between the hooves with foul smell. Continuous frothy saliva dripping from mouth, unable to chew dry fodder.',
  },
  {
    id: 'bloat-cow',
    title: {
      en: 'Cow: Distended Left Flank / Bloat',
      hi: 'गाय: बाईं तरफ पेट का अफरा (Tympany/Bloat)',
      mr: 'गाय: डाव्या बाजूला पोट फुगणे (अफरा/पोटफुगी)',
    },
    animalType: 'Cow (गाय)',
    tag: 'Yellow / Caution',
    expectedUrgency: '🟡 YELLOW',
    iconName: 'Activity',
    description: {
      en: 'Left abdomen tightly swollen like a drum after grazing lush berseem/legume pasture.',
      hi: 'ताजा गीला बरसीम या दलहनी चारा खाने के बाद बाईं तरफ का पेट ढोल जैसा टाइट फूला हुआ।',
      mr: 'ओला चारा खाल्ल्यानंतर डावीकडील पोट ढोलासारखे अतिशय फुगले आहे.',
    },
    sampleSymptoms: 'The cow was fed fresh moist berseem clover early this morning. Within 3 hours, her left flank (stomach) is bulged out tightly like a drum. She is stamping legs, breathing rapidly through mouth, and groaning.',
  },
  {
    id: 'mastitis-buffalo',
    title: {
      en: 'Buffalo: Acute Swollen Painful Udder',
      hi: 'भैंस: थन में गर्म सख्त सूजन व दर्द (थनैल/मस्टाइटिस)',
      mr: 'म्हैस: कास अतिशय गरम, कडक व सूज (कासदाह/मस्टायटिस)',
    },
    animalType: 'Buffalo (भैंस)',
    tag: 'Red Alert / Urgent',
    expectedUrgency: '🔴 RED',
    iconName: 'Flame',
    description: {
      en: 'Left rear quarter hot, swollen, blood tinged watery flakes in milk, cow kicking.',
      hi: 'पीछे का बायां थन बहुत गर्म और सख्त, छूने पर लात मारती है, दूध में पानी और पीले छीछड़े।',
      mr: 'मागील कास अतिशय कडक व गरम, हात लावू देत नाही, दुधात पिवळे तुकडे व पाणी.',
    },
    sampleSymptoms: 'Left hind teat and udder quarter is very hot, stony hard, and swollen. Animal does not allow touching or milking, kicking aggressively. When stripped, only yellowish watery liquid with curd-like clumps came out.',
  },
  {
    id: 'ticks-goat',
    title: {
      en: 'Goat: Minor Skin Ticks & Itching',
      hi: 'बकरी: चमड़ी पर चींचड़ (Ticks) व हल्की खुजली',
      mr: 'शेळी: अंगावर गोचिड व खाज (सामान्य घरगुती उपाय)',
    },
    animalType: 'Goat (बकरी)',
    tag: 'Green / Home Care',
    expectedUrgency: '🟢 GREEN',
    iconName: 'CheckCircle2',
    description: {
      en: 'Visible small ticks in ears and under legs, scratching against wall, normal eating.',
      hi: 'कान के अंदर व जांघों पर छोटे चींचड़/किलनी, दीवार से शरीर रगड़ना, चारा सामान्य खा रही है।',
      mr: 'कानांच्या आत व पायांच्या बेचक्यात बारीक गोचिड, भिंतीला अंग घासणे, चारा व्यवस्थित खाते.',
    },
    sampleSymptoms: 'My Black Bengal goat is constantly scratching her ears and neck against the shed pole. Noticed small brown ticks attached inside ear flaps and around thighs. No fever, normal appetite and energetic.',
  },
  {
    id: 'moldy-feed',
    title: {
      en: 'Feed: Moldy Fodder & Aflatoxin Risk',
      hi: 'चारा/दाना: सफेद फफूंद लगा सीलन भरा दाना (टॉक्सिन खतरा)',
      mr: 'खाद्य/चारा: बुरशी लागलेले धान्य व टॉक्सिन धोका',
    },
    animalType: 'Cattle Feed / Fodder (चारा/दाना)',
    tag: 'Yellow / Caution',
    expectedUrgency: '🟡 YELLOW',
    iconName: 'AlertCircle',
    description: {
      en: 'Stored grain sack got wet in rain, white fungal spores and sour musty smell.',
      hi: 'बारिश के कारण दाने की बोरी में नमी आ गई, सफेद फफूंद व खट्टी बदबू आ रही है।',
      mr: 'पावसामुळे गोणीत ओलावा येऊन पांढरी बुरशी तयार झाली आहे, कुबट वास येत आहे.',
    },
    sampleSymptoms: 'The wheat bran and cattle concentrate sack absorbed moisture from roof leakage. There are clusters of white/greenish powdery mold on the grains with a distinct moldy musty odor. Want to know if safe to feed to milch cows.',
  },
];
