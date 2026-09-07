import React, { useState } from 'react';
import {
  X,
  Store,
  MapPin,
  PhoneCall,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Pill,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage, TalukaChemistStore } from '../types';
import { TALUKA_CHEMIST_STORES } from '../data/ecosystemData';

interface ChemistFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
}

export function ChemistFinderModal({
  isOpen,
  onClose,
  currentLang,
}: ChemistFinderModalProps) {
  const [selectedTaluka, setSelectedTaluka] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterHerbalOnly, setFilterHerbalOnly] = useState<boolean>(false);
  const [talukaSearch, setTalukaSearch] = useState<string>('');

  if (!isOpen) return null;

  // Dynamically derive unique taluka list from data
  const talukaList = ['All', ...new Set(TALUKA_CHEMIST_STORES.map((s) => s.taluka))].sort();

  const filteredTalukas = talukaList.filter((t) =>
    t.toLowerCase().includes(talukaSearch.toLowerCase())
  );

  const filteredStores = TALUKA_CHEMIST_STORES.filter((store) => {
    const matchesTaluka = selectedTaluka === 'All' || store.taluka.toLowerCase() === selectedTaluka.toLowerCase();
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.taluka.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHerbal = !filterHerbalOnly || (store.stockStatus.batisa && store.stockStatus.topicure);
    return matchesTaluka && matchesSearch && matchesHerbal;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0F1410] border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-emerald-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center space-x-2 font-['Outfit']">
                <span>
                  Taluka Veterinary Chemist & Herbal Store Finder
                </span>
                <span className="text-[10px] font-mono uppercase bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Govt Capped MRP
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Locate certified dispensaries stocking Batisa, Topicure, Mastilep & essential first-aid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-white/10 bg-black/40 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by store name, taluka, or village..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Herbal Stock Toggle */}
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={filterHerbalOnly}
                onChange={(e) => setFilterHerbalOnly(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-500"
              />
              <span>In-Stock Batisa & Topicure Only</span>
            </label>
          </div>

          {/* Searchable Taluka Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Taluka</span>
              <div className="relative w-40">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Find Taluka..."
                  value={talukaSearch}
                  onChange={(e) => setTalukaSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 bg-white/5 border border-white/15 rounded-lg text-[10px] focus:outline-none focus:border-emerald-500/30 text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
              {filteredTalukas.map((taluka) => (
                <button
                  key={taluka}
                  onClick={() => setSelectedTaluka(taluka)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedTaluka === taluka
                      ? 'bg-emerald-600 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  {taluka}
                </button>
              ))}
              {filteredTalukas.length === 0 && (
                <span className="text-[10px] text-slate-600 italic px-2">No talukas found matching "{talukaSearch}"</span>
              )}
            </div>
          </div>
        </div>

        {/* Store Listings */}
        <div className="p-5 space-y-3.5 max-h-[60vh] overflow-y-auto">
          {filteredStores.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No matching veterinary stores found in this Taluka.
            </div>
          ) : (
            filteredStores.map((store) => (
              <div
                key={store.id}
                className="p-4 rounded-2xl bg-[#121914] border border-white/10 hover:border-emerald-500/40 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          store.storeType === 'Jan Aushadhi'
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                            : store.storeType === 'Sahakari Dairy Sangh'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {store.storeType}
                      </span>
                      {store.isOpen24x7 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950 text-red-300 border border-red-500/40 flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>24x7 Open</span>
                        </span>
                      )}
                      <span className="text-xs text-emerald-400 font-mono font-bold">
                        {store.distanceKm} km away
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-white mt-1">
                      {store.name}
                    </h4>
                  </div>

                  <a
                    href={`tel:${store.phone.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs transition cursor-pointer shadow-md self-start sm:self-center"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Store</span>
                  </a>
                </div>

                <div className="flex items-start space-x-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </div>

                {/* Live Stock Inventory Badges */}
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="text-slate-400 mr-1 font-mono uppercase">Verified Stock:</span>

                  <span
                    className={`px-2 py-0.5 rounded flex items-center space-x-1 ${
                      store.stockStatus.batisa
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-black text-slate-500 line-through'
                    }`}
                  >
                    {store.stockStatus.batisa ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <XCircle className="w-2.5 h-2.5 text-slate-600" />}
                    <span>Batisa Powder</span>
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded flex items-center space-x-1 ${
                      store.stockStatus.topicure
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-black text-slate-500 line-through'
                    }`}
                  >
                    {store.stockStatus.topicure ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <XCircle className="w-2.5 h-2.5 text-slate-600" />}
                    <span>Topicure Spray</span>
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded flex items-center space-x-1 ${
                      store.stockStatus.mastilep
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-black text-slate-500 line-through'
                    }`}
                  >
                    {store.stockStatus.mastilep ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <XCircle className="w-2.5 h-2.5 text-slate-600" />}
                    <span>Mastilep Gel</span>
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded flex items-center space-x-1 ${
                      store.stockStatus.calupGel
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-black text-slate-500 line-through'
                    }`}
                  >
                    {store.stockStatus.calupGel ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <XCircle className="w-2.5 h-2.5 text-slate-600" />}
                    <span>Calup D3 Gel</span>
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded flex items-center space-x-1 ${
                      store.stockStatus.kmno4
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-black text-slate-500 line-through'
                    }`}
                  >
                    {store.stockStatus.kmno4 ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <XCircle className="w-2.5 h-2.5 text-slate-600" />}
                    <span>KMNO4 (Potassium Permanganate)</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 bg-black/50">
          <span className="text-[11px] text-slate-400">
            Stock updated in real-time by Taluka Sahakari Sangh APIs
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
