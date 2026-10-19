/**
 * HARD GROUP - CMS CALCULATOR CONFIGURATION & VERSIONING MANAGEMENT
 * 
 * Features:
 * 1. Admin editing of approved coefficients, options, descriptions, and assumptions through validated numeric/structured fields.
 * 2. Test Preview sandbox comparing current draft calculations vs active published config calculations.
 * 3. Explicit version publication generating versioned database snapshots in Firestore.
 */

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Sliders,
  Sparkles,
  Save,
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  History,
  Layers,
  Building2,
  Zap,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../../types';
import {
  ConstructionCalculatorConfigDoc,
  HVACCalculatorConfigDoc,
  ConstructionCalculatorCoefficients,
  HVACCalculatorCoefficients,
  AnyCalculatorConfigDoc,
} from '../../lib/calculators/calculatorTypes';
import {
  getPublishedCalculatorConfig,
  getDraftCalculatorConfig,
  saveDraftCalculatorConfig,
  publishCalculatorConfig,
  validateConstructionCoefficients,
  validateHVACCoefficients,
  DEFAULT_CONSTRUCTION_CONFIG,
  DEFAULT_HVAC_CONFIG,
} from '../../lib/calculators/calculatorConfigService';
import {
  calculateConstructionCostWithConfig,
  calculateHVACEfficiencyWithConfig,
} from '../../lib/calculators/calculatorEngine';

interface CMSCalculatorConfigProps {
  language: Language;
  adminEmail?: string;
  currentAdminEmail?: string;
}

export const CMSCalculatorConfig: React.FC<CMSCalculatorConfigProps> = ({
  language,
  adminEmail,
  currentAdminEmail,
}) => {
  const isAr = language === 'ar';
  const effectiveEmail = currentAdminEmail || adminEmail || 'admin@hard.sa';
  const [activeType, setActiveType] = useState<'construction' | 'hvac'>('construction');

  // Config States
  const [publishedConfig, setPublishedConfig] = useState<AnyCalculatorConfigDoc | null>(null);
  const [draftConfig, setDraftConfig] = useState<AnyCalculatorConfigDoc | null>(null);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Test Sandbox Inputs (Construction)
  const [testArea, setTestArea] = useState<number>(500);
  const [testProjectType, setTestProjectType] = useState<'villa' | 'commercial-building' | 'duplex' | 'warehouse'>('villa');
  const [testFinishing, setTestFinishing] = useState<'skeleton' | 'commercial' | 'deluxe' | 'super-luxury'>('deluxe');
  const [testBasement, setTestBasement] = useState(false);
  const [testPool, setTestPool] = useState(true);

  // Test Sandbox Inputs (HVAC)
  const [testHvacArea, setTestHvacArea] = useState<number>(200);
  const [testBaselineSeer, setTestBaselineSeer] = useState<number>(10.5);
  const [testTargetTier, setTestTargetTier] = useState<'split_standard' | 'inverter_high' | 'package_unit' | 'vrf_central'>('inverter_high');

  // Load published & draft configs on type toggle
  useEffect(() => {
    let isMounted = true;
    async function loadConfigs() {
      setIsLoading(true);
      setErrorMsg('');
      setSaveSuccessMsg('');
      try {
        const pub = await getPublishedCalculatorConfig(activeType);
        const drf = await getDraftCalculatorConfig(activeType);
        if (isMounted) {
          setPublishedConfig(pub);
          setDraftConfig(drf);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err?.message || 'Failed to load calculator configurations');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadConfigs();
    return () => {
      isMounted = false;
    };
  }, [activeType]);

  if (isLoading || !draftConfig || !publishedConfig) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <span>{isAr ? 'جاري تحميل إعدادات وحاسبات المعايير...' : 'Loading versioned calculator configurations...'}</span>
      </div>
    );
  }

  const isConstruction = activeType === 'construction';
  const constDraft = draftConfig as ConstructionCalculatorConfigDoc;
  const constPub = publishedConfig as ConstructionCalculatorConfigDoc;
  const hvacDraft = draftConfig as HVACCalculatorConfigDoc;
  const hvacPub = publishedConfig as HVACCalculatorConfigDoc;

  // Calculate Test Sandbox Results
  const draftConstResult = isConstruction
    ? calculateConstructionCostWithConfig(
        {
          projectType: testProjectType,
          finishingLevel: testFinishing,
          builtUpArea: testArea,
          floors: 2,
          hasBasement: testBasement,
          hasPool: testPool,
          hasElevator: true,
          hasSmartHome: true,
          location: 'Riyadh',
        },
        constDraft.coefficients
      )
    : null;

  const pubConstResult = isConstruction
    ? calculateConstructionCostWithConfig(
        {
          projectType: testProjectType,
          finishingLevel: testFinishing,
          builtUpArea: testArea,
          floors: 2,
          hasBasement: testBasement,
          hasPool: testPool,
          hasElevator: true,
          hasSmartHome: true,
          location: 'Riyadh',
        },
        constPub.coefficients
      )
    : null;

  const draftHvacResult = !isConstruction
    ? calculateHVACEfficiencyWithConfig(
        {
          areaSqM: testHvacArea,
          baselineSeer: testBaselineSeer,
          targetTier: testTargetTier,
          dailyHours: 12,
          horizonYears: 1,
        },
        hvacDraft.coefficients
      )
    : null;

  const pubHvacResult = !isConstruction
    ? calculateHVACEfficiencyWithConfig(
        {
          areaSqM: testHvacArea,
          baselineSeer: testBaselineSeer,
          targetTier: testTargetTier,
          dailyHours: 12,
          horizonYears: 1,
        },
        hvacPub.coefficients
      )
    : null;

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setErrorMsg('');
    setSaveSuccessMsg('');
    try {
      await saveDraftCalculatorConfig(draftConfig);
      setSaveSuccessMsg(isAr ? 'تم حفظ المسودة بنجاح' : 'Draft saved successfully');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (
      !window.confirm(
        isAr
          ? `هل أنت أكتد من نشر الإصدار الجديد رقم (${draftConfig.version + 1}) وحفظه في السجل التاريخي؟`
          : `Are you sure you want to publish calculator version ${draftConfig.version + 1}?`
      )
    ) {
      return;
    }

    setIsPublishing(true);
    setErrorMsg('');
    setSaveSuccessMsg('');
    try {
      const newPub = await publishCalculatorConfig(activeType, adminEmail || 'admin@hardgroup.sa');
      setPublishedConfig(newPub);
      setDraftConfig({
        ...newPub,
        id: `${activeType}_draft`,
        status: 'draft',
      });
      setSaveSuccessMsg(
        isAr
          ? `تم نشر الإصدار (${newPub.version}) بنجاح وتطبيقه على كافة الحاسبات الحية!`
          : `Version ${newPub.version} published and active on live calculators!`
      );
      setTimeout(() => setSaveSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to publish configuration');
    } finally {
      setIsPublishing(false);
    }
  };

  // State update helpers for Construction draft
  const updateConstCoeff = (updater: (prev: ConstructionCalculatorCoefficients) => ConstructionCalculatorCoefficients) => {
    setDraftConfig((prev) => {
      if (!prev) return prev;
      const cPrev = prev as ConstructionCalculatorConfigDoc;
      return {
        ...cPrev,
        coefficients: updater(cPrev.coefficients),
      };
    });
  };

  // State update helpers for HVAC draft
  const updateHvacCoeff = (updater: (prev: HVACCalculatorCoefficients) => HVACCalculatorCoefficients) => {
    setDraftConfig((prev) => {
      if (!prev) return prev;
      const hPrev = prev as HVACCalculatorConfigDoc;
      return {
        ...hPrev,
        coefficients: updater(hPrev.coefficients),
      };
    });
  };

  return (
    <div className="space-y-8 text-start">
      {/* Top Header & Sector Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display-serif">
              {isAr ? 'إدارة حاسبات التكلفة والوفر' : 'Calculator Configuration & Versioning'}
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تعديل المعاملات والأسعار المعتمدة مع إمكانية المعاينة التجريبية والسجل التاريخي للإصدارات'
                : 'Manage approved rate coefficients with test preview and explicit database version snapshots.'}
            </p>
          </div>
        </div>

        {/* Calculator Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveType('construction')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeType === 'construction'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isAr ? 'حاسبة البناء' : 'Construction Estimator'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('hvac')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeType === 'hvac'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{isAr ? 'حاسبة التكييف' : 'HVAC Efficiency'}</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isAr
                ? `الإصدار النشط حالياً: v${publishedConfig.version}`
                : `Published Version: v${publishedConfig.version}`}
            </span>
          </div>
          <div className="text-slate-400">
            {isAr ? 'تاريخ النشر:' : 'Published:'}{' '}
            <span className="text-slate-200 font-mono">
              {publishedConfig.publishedAt
                ? new Date(publishedConfig.publishedAt).toLocaleDateString()
                : 'System Default'}
            </span>
          </div>
          <div className="text-slate-400">
            {isAr ? 'بواسطة:' : 'By:'}{' '}
            <span className="text-slate-200 font-mono">{publishedConfig.publishedBy || 'System'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving || isPublishing}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : isAr ? 'حفظ مسودة' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving || isPublishing}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isPublishing
                ? isAr
                  ? 'جاري النشر...'
                  : 'Publishing...'
                : isAr
                ? `اعتماد ونشر إصدار (v${draftConfig.version + 1})`
                : `Publish Version (v${draftConfig.version + 1})`}
            </span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Left = Form Coefficients Editor, Right = Test Sandbox Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Coefficients & Descriptive Fields */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-400" />
              <span>{isAr ? 'العناوين والوصف المعتمد' : 'Descriptions & Descriptive Information'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {isAr ? 'العنوان بالعربية' : 'Arabic Title'}
                </label>
                <input
                  type="text"
                  value={draftConfig.titleAr}
                  onChange={(e) => setDraftConfig({ ...draftConfig, titleAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {isAr ? 'العنوان بالإنجليزية' : 'English Title'}
                </label>
                <input
                  type="text"
                  value={draftConfig.titleEn}
                  onChange={(e) => setDraftConfig({ ...draftConfig, titleEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">
                  {isAr ? 'الافتراضات والهوامش (عربي)' : 'Assumptions & Legal Notes (Arabic)'}
                </label>
                <textarea
                  rows={2}
                  value={draftConfig.assumptionsAr}
                  onChange={(e) => setDraftConfig({ ...draftConfig, assumptionsAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* COEFFICIENTS EDITOR FOR CONSTRUCTION */}
          {isConstruction && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>{isAr ? 'معاملات وأسعار البناء (ر.س / م²)' : 'Approved Construction Coefficients'}</span>
                </div>
                <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">
                  SAR Benchmarks
                </span>
              </h2>

              {/* Base Structural & MEP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isAr ? 'تكلفة الهيكل الخرساني الأساسي (ر.س/م²)' : 'Base Structural Rate (SAR/m²)'}
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={5000}
                    value={constDraft.coefficients.baseStructuralPerM2}
                    onChange={(e) =>
                      updateConstCoeff((c) => ({
                        ...c,
                        baseStructuralPerM2: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Default: 620 SAR/m²</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isAr ? 'تكلفة تأسيس السباكة والكهرباء MEP (ر.س/م²)' : 'Base MEP Rough-In Rate (SAR/m²)'}
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={2000}
                    value={constDraft.coefficients.mepPerM2Base}
                    onChange={(e) =>
                      updateConstCoeff((c) => ({
                        ...c,
                        mepPerM2Base: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Default: 280 SAR/m²</span>
                </div>
              </div>

              {/* Finishing Levels */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {isAr ? 'مستويات التشطيب (متر مربع)' : 'Finishing Level Rates'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['skeleton', 'commercial', 'deluxe', 'superLuxury'] as const).map((lvl) => (
                    <div key={lvl} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-blue-400 capitalize">{lvl}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="block text-[10px] text-slate-400">Finishing (SAR/m²)</span>
                          <input
                            type="number"
                            value={constDraft.coefficients.finishingLevels[lvl]?.baseFinishingPerM2 ?? 0}
                            onChange={(e) =>
                              updateConstCoeff((c) => ({
                                ...c,
                                finishingLevels: {
                                  ...c.finishingLevels,
                                  [lvl]: {
                                    ...c.finishingLevels[lvl],
                                    baseFinishingPerM2: Number(e.target.value),
                                  },
                                },
                              }))
                            }
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400">MEP (SAR/m²)</span>
                          <input
                            type="number"
                            value={constDraft.coefficients.finishingLevels[lvl]?.mepPerM2 ?? 0}
                            onChange={(e) =>
                              updateConstCoeff((c) => ({
                                ...c,
                                finishingLevels: {
                                  ...c.finishingLevels,
                                  [lvl]: {
                                    ...c.finishingLevels[lvl],
                                    mepPerM2: Number(e.target.value),
                                  },
                                },
                              }))
                            }
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addons & Multipliers */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {isAr ? 'تكاليف الإضافات والمعاملات' : 'Addons & Structural Factors'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="block text-[10px] text-slate-400">Basement Rate (SAR/m²)</span>
                    <input
                      type="number"
                      value={constDraft.coefficients.addons.basementCostPerM2}
                      onChange={(e) =>
                        updateConstCoeff((c) => ({
                          ...c,
                          addons: { ...c.addons, basementCostPerM2: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-2 py-1 mt-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="block text-[10px] text-slate-400">Pool Cost (Flat SAR)</span>
                    <input
                      type="number"
                      value={constDraft.coefficients.addons.poolFlatCost}
                      onChange={(e) =>
                        updateConstCoeff((c) => ({
                          ...c,
                          addons: { ...c.addons, poolFlatCost: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-2 py-1 mt-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="block text-[10px] text-slate-400">Elevator Base Cost (SAR)</span>
                    <input
                      type="number"
                      value={constDraft.coefficients.addons.elevatorBaseCost}
                      onChange={(e) =>
                        updateConstCoeff((c) => ({
                          ...c,
                          addons: { ...c.addons, elevatorBaseCost: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-2 py-1 mt-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COEFFICIENTS EDITOR FOR HVAC */}
          {!isConstruction && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-400" />
                  <span>{isAr ? 'معاملات وكفاءة التكييف (SASO/SEEC)' : 'HVAC Efficiency Parameters'}</span>
                </div>
                <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-2 py-0.5 rounded">
                  SEEC Standards
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isAr ? 'مساحة المتر المربع لكل طن تبريد (م²/TR)' : 'Area per Ton (m²/TR)'}
                  </label>
                  <input
                    type="number"
                    value={hvacDraft.coefficients.areaPerTonSqM}
                    onChange={(e) =>
                      updateHvacCoeff((h) => ({
                        ...h,
                        areaPerTonSqM: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Saudi Standard: 20 m²/TR</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {isAr ? 'تعرفة الكهرباء القياسية (ر.س / ك.و.س)' : 'SEC Tariff Rate (SAR/kWh)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={hvacDraft.coefficients.defaultTariffRateSAR}
                    onChange={(e) =>
                      updateHvacCoeff((h) => ({
                        ...h,
                        defaultTariffRateSAR: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Standard Tier: 0.18 SAR/kWh</span>
                </div>
              </div>

              {/* SEER Ratings for Tiers */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {isAr ? 'تقييمات كفاءة الأنظمة (SEER Ratings)' : 'System Tier SEER Ratings'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(hvacDraft.coefficients.tiers) as (keyof typeof hvacDraft.coefficients.tiers)[]).map(
                    (tierKey) => (
                      <div key={tierKey} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-xs font-bold text-sky-400 capitalize">{tierKey}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">SEER:</span>
                          <input
                            type="number"
                            step="0.5"
                            value={hvacDraft.coefficients.tiers[tierKey].seer}
                            onChange={(e) =>
                              updateHvacCoeff((h) => ({
                                ...h,
                                tiers: {
                                  ...h.tiers,
                                  [tierKey]: {
                                    ...h.tiers[tierKey],
                                    seer: Number(e.target.value),
                                  },
                                },
                              }))
                            }
                            className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Test Sandbox & Side-by-Side Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  {isAr ? 'معاينة النتيجة والمقارنة الحية' : 'Test Sandbox & Live Comparison'}
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                Real-Time Sandbox
              </span>
            </div>

            {/* Test Inputs Section */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">
                {isAr ? 'مدخلات التجربة (المعاينة):' : 'Sandbox Test Inputs:'}
              </span>

              {isConstruction ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Built-Up Area (m²)</label>
                    <input
                      type="number"
                      value={testArea}
                      onChange={(e) => setTestArea(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Project Type</label>
                    <select
                      value={testProjectType}
                      onChange={(e) => setTestProjectType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    >
                      <option value="villa">Villa (🏡)</option>
                      <option value="commercial-building">Commercial Building (🏢)</option>
                      <option value="duplex">Duplex (🏘️)</option>
                      <option value="warehouse">Warehouse (🏭)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={testBasement}
                        onChange={(e) => setTestBasement(e.target.checked)}
                      />
                      <span>Basement</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={testPool}
                        onChange={(e) => setTestPool(e.target.checked)}
                      />
                      <span>Swimming Pool</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Covered Area (m²)</label>
                    <input
                      type="number"
                      value={testHvacArea}
                      onChange={(e) => setTestHvacArea(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Baseline System SEER</label>
                    <input
                      type="number"
                      step="0.5"
                      value={testBaselineSeer}
                      onChange={(e) => setTestBaselineSeer(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Side-by-Side Comparison Output */}
            <div className="space-y-4">
              {/* Draft Preview Result */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                  <span>{isAr ? 'نتيجة المسودة الحالية (Draft Config)' : 'Current Draft Output'}</span>
                  <span className="font-mono text-[10px]">v{draftConfig.version + 1} (Draft)</span>
                </div>

                {isConstruction && draftConstResult && (
                  <div className="space-y-1 text-xs text-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Total Cost:</span>
                      <span className="font-bold text-white font-mono">{draftConstResult.avgTotalSAR.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Price / m²:</span>
                      <span className="font-mono text-blue-300">{draftConstResult.pricePerM2SAR.toLocaleString()} SAR/m²</span>
                    </div>
                  </div>
                )}

                {!isConstruction && draftHvacResult && (
                  <div className="space-y-1 text-xs text-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Annual Savings:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {Math.round(draftHvacResult.totalFinancialSavingsSAR).toLocaleString()} SAR
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total KWh Saved:</span>
                      <span className="font-mono text-sky-300">{Math.round(draftHvacResult.totalKWhSaved).toLocaleString()} kWh</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Published Result */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 opacity-80">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>{isAr ? 'نتيجة النسخة المنشورة (Published)' : 'Active Published Output'}</span>
                  <span className="font-mono text-[10px]">v{publishedConfig.version}</span>
                </div>

                {isConstruction && pubConstResult && (
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Total Cost:</span>
                      <span className="font-bold font-mono">{pubConstResult.avgTotalSAR.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Price / m²:</span>
                      <span className="font-mono text-slate-300">{pubConstResult.pricePerM2SAR.toLocaleString()} SAR/m²</span>
                    </div>
                  </div>
                )}

                {!isConstruction && pubHvacResult && (
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Annual Savings:</span>
                      <span className="font-bold font-mono">
                        {Math.round(pubHvacResult.totalFinancialSavingsSAR).toLocaleString()} SAR
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
