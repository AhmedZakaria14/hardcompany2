import React, { useState } from 'react';
import { MapPin, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { T, pick } from '../translations';

export function HVACWorkGallery() {
  const { language, isAr, galleryItems } = useHVAC();
  const [activeFilter, setActiveFilter] = useState('all');

  const activeItems = galleryItems.filter((i) => i.active);

  const categories = [
    { id: 'all', en: 'All Projects', ar: 'كافة الأعمال' },
    { id: 'cleaning', en: 'Deep Cleaning', ar: 'الغسيل الكيميائي' },
    { id: 'vrf', en: 'VRF & Commercial', ar: 'أنظمة تجارية وVRF' },
    { id: 'residential', en: 'Residential Villas', ar: 'فلل وقصور' },
  ];

  const filteredItems = activeItems.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'cleaning') return item.id === 'gal-2';
    if (activeFilter === 'vrf') return item.id === 'gal-1' || item.id === 'gal-3';
    if (activeFilter === 'residential') return item.id === 'gal-4' || item.id === 'gal-6';
    return true;
  });

  return (
    <section id="work" className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-semibold">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{pick(T.gallery.eyebrow, language)}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            {pick(T.gallery.title, language)}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {pick(T.gallery.subtitle, language)}
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeFilter === cat.id
                    ? 'bg-[#0EA5E9] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isAr ? cat.ar : cat.en}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Grid with Captions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
            >
              {/* Photo */}
              <div className="aspect-4/3 overflow-hidden relative bg-slate-100">
                <img
                  src={item.image}
                  alt={isAr ? item.titleAr : item.titleEn}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Category & Location Badges */}
                <div className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold">
                  {isAr ? item.categoryAr : item.categoryEn}
                </div>
                <div className="absolute bottom-3 start-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-slate-200 text-[11px] font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0EA5E9]" />
                  <span>{isAr ? item.locationAr : item.locationEn}</span>
                </div>
              </div>

              {/* Caption Content */}
              <div className="p-5 flex-1 flex flex-col text-start space-y-1.5">
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#0EA5E9] transition-colors">
                  {isAr ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAr ? item.captionAr : item.captionEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
