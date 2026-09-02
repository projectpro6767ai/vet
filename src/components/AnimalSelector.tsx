import { SupportedLanguage } from '../types';

interface AnimalSelectorProps {
  selectedAnimal: string;
  onSelect: (animal: string) => void;
  currentLang: SupportedLanguage;
}

interface AnimalOption {
  id: string;
  name: {
    en: string;
    hi: string;
    mr: string;
  };
  subtext: {
    en: string;
    hi: string;
    mr: string;
  };
  emoji: string;
  badge?: string;
}

const ANIMALS: AnimalOption[] = [
  {
    id: 'Cow',
    name: { en: 'Cow', hi: 'गाय', mr: 'गाय' },
    subtext: { en: 'Desi / Gir / Crossbred / HF', hi: 'देसी / साहीवाल / संकर', mr: 'गावरान / संकरित' },
    emoji: '🐄',
  },
  {
    id: 'Buffalo',
    name: { en: 'Buffalo', hi: 'भैंस', mr: 'म्हैस' },
    subtext: { en: 'Murrah / Jaffrabadi / Mehsana', hi: 'मुर्रा / जाफराबादी / नीली', mr: 'मुर्रा / जाफराबादी' },
    emoji: '🐃',
  },
  {
    id: 'Goat',
    name: { en: 'Goat', hi: 'बकरी', mr: 'शेळी' },
    subtext: { en: 'Jamnapari / Sirohi / Bengal', hi: 'बरबरी / सिरोही / ब्लैक बंगाल', mr: 'उस्मानाबादी / संगमनेरी' },
    emoji: '🐐',
  },
  {
    id: 'Sheep',
    name: { en: 'Sheep', hi: 'भेड़', mr: 'मेंढी' },
    subtext: { en: 'Deccani / Marwari / Nellore', hi: 'मारवाड़ी / दक्कनी / नेल्लोर', mr: 'दख्खनी / माडग्याळ' },
    emoji: '🐑',
  },
  {
    id: 'Cattle Feed / Fodder',
    name: { en: 'Fodder / Feed', hi: 'चारा व दाना', mr: 'चारा व खाद्य' },
    subtext: { en: 'Green / Silage / Bran / Mold', hi: 'हरा चारा / साइलेज / खली / फफूंद', mr: 'ओला चारा / सायलेज / पेंड' },
    emoji: '🌾',
  },
  {
    id: 'Other Livestock',
    name: { en: 'Other Animal', hi: 'अन्य पशु', mr: 'इतर प्राणी' },
    subtext: { en: 'Calf / Bull / Camel / Equine', hi: 'बछड़ा / सांड़ / ऊंट / घोड़ा', mr: 'वासरू / बैल / इतर' },
    emoji: '🐾',
  },
];

export function AnimalSelector({
  selectedAnimal,
  onSelect,
  currentLang,
}: AnimalSelectorProps) {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ANIMALS.map((animal) => {
          const isSelected = selectedAnimal.toLowerCase().includes(animal.id.toLowerCase());
          return (
            <button
              key={animal.id}
              type="button"
              onClick={() => onSelect(`${animal.name.en} (${animal.name.hi})`)}
              className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:border-emerald-500/40'
              }`}
            >
              <span className="text-3xl sm:text-4xl mb-2 transform group-hover:scale-110 transition duration-200">
                {animal.emoji}
              </span>
              <span className={`font-bold text-sm ${isSelected ? 'text-white font-extrabold' : 'text-slate-200'}`}>
                {animal.name[currentLang]}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 leading-tight mt-1 line-clamp-1">
                {animal.subtext[currentLang]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
