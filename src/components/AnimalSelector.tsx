import { SupportedLanguage } from '../types';

interface AnimalSelectorProps {
  selectedAnimal: string;
  onSelect: (animal: string) => void;
  currentLang: SupportedLanguage;
}

interface LocalizedAnimalOption {
  id: string;
  emoji: string;
  names: Record<SupportedLanguage, string>;
  subtexts: Record<SupportedLanguage, string>;
}

export const ANIMAL_OPTIONS: LocalizedAnimalOption[] = [
  {
    id: 'Cow',
    emoji: '🐄',
    names: {
      en: 'Cow',
      hi: 'गाय',
      mr: 'गाय',
    },
    subtexts: {
      en: 'Desi / Gir / Crossbred / HF',
      hi: 'देशी / गीर / साहीवाल / एचएफ',
      mr: 'देशी / गीर / संकरित / एचएफ',
    },
  },
  {
    id: 'Buffalo',
    emoji: '🐃',
    names: {
      en: 'Buffalo',
      hi: 'भैंस',
      mr: 'म्हैस',
    },
    subtexts: {
      en: 'Murrah / Jaffrabadi / Mehsana',
      hi: 'मुर्रा / जाफराबादी / मेहसाणा',
      mr: 'मुर्‍हा / जाफराबादी / मेहसाणा',
    },
  },
  {
    id: 'Goat',
    emoji: '🐐',
    names: {
      en: 'Goat',
      hi: 'बकरी',
      mr: 'शेळी',
    },
    subtexts: {
      en: 'Jamnapari / Sirohi / Bengal',
      hi: 'बरबरी / सिरोही / ब्लैक बंगाल',
      mr: 'उस्मानाबादी / संगमनेरी / सिरोही',
    },
  },
  {
    id: 'Sheep',
    emoji: '🐑',
    names: {
      en: 'Sheep',
      hi: 'भेड़',
      mr: 'मेंढी',
    },
    subtexts: {
      en: 'Deccani / Marwari / Nellore',
      hi: 'मारवाड़ी / नेल्लोर / देशी',
      mr: 'दख्खनी / माडग्याळ / मेंढी',
    },
  },
  {
    id: 'Poultry',
    emoji: '🐔',
    names: {
      en: 'Poultry',
      hi: 'मुर्गी / पोल्ट्री',
      mr: 'कोंबडी / पोल्ट्री',
    },
    subtexts: {
      en: 'Chicken / Cock / Layer / Broiler',
      hi: 'देसी / लेयर / ब्रायलर',
      mr: 'गावरान / लेयर / ब्रॉयलर',
    },
  },
  {
    id: 'Dog',
    emoji: '🐕',
    names: {
      en: 'Dog',
      hi: 'कुत्ता / पिल्ला',
      mr: 'कुत्रा / पिल्लू',
    },
    subtexts: {
      en: 'Puppy / Guard / Pet',
      hi: 'पिल्ला / पालतू / रक्षक',
      mr: 'पिल्लू / पाळीव / सुरक्षा',
    },
  },
  {
    id: 'Cat',
    emoji: '🐈',
    names: {
      en: 'Cat',
      hi: 'बिल्ली / बच्चा',
      mr: 'मांजर / पिल्लू',
    },
    subtexts: {
      en: 'Kitten / Pet',
      hi: 'बिल्ली का बच्चा / पालतू',
      mr: 'मांजर / पिल्लू / पाळीव',
    },
  },
  {
    id: 'Cattle Feed / Fodder',
    emoji: '🌾',
    names: {
      en: 'Cattle Feed / Fodder',
      hi: 'पशु आहार / चारा',
      mr: 'पशुखाद्य / चारा',
    },
    subtexts: {
      en: 'Green / Silage / Bran / Mold',
      hi: 'हरा चारा / साइलेज / चोकर',
      mr: 'हिरवा चारा / सायलेज / भुसा',
    },
  },
  {
    id: 'Other Livestock',
    emoji: '🐾',
    names: {
      en: 'Other Livestock',
      hi: 'अन्य पशु',
      mr: 'इतर जनावरे',
    },
    subtexts: {
      en: 'Calf / Bull / Camel / Equine',
      hi: 'बछड़ा / बैल / अन्य पशु',
      mr: 'वासरू / बैल / इतर जनावरे',
    },
  },
];

export function AnimalSelector({
  selectedAnimal,
  onSelect,
  currentLang,
}: AnimalSelectorProps) {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-9 gap-3 sm:gap-4">
        {ANIMAL_OPTIONS.map((animal) => {
          const displayName = animal.names[currentLang] || animal.names.en;
          const displaySubtext = animal.subtexts[currentLang] || animal.subtexts.en;

          const isSelected =
            selectedAnimal === animal.id ||
            selectedAnimal === animal.names.en ||
            selectedAnimal === animal.names.hi ||
            selectedAnimal === animal.names.mr ||
            selectedAnimal.toLowerCase().includes(animal.id.toLowerCase());

          return (
            <button
              key={animal.id}
              type="button"
              onClick={() => onSelect(animal.id)}
              className={`flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer relative group active:scale-95 touch-manipulation ${
                isSelected
                  ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] z-10'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:border-emerald-500/40'
              }`}
            >
              <span className="text-3xl sm:text-4xl mb-2 transform group-hover:scale-110 transition duration-200">
                {animal.emoji}
              </span>
              <span
                className={`font-bold text-xs sm:text-sm ${
                  isSelected ? 'text-white font-extrabold' : 'text-slate-200'
                }`}
              >
                {displayName}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 leading-tight mt-1 line-clamp-2 min-h-[1.5em] sm:min-h-0">
                {displaySubtext}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

