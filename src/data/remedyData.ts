import { AyurvedicRemedyRecipe } from '../types';

export const AYURVEDIC_RECIPES: AyurvedicRemedyRecipe[] = [
  {
    id: 'remedy_bloat',
    conditionName: 'Acute Bloat & Indigestion (पोटफुगी / अफरा)',
    conditionMarathi: 'तीव्र पोटफुगी व गॅस (अफरा)',
    source: 'NDDB Ethno-Veterinary Field Protocol #04',
    ingredients: [
      { name: 'Fresh Ginger (आले)', nameMarathi: 'ताजे आले', ratioPer100kg: 15, unit: 'g', purpose: 'Carminative & Rumen motility stimulant' },
      { name: 'Cumin Seeds (जिरे)', nameMarathi: 'जिरे', ratioPer100kg: 12, unit: 'g', purpose: 'Digestive enzyme stimulant' },
      { name: 'Asafoetida / Hing (हिंग)', nameMarathi: 'हिंग', ratioPer100kg: 4, unit: 'g', purpose: 'Anti-spasmodic gas release' },
      { name: 'Organic Jaggery (गूळ)', nameMarathi: 'सेंद्रिय गूळ', ratioPer100kg: 30, unit: 'g', purpose: 'Energy vehicle & palatability' },
      { name: 'Sweet Oil / Mustard Oil (गोड तेल)', nameMarathi: 'खाद्य तेल / गोड तेल', ratioPer100kg: 25, unit: 'ml', purpose: 'Defoaming agent breaking gas bubbles' },
      { name: 'Rock Salt / Black Salt (सेंधा मीठ)', nameMarathi: 'सेंधव मीठ', ratioPer100kg: 5, unit: 'g', purpose: 'Salivation and electrolyte balance' },
    ],
    preparationSteps: {
      en: [
        'Grind ginger, cumin, hing, and rock salt into a coarse paste.',
        'Blend the paste thoroughly with jaggery and warm sweet oil.',
        'Administer as a bolus or gently drench along the side of the tongue.',
        'Repeat after 3 hours if rumen fullness persists.',
      ],
      hi: [
        'अदरक, जीरा, हींग और सेंधा नमक को बारीक पीस लें।',
        'इस मिश्रण को गुड़ और गर्म मीठे तेल में अच्छी तरह मिलाएं।',
        'पशु की जीभ के किनारे से धीरे-धीरे यह पेस्ट खिलाएं।',
        'यदि 3 घंटे बाद भी अफरा रहे तो एक बार पुनः दें।',
      ],
      mr: [
        'आले, जिरे, हिंग आणि सेंधव मीठ एकत्र वाटून घ्या.',
        'हा गोळा गुळात आणि कोमट गोड तेलात व्यवस्थित मिसळा.',
        'जिभेच्या बाजूने हळूच जनावराला चाटवा अथवा पाजा.',
        '३ तासांनंतर पोट कमी न झाल्यास पुन्हा एकदा द्या.',
      ],
    },
    cropWasteFeedSupplement: {
      title: 'Sugarcane Bagasse & Straw Fiber Stabilizer',
      ratioBreakdown: 'Chopped Sugarcane Trash (50%) + Wheat Straw (30%) + Green Lucerne (20%)',
      tips: 'Never feed lush green fodder alone during rainy mornings; always mix dry crop straw to buffer rumen pH.',
    },
  },
  {
    id: 'remedy_mastitis',
    conditionName: 'Clinical Mastitis / Udder Heat (कासदाह / थनदाह)',
    conditionMarathi: 'कासदाह व थनाची सूज (कास सुजणे)',
    source: 'TANUVAS & NDDB Peer-Reviewed EVM Protocol #01',
    ingredients: [
      { name: 'Fresh Aloe Vera Leaves (कोरफड)', nameMarathi: 'ताजी कोरफड', ratioPer100kg: 65, unit: 'g', purpose: 'Powerful anti-inflammatory cooling gel' },
      { name: 'Pure Turmeric Powder (हळद)', nameMarathi: 'शुद्ध हळद पावडर', ratioPer100kg: 15, unit: 'g', purpose: 'Natural curcumin antimicrobial' },
      { name: 'Slaked Lime / Chuna (खाण्याचा चुना)', nameMarathi: 'खाण्याचा चुना (कॅल्शियम हायड्रॉक्साइड)', ratioPer100kg: 4, unit: 'g', purpose: 'Permeability enhancer & alkaline agent' },
    ],
    preparationSteps: {
      en: [
        'Peel Aloe vera and grind into smooth gel without adding external water.',
        'Add turmeric powder and slaked lime; grind until it turns a deep crimson paste.',
        'Dilute with 100ml water to a paint-like consistency.',
        'Completely empty the affected teat, wash with water, and apply the crimson paste over the entire udder 4-5 times daily for 5 days.',
      ],
      hi: [
        'एलोवेरा को छीलकर बिना पानी मिलाए चिकना पेस्ट बनाएं।',
        'हल्दी और खाने का चूना मिलाएं; मिश्रण गहरा लाल रंग का हो जाएगा।',
        'दूध पूरा निकालने के बाद पूरे थन और कास पर दिन में ४-५ बार लगाएं।',
      ],
      mr: [
        'कोरफडीचे काटे काढून मिक्सर/पाट्यावर पाणी न घालता बारीक करा.',
        'त्यात हळद आणि चुना मिसळा; रंग लालभडक होईल.',
        'थनातील खराब दूध पूर्ण काढून दिवसातून ४ ते ५ वेळा संपूर्ण कासेवर लेप लावा. सलग ५ दिवस चालू ठेवा.',
      ],
    },
    cropWasteFeedSupplement: {
      title: 'Anti-Oxidant Mineralized Dairy Ration',
      ratioBreakdown: 'Cottonseed Cake (35%) + Maize Bran (35%) + Crushed Gram Chuni (25%) + Mineral Mix (5%)',
      tips: 'Ensure 50g Trisodium Citrate or Vitamin E selenium supplement to rebuild damaged teat secretory cells.',
    },
  },
  {
    id: 'remedy_fever',
    conditionName: 'Fever, Cold & Respiratory Pyrexia (कडक ताप व खोकला)',
    conditionMarathi: 'कडक ताप, खोकला व धाप लागणे',
    source: 'Traditional Indian Veterinary Knowledge Registry',
    ingredients: [
      { name: 'Black Pepper (काळी मिरी)', nameMarathi: 'काळी मिरी', ratioPer100kg: 3, unit: 'g', purpose: 'Piperine bio-enhancer & antipyretic' },
      { name: 'Cumin Seeds (जिरे)', nameMarathi: 'जिरे', ratioPer100kg: 5, unit: 'g', purpose: 'Sweat-inducing fever breaker' },
      { name: 'Betel Leaves (नागवेलीची पाने)', nameMarathi: 'नागवेलीची पाने (विडा पाने)', ratioPer100kg: 2, unit: 'leaves', purpose: 'Bronchodilator & decongestant' },
      { name: 'Garlic Cloves (लसूण)', nameMarathi: 'लसूण पाकळ्या', ratioPer100kg: 4, unit: 'g', purpose: 'Natural allicin antibiotic' },
      { name: 'Jaggery (गूळ)', nameMarathi: 'सेंद्रिय गूळ', ratioPer100kg: 25, unit: 'g', purpose: 'Fast-release glucose to fight body chills' },
    ],
    preparationSteps: {
      en: [
        'Crush black pepper, cumin, garlic, and betel leaves into small bits.',
        'Mix with jaggery to roll into small golf-sized balls (laddus).',
        'Administer 1 ball morning and evening for 3 consecutive days.',
      ],
      hi: [
        'काली मिर्च, जीरा, लहसुन और पान के पत्तों को कूट लें।',
        'गुड़ मिलाकर छोटे-छोटे लड्डू बना लें और सुबह-शाम पशु को खिलाएं।',
      ],
      mr: [
        'काळी मिरी, जिरे, लसूण आणि नागवेलीची पाने ठेचून घ्या.',
        'गुळात एकत्र करून लाडू बनवा आणि सकाळी-संध्याकाळी जनावराला खाऊ घाला.',
      ],
    },
    cropWasteFeedSupplement: {
      title: 'Warm Digestion Energy Mash',
      ratioBreakdown: 'Boiled Broken Wheat (Dalia 50%) + Rice Bran (30%) + Jaggery Water (20%)',
      tips: 'Keep the animal in a draft-free shed on warm dry bedding straw to prevent sudden pneumonia.',
    },
  },
  {
    id: 'remedy_scours',
    conditionName: 'Bovine Scours & Enteritis (हगवण / पातळ संडास)',
    conditionMarathi: 'हगवण व पातळ संडास (सैल शेण)',
    source: 'EVM Clinical Manual for Rural Dairying',
    ingredients: [
      { name: 'Fenugreek Seeds / Methi (मेथी दाणे)', nameMarathi: 'मेथी दाणे', ratioPer100kg: 10, unit: 'g', purpose: 'Mucilaginous gut coating protector' },
      { name: 'Dried Pomegranate Rind (डाळिंबाची साल)', nameMarathi: 'डाळिंबाची वाळलेली साल', ratioPer100kg: 12, unit: 'g', purpose: 'High tannin astringent arresting water loss' },
      { name: 'Poppy Seeds / Khus Khus (खसखस)', nameMarathi: 'खसखस', ratioPer100kg: 3, unit: 'g', purpose: 'Slowing intestinal hyper-motility' },
      { name: 'Curd / Buttermilk (ताक)', nameMarathi: 'घरचे ताक', ratioPer100kg: 75, unit: 'ml', purpose: 'Probiotic restoring rumen microflora' },
    ],
    preparationSteps: {
      en: [
        'Soak fenugreek and pomegranate rind in water for 2 hours, then grind smoothly.',
        'Mix into freshly prepared sour buttermilk.',
        'Drench twice a day until dung consistency normalizes.',
      ],
      hi: [
        'मेथी और अनार के छिलके को पानी में भिगोकर पीसें।',
        'ताजे छाछ में मिलाकर दिन में दो बार पिलाएं।',
      ],
      mr: [
        'मेथी आणि डाळिंबाची साल २ तास भिजवून बारीक वाटा.',
        'ताज्या ताकात मिसळून सकाळी व संध्याकाळी पाजा.',
      ],
    },
    cropWasteFeedSupplement: {
      title: 'Dry Starch Stabilization Ration',
      ratioBreakdown: 'Dry Sorghum Kadbi (60%) + Boiled Rice Congee (30%) + Roasted Bengal Gram (10%)',
      tips: 'Stop feeding urea-treated straw or fresh young green maize during active diarrhea.',
    },
  },
  {
    id: 'remedy_milk_boost',
    conditionName: 'Low-Cost Milk & Fat Booster (दूध व फॅट वाढवणारा आहार)',
    conditionMarathi: 'दूध उत्पादन व फॅट वाढवणारा देशी फॉर्म्युला',
    source: 'National Dairy Research Institute (NDRI) Low-Cost Feeding Model',
    ingredients: [
      { name: 'Crushed Cottonseed (सरकी)', nameMarathi: 'सरकी भरडा', ratioPer100kg: 80, unit: 'g', purpose: 'High bypass fat increasing milk fat percentage' },
      { name: 'Maize Bran / Chuni (मका चुनी)', nameMarathi: 'मका भरडा / चुनी', ratioPer100kg: 100, unit: 'g', purpose: 'Sustained energy and ruminal propionate' },
      { name: 'Mustard Cake / Groundnut Cake (पेंड)', nameMarathi: 'भुईमूग / मोहरी पेंड', ratioPer100kg: 60, unit: 'g', purpose: 'Crude protein for mammary synthesis' },
      { name: 'Mineral Mixture (खनिज मिश्रण - Agribomin)', nameMarathi: 'चिलेटेड खनिज मिश्रण', ratioPer100kg: 15, unit: 'g', purpose: 'Chelated trace minerals for reproductive health' },
    ],
    preparationSteps: {
      en: [
        'Soak cottonseed and oil cake in warm water for 4-6 hours.',
        'Blend with maize bran and 50g mineral mixture per cow daily.',
        'Feed in two divided doses directly after morning and evening milking.',
      ],
      hi: [
        'सरकी और खली को ४-६ घंटे पानी में भिगोएं।',
        'मक्का दलिया और ५० ग्राम मिनरल मिक्स मिलाकर दुहाई के तुरंत बाद खिलाएं।',
      ],
      mr: [
        'सरकी आणि पेंड ४-६ तास पाण्यात भिजवून ठेवा.',
        'त्यात मका भरडा आणि दररोज ५० ग्रॅम खनिज मिश्रण मिसळून सकाळ-संध्याकाळ धार काढल्यानंतर खाऊ घाला.',
      ],
    },
    cropWasteFeedSupplement: {
      title: 'Crop Waste Total Mixed Ration (TMR)',
      ratioBreakdown: 'Dry Kadbi / Soybean Straw (40%) + Hybrid Napier Green Grass (40%) + Concentrate Mash (20%)',
      tips: 'Always chop dry fodder into 1-2 inch pieces using a chaff cutter to increase digestibility by 25%.',
    },
  },
];
