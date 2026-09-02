import { X, Phone, ShieldAlert, HeartPulse, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { UI_STRINGS } from '../data/translations';

interface HelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
}

export function HelplineModal({
  isOpen,
  onClose,
  currentLang,
}: HelplineModalProps) {
  if (!isOpen) return null;
  const isHindi = currentLang === 'hi';
  const isMarathi = currentLang === 'mr';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0C0E0B] rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950 via-red-900 to-black text-white flex items-center justify-between border-b border-red-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg font-['Outfit'] text-white">
                {isHindi
                  ? '24x7 पशु चिकित्सा आपातकालीन सेवा'
                  : isMarathi
                  ? '२४x७ पशुवैद्यकीय आणीबाणी सेवा'
                  : '24x7 Emergency Veterinary Helplines'}
              </h3>
              <p className="text-xs text-red-200/80">
                Department of Animal Husbandry & Dairying, Govt. of India
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-red-300 hover:text-white bg-white/5 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-200 text-sm">
          {/* Primary Toll Free Callout */}
          <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                {isHindi ? 'राष्ट्रीय टोल-फ्री नंबर' : isMarathi ? 'राष्ट्रीय टोल-फ्री क्रमांक' : 'National Toll-Free Emergency'}
              </div>
              <div className="text-3xl font-black text-white mt-0.5 tracking-wider font-mono">
                1962
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {isHindi
                  ? 'मोबाइल वेटरनरी यूनिट (पशु एम्बुलेंस) व डॉक्टर परामर्श'
                  : isMarathi
                  ? 'फिरते पशुवैद्यकीय पथक (रुग्णवाहिका) व डॉक्टरांचे मार्गदर्शन'
                  : 'Mobile Veterinary Unit (MVU) & Doctor Dispatch'}
              </div>
            </div>
            <a
              href="tel:1962"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 transition whitespace-nowrap cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>{isHindi ? 'अभी कॉल करें (1962)' : isMarathi ? 'आत्ताच कॉल करा (१९६२)' : 'Call 1962 Now'}</span>
            </a>
          </div>

          {/* Guidelines on what to tell the doctor */}
          <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/10">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>
                {isHindi
                  ? 'डॉक्टर को फोन पर क्या जानकारी दें:'
                  : isMarathi
                  ? 'डॉक्टरांशी बोलताना कोणती माहिती द्यावी:'
                  : 'Information to provide to the Veterinary Officer:'}
              </span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isHindi
                    ? 'पशु का प्रकार व उम्र (उदा. 4 साल की मुर्रा भैंस / देसी गाय)'
                    : isMarathi
                    ? 'जनावराचा प्रकार व वय (उदा. ४ वर्षांची मुर्रा म्हैस / गावरान गाय)'
                    : 'Animal species, breed, and age (e.g. 4 yr old Murrah Buffalo)'}
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isHindi
                    ? 'लक्षण कब से शुरू हुए (उदा. कल सुबह से तेज बुखार 104°F, पेट फूला)'
                    : isMarathi
                    ? 'लक्षणे कधीपासून सुरू झाली (उदा. काल सकाळपासून ताप, पोटफुगी)'
                    : 'Duration of symptoms and rectal temperature if measured'}
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isHindi
                    ? 'क्या चारा खाया था (उदा. गीला बरसीम या कोई नया दाना)'
                    : isMarathi
                    ? 'काय चारा दिला होता (उदा. ओला बरसीम किंवा नवे खाद्य)'
                    : 'Recent feed history (fresh clover/grain change/water)'}
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isHindi
                    ? 'झुंड के अन्य पशुओं की स्थिति (क्या अन्य पशु भी बीमार हैं)'
                    : isMarathi
                    ? 'कळपातील इतर जनावरांची स्थिती (इतर जनावरे सुरक्षित आहेत का)'
                    : 'Condition of the remaining herd (quarantine status)'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-bold transition border border-white/10 cursor-pointer"
          >
            {isHindi ? 'समझ गया / बंद करें' : isMarathi ? 'समजले / बंद करा' : 'Close Emergency Guide'}
          </button>
        </div>
      </div>
    </div>
  );
}
