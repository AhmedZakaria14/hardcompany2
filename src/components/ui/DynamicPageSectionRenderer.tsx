import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Phone,
  Building2,
  ShieldCheck,
  Star,
  Users,
  MapPin,
  Award,
  Crown,
  Mail,
  Clock,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import { Language } from '../../types';
import { useData } from '../../context/DataContext';
import { getLocalizedText } from '../../lib/utils';
import {
  PageSection,
  HeroContent,
  TextBlockContent,
  StatisticsContent,
  FeatureListContent,
  CardGridContent,
  FaqAccordionContent,
  CtaBannerContent,
  ImageGalleryContent,
  EntityReferenceContent,
} from '../../lib/sectionSchemas';

interface DynamicPageSectionRendererProps {
  sections: PageSection[];
  language: Language;
  onNavigate?: (path: string) => void;
}

export const DynamicPageSectionRenderer: React.FC<DynamicPageSectionRendererProps> = ({
  sections,
  language,
  onNavigate,
}) => {
  const isAr = language === 'ar';
  const {
    teamMembers,
    faqs,
    offices,
    certifications,
    statistics,
    partnerBrands,
    enhancedTestimonials,
    testimonials,
  } = useData();

  const visibleSections = (sections || [])
    .filter((sec) => sec.isVisible !== false)
    .sort((a, b) => a.order - b.order);

  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  if (!visibleSections || visibleSections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12 sm:space-y-16">
      {visibleSections.map((section) => {
        const key = section.id || `sec-${section.type}-${section.order}`;

        switch (section.type) {
          case 'hero': {
            const content = section.content as HeroContent;
            return (
              <section key={key} className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[400px] sm:min-h-[480px] flex items-center shadow-2xl">
                <img
                  src={content.bgImageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'}
                  alt="Hero"
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                  onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                <div className="relative z-10 p-6 sm:p-12 max-w-4xl space-y-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{getLocalizedText(content.title, language)}</span>
                  </span>

                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-display-serif leading-tight">
                    {getLocalizedText(content.title, language)}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-ui-sans">
                    {getLocalizedText(content.subtitle, language)}
                  </p>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    {content.primaryCtaText && (
                      <button
                        type="button"
                        onClick={() => onNavigate && onNavigate(content.primaryCtaUrl || '#')}
                        className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg flex items-center gap-2"
                      >
                        <span>{getLocalizedText(content.primaryCtaText, language)}</span>
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </button>
                    )}

                    {content.secondaryCtaText && (
                      <button
                        type="button"
                        onClick={() => onNavigate && onNavigate(content.secondaryCtaUrl || '#')}
                        className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer backdrop-blur-md"
                      >
                        <span>{getLocalizedText(content.secondaryCtaText, language)}</span>
                      </button>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          case 'text_block': {
            const content = section.content as TextBlockContent;
            return (
              <section key={key} className={`bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs ${content.alignment === 'center' ? 'text-center' : 'text-start'}`}>
                <div className="max-w-3xl space-y-3 mx-auto">
                  <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display-serif">
                    {getLocalizedText(content.heading, language)}
                  </h2>
                  {content.subheading && (
                    <p className="text-xs sm:text-sm text-sky-700 font-bold">
                      {getLocalizedText(content.subheading, language)}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 whitespace-pre-line">
                    {getLocalizedText(content.bodyParagraphs, language)}
                  </p>
                </div>
              </section>
            );
          }

          case 'statistics': {
            const content = section.content as StatisticsContent;
            const sector = content.sectorFilter;
            // Resolve from central store
            const resolvedStats = (statistics || []).filter((s) => {
              if (s.status !== 'published') return false;
              if (content.selectedEntityIds && content.selectedEntityIds.length > 0) {
                return content.selectedEntityIds.includes(s.id);
              }
              if (sector && sector !== 'all') {
                return s.sector === sector || s.sector === 'all';
              }
              return true;
            });

            const displayItems =
              resolvedStats.length > 0
                ? resolvedStats.map((s) => ({
                    id: s.id,
                    value: s.value,
                    label: s.label,
                    verification: s.verification,
                  }))
                : content.items || [];

            return (
              <section key={key} className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <h2 className="text-xl sm:text-3xl font-bold font-display-serif text-white">
                    {getLocalizedText(content.heading, language)}
                  </h2>
                  {content.subheading && (
                    <p className="text-xs sm:text-sm text-slate-400">
                      {getLocalizedText(content.subheading, language)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {displayItems.map((item: any) => (
                    <div key={item.id} className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 text-center space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-2xl sm:text-3xl font-black font-mono text-sky-400 block">
                          {item.value}
                        </span>
                        <span className="text-xs text-slate-300 font-semibold block">
                          {getLocalizedText(item.label, language)}
                        </span>
                      </div>

                      {item.verification?.isVerified && (
                        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>{item.verification.verifierName || (isAr ? 'مدقق رسمياً' : 'Audited Claim')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case 'team': {
            const content = section.content as EntityReferenceContent;
            const sector = content.sectorFilter;
            const resolvedTeam = (teamMembers || []).filter((m) => {
              if (m.status !== 'published') return false;
              if (content.selectedEntityIds && content.selectedEntityIds.length > 0) {
                return content.selectedEntityIds.includes(m.id);
              }
              if (sector && sector !== 'all') {
                return m.sector === sector || m.sector === 'all';
              }
              return true;
            });

            if (resolvedTeam.length === 0) return null;

            return (
              <section key={key} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display-serif">
                    {getLocalizedText(content.heading, language)}
                  </h2>
                  {content.subheading && (
                    <p className="text-xs sm:text-sm text-slate-500">
                      {getLocalizedText(content.subheading, language)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {resolvedTeam.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3 text-center">
                        <img
                          src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={getLocalizedText(member.name, language)}
                          className="w-20 h-20 rounded-2xl object-cover border border-slate-200 mx-auto shadow-xs"
                        />
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {getLocalizedText(member.name, language)}
                          </h3>
                          <p className="text-xs font-semibold text-blue-600">
                            {getLocalizedText(member.role, language)}
                          </p>
                        </div>
                        {member.bio && (
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {getLocalizedText(member.bio, language)}
                          </p>
                        )}
                      </div>

                      {member.verification?.isVerified && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50/60 p-2 rounded-xl">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{member.verification.verifierName || (isAr ? 'اعتماد مهني موثق' : 'Certified Professional')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case 'offices': {
            const content = section.content as EntityReferenceContent;
            const sector = content.sectorFilter;
            const resolvedOffices = (offices || []).filter((o) => {
              if (o.status !== 'published') return false;
              if (content.selectedEntityIds && content.selectedEntityIds.length > 0) {
                return content.selectedEntityIds.includes(o.id);
              }
              if (sector && sector !== 'all') {
                return o.sector === sector || o.sector === 'all';
              }
              return true;
            });

            if (resolvedOffices.length === 0) return null;

            return (
              <section key={key} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display-serif">
                    {getLocalizedText(content.heading, language)}
                  </h2>
                  {content.subheading && (
                    <p className="text-xs sm:text-sm text-slate-500">
                      {getLocalizedText(content.subheading, language)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resolvedOffices.map((office) => (
                    <div
                      key={office.id}
                      className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-44 relative bg-slate-900">
                          <img
                            src={office.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
                            alt={getLocalizedText(office.name, language)}
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                          {office.isHeadquarters && (
                            <span className="absolute top-3 start-3 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] shadow-md flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              <span>{isAr ? 'المقر الرئيسي' : 'Headquarters'}</span>
                            </span>
                          )}

                          <div className="absolute bottom-3 start-3 end-3 text-white">
                            <h3 className="text-sm font-bold truncate">
                              {getLocalizedText(office.name, language)}
                            </h3>
                          </div>
                        </div>

                        <div className="p-5 space-y-3 text-xs text-slate-600">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <p>{getLocalizedText(office.address, language)}</p>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-slate-100 font-semibold">
                            <div className="flex items-center gap-2 text-slate-700">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{office.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{office.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {office.googleMapUrl && (
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                          <a
                            href={office.googleMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{isAr ? 'فتح الخريطة والملاحة' : 'Open Google Maps'}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case 'certifications': {
            const content = section.content as EntityReferenceContent;
            const sector = content.sectorFilter;
            const resolvedCerts = (certifications || []).filter((c) => {
              if (c.status !== 'published') return false;
              if (content.selectedEntityIds && content.selectedEntityIds.length > 0) {
                return content.selectedEntityIds.includes(c.id);
              }
              if (sector && sector !== 'all') {
                return c.sector === sector || c.sector === 'all';
              }
              return true;
            });

            if (resolvedCerts.length === 0) return null;

            return (
              <section key={key} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display-serif">
                    {getLocalizedText(content.heading, language)}
                  </h2>
                  {content.subheading && (
                    <p className="text-xs sm:text-sm text-slate-500">
                      {getLocalizedText(content.subheading, language)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {resolvedCerts.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3 text-center">
                        {cert.image && (
                          <img
                            src={cert.image}
                            alt={getLocalizedText(cert.title, language)}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 mx-auto shadow-2xs"
                          />
                        )}
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {getLocalizedText(cert.title, language)}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            {getLocalizedText(cert.issuer, language)}
                          </p>
                        </div>
                      </div>

                      {cert.verification?.isVerified && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50/60 p-2 rounded-xl">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{cert.credentialId || (isAr ? 'ترخيص معتمد' : 'Verified License')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case 'partners': {
            const content = section.content as EntityReferenceContent;
            const sector = content.sectorFilter;
            const resolvedPartners = (partnerBrands || []).filter((p) => {
              if (p.status !== 'published') return false;
              if (content.selectedEntityIds && content.selectedEntityIds.length > 0) {
                return content.selectedEntityIds.includes(p.id);
              }
              if (sector && sector !== 'all') {
                return p.sector === sector || p.sector === 'all';
              }
              return true;
            });

            if (resolvedPartners.length === 0) return null;

            return (
              <section key={key} className="space-y-6">
                <div className="space-y-1 text-center max-w-2xl mx-auto">
                  <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display-serif">
                    {getLocalizedText(content.heading, language)}
                  </h2>
                  {content.subheading && (
                    <p className="text-xs sm:text-sm text-slate-500">
                      {getLocalizedText(content.subheading, language)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {resolvedPartners.map((partner) => (
                    <div
                      key={partner.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-4 h-24 flex items-center justify-center shadow-2xs hover:shadow-md transition-all group"
                    >
                      <img
                        src={partner.logoUrl || '/logo.svg'}
                        alt={getLocalizedText(partner.name, language)}
                        className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case 'testimonials': {
            const content = section.content as EntityReferenceContent;
            const sector = content.sectorFilter;
            const resolvedStories = (enhancedTestimonials && enhancedTestimonials.length > 0 ? enhancedTestimonials : testimonials || []).filter((t: any) => {
              if (t.status && t.status !== 'published') return false;
              if (content.selectedEntityIds && content.selectedEntityIds.length > 0) {
                return content.selectedEntityIds.includes(t.id);
              }
              if (sector && sector !== 'all' && t.sector) {
                return t.sector === sector || t.sector === 'all';
              }
              return true;
            });

            if (resolvedStories.length === 0) return null;

            return (
              <section key={key} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display-serif">
                    {getLocalizedText(content.heading, language)}
                  </h2>
                  {content.subheading && (
                    <p className="text-xs sm:text-sm text-slate-500">
                      {getLocalizedText(content.subheading, language)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resolvedStories.map((story: any) => (
                    <div
                      key={story.id}
                      className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(story.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                          "{getLocalizedText(story.quote, language)}"
                        </p>

                        {story.dealHighlight && (
                          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                            {getLocalizedText(story.dealHighlight, language)}
                          </span>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {story.avatar && (
                            <img
                              src={story.avatar}
                              alt={getLocalizedText(story.name, language)}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                          )}
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {getLocalizedText(story.name, language)}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {getLocalizedText(story.role, language)}
                            </p>
                          </div>
                        </div>

                        {story.verification?.isVerified && (
                          <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-600" title={isAr ? 'شهادة موثقة' : 'Verified Review'}>
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case 'faq_accordion': {
            const content = section.content as FaqAccordionContent;
            const sector = content.sectorFilter;

            const resolvedFaqs = (faqs || []).filter((f) => {
              if (f.status !== 'published') return false;
              if (content.selectedEntityIds && content.selectedEntityIds.length > 0) {
                return content.selectedEntityIds.includes(f.id);
              }
              if (sector && sector !== 'all') {
                return f.sector === sector || f.sector === 'all';
              }
              return true;
            });

            const displayFaqs =
              resolvedFaqs.length > 0
                ? resolvedFaqs.map((f) => ({
                    id: f.id,
                    question: f.question,
                    answer: f.answer,
                  }))
                : content.faqs || [];

            return (
              <section key={key} className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 space-y-6 shadow-xs">
                <div className="space-y-1 text-center max-w-2xl mx-auto">
                  <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display-serif">
                    {getLocalizedText(content.heading, language)}
                  </h2>
                  {content.subheading && (
                    <p className="text-xs sm:text-sm text-slate-500">
                      {getLocalizedText(content.subheading, language)}
                    </p>
                  )}
                </div>

                <div className="max-w-3xl mx-auto space-y-3">
                  {displayFaqs.map((faq: any) => {
                    const isOpen = openFaqId === faq.id;
                    return (
                      <div key={faq.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/60">
                        <button
                          type="button"
                          onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                          className="w-full p-4 text-start font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                        >
                          <span>{getLocalizedText(faq.question, language)}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-sky-600" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                        </button>
                        {isOpen && (
                          <div className="p-4 pt-0 text-xs text-slate-600 border-t border-slate-200/60 leading-relaxed bg-white">
                            {getLocalizedText(faq.answer, language)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }

          case 'feature_list': {
            const content = section.content as FeatureListContent;
            return (
              <section key={key} className="bg-slate-50/80 rounded-3xl border border-slate-200/80 p-8 sm:p-12 space-y-8">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display-serif">
                    {getLocalizedText(content.heading, language)}
                  </h2>
                  {content.description && (
                    <p className="text-xs sm:text-sm text-slate-600">
                      {getLocalizedText(content.description, language)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {content.items?.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                      <div className="flex items-center gap-2 text-sky-600">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <h3 className="text-sm font-bold text-slate-900">
                          {getLocalizedText(item.title, language)}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {getLocalizedText(item.description, language)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case 'card_grid': {
            const content = section.content as CardGridContent;
            const gridCols =
              content.columns === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : content.columns === 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

            return (
              <section key={key} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display-serif">
                    {getLocalizedText(content.heading, language)}
                  </h2>
                  {content.subheading && (
                    <p className="text-xs sm:text-sm text-slate-500">
                      {getLocalizedText(content.subheading, language)}
                    </p>
                  )}
                </div>

                <div className={`grid ${gridCols} gap-6`}>
                  {content.cards?.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => card.linkUrl && onNavigate && onNavigate(card.linkUrl)}
                      className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        {card.imageUrl && (
                          <div className="h-48 overflow-hidden relative">
                            <img
                              src={card.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                              alt="Card"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-5 space-y-2">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {getLocalizedText(card.title, language)}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-3">
                            {getLocalizedText(card.excerpt, language)}
                          </p>
                        </div>
                      </div>

                      {card.linkUrl && (
                        <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs font-bold text-sky-600 border-t border-slate-100">
                          <span>{isAr ? 'استكشف التفاصيل' : 'Explore Details'}</span>
                          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case 'cta_banner': {
            const content = section.content as CtaBannerContent;
            const bgClass =
              content.styleVariant === 'dark'
                ? 'bg-slate-950 text-white border-slate-800'
                : content.styleVariant === 'accent'
                ? 'bg-sky-700 text-white border-sky-800'
                : 'bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 text-white border-sky-800';

            return (
              <section key={key} className={`rounded-3xl border p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 ${bgClass}`}>
                <div className="space-y-2 max-w-2xl">
                  <h2 className="text-xl sm:text-3xl font-bold font-display-serif">
                    {getLocalizedText(content.title, language)}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {getLocalizedText(content.subtitle, language)}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate(content.primaryCtaUrl || '#')}
                    className="px-6 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                  >
                    {getLocalizedText(content.primaryCtaText, language)}
                  </button>
                </div>
              </section>
            );
          }

          case 'image_gallery': {
            const content = section.content as ImageGalleryContent;
            return (
              <section key={key} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-display-serif">
                    {getLocalizedText(content.heading, language)}
                  </h2>
                  {content.subheading && (
                    <p className="text-xs sm:text-sm text-slate-500">
                      {getLocalizedText(content.subheading, language)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {content.images?.map((img) => (
                    <div key={img.id} className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xs h-64">
                      <img
                        src={img.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                        alt="Gallery"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {img.caption && (
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/90 to-transparent text-white text-xs font-semibold">
                          {getLocalizedText(img.caption, language)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
};
