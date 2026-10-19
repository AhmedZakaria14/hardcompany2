/**
 * HARD GROUP - CALCULATOR CONFIGURATION SERVICE
 * 
 * Manages versioned database records for Construction and HVAC calculator configurations.
 * Enforces strict validation on numeric parameters to prevent invalid configurations from
 * producing misleading results.
 */

import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import {
  CalculatorType,
  ConstructionCalculatorCoefficients,
  ConstructionCalculatorConfigDoc,
  HVACCalculatorCoefficients,
  HVACCalculatorConfigDoc,
  AnyCalculatorConfigDoc,
} from './calculatorTypes';

// ----------------------------------------------------------------------
// DEFAULT TRUSTED COEFFICIENTS (SAUDI ARABIA MARKET BENCHMARKS)
// ----------------------------------------------------------------------

export const DEFAULT_CONSTRUCTION_COEFFICIENTS: ConstructionCalculatorCoefficients = {
  baseStructuralPerM2: 620,
  mepPerM2Base: 280,
  finishingLevels: {
    skeleton: { baseFinishingPerM2: 0, mepPerM2: 120 },
    commercial: { baseFinishingPerM2: 550, mepPerM2: 320 },
    deluxe: { baseFinishingPerM2: 980, mepPerM2: 420 },
    superLuxury: { baseFinishingPerM2: 1650, mepPerM2: 580 },
  },
  projectTypeMultipliers: {
    commercialBuilding: 1.35,
    warehouseStructuralPerM2: 480,
    warehouseMepPerM2: 180,
    warehouseMaxFinishingPerM2: 350,
    residentialCompound: 1.08,
    villa: 1.0,
    duplex: 1.0,
  },
  addons: {
    basementCostPerM2: 1400,
    poolFlatCost: 110000,
    elevatorBaseCost: 75000,
    elevatorExtraFloorCost: 9000,
    smartHomeCostPerM2: 120,
    smartHomeMaxCost: 180000,
  },
  heightFactorPerFloorAbove3: 0.04,
  varianceMinFactor: 0.94,
  varianceMaxFactor: 1.07,
};

export const DEFAULT_CONSTRUCTION_CONFIG: ConstructionCalculatorConfigDoc = {
  id: 'construction_published',
  calculatorType: 'construction',
  version: 1,
  status: 'published',
  titleAr: 'حاسبة التكلفة التقديرية للبناء والمقاولات',
  titleEn: 'Construction Cost & Structural Estimator',
  descriptionAr: 'معايير وافتراضات قياسية بناءً على متوسط أسعار السوق السعودي لعام 2026',
  descriptionEn: 'Standard Saudi market construction benchmark rates for 2026',
  assumptionsAr: 'الأسعار تشمل المواد والعمالة والإشراف الهندسي الأولي. يضاف +7% للمواصفات الخاصة.',
  assumptionsEn: 'Rates cover materials, labor, and preliminary engineering supervision. +/- 7% variance applies.',
  coefficients: DEFAULT_CONSTRUCTION_COEFFICIENTS,
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  publishedBy: 'system@hardgroup.sa',
};

export const DEFAULT_HVAC_COEFFICIENTS: HVACCalculatorCoefficients = {
  areaPerTonSqM: 20,
  btuPerTon: 12000,
  co2EmissionFactorKgPerKWh: 0.52,
  defaultTariffRateSAR: 0.18,
  tiers: {
    split_standard: {
      id: 'split_standard',
      seer: 13.5,
      labelAr: 'سبليت جداري / دولابي قياسي',
      labelEn: 'Standard Wall Split',
      seerDisplay: '13.5 SEER',
    },
    inverter_high: {
      id: 'inverter_high',
      seer: 18.0,
      labelAr: 'انفرتر ذكي عالي الكفاءة',
      labelEn: 'High Efficiency Inverter',
      seerDisplay: '18.0 SEER (Inverter)',
    },
    package_unit: {
      id: 'package_unit',
      seer: 15.5,
      labelAr: 'وحدة مدمجة للمباني التجارية',
      labelEn: 'Rooftop Package Unit',
      seerDisplay: '15.5 SEER',
    },
    vrf_central: {
      id: 'vrf_central',
      seer: 21.0,
      labelAr: 'نظام VRF المركزي المتغير',
      labelEn: 'Smart Central VRF',
      seerDisplay: '21.0+ SEER (Smart VRF)',
    },
  },
  baselineOptions: [
    { id: '10.5', seer: 10.5, labelAr: 'نظام تقليدي قديم (10.5 SEER)', labelEn: 'Legacy Non-Inverter (10.5 SEER)' },
    { id: '11.5', seer: 11.5, labelAr: 'تكييف مركزي قياسي (11.5 SEER)', labelEn: 'Standard Central Unit (11.5 SEER)' },
    { id: '10.0', seer: 10.0, labelAr: 'نظام شيلر تبريد قديم (10.0 SEER)', labelEn: 'Legacy Chiller System (10.0 SEER)' },
  ],
};

export const DEFAULT_HVAC_CONFIG: HVACCalculatorConfigDoc = {
  id: 'hvac_published',
  calculatorType: 'hvac',
  version: 1,
  status: 'published',
  titleAr: 'حاسبة وفر الطاقة وكفاءة التكييف',
  titleEn: 'HVAC Energy & Efficiency Cost Calculator',
  descriptionAr: 'معايير حساب الأحمال والوفر المالي والبيئي متوافقة مع مواصفات ساسو (SASO/SEEC)',
  descriptionEn: 'Cooling load and energy financial saving estimates aligned with SASO / SEEC standards',
  assumptionsAr: 'تقدير الحمل 1 طن تبريد لكل 20م². تعرفة الكهرباء السكنية الأساسية 0.18 ر.س/ك.و.س.',
  assumptionsEn: 'Cooling load based on 1 TR per 20 m². Standard SEC tariff benchmarked at 0.18 SAR/kWh.',
  coefficients: DEFAULT_HVAC_COEFFICIENTS,
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  publishedBy: 'system@hardgroup.sa',
};

// ----------------------------------------------------------------------
// NUMERIC VALIDATION & INTEGRITY CHECKS
// ----------------------------------------------------------------------

export function validateConstructionCoefficients(
  c: ConstructionCalculatorCoefficients
): string | null {
  if (typeof c.baseStructuralPerM2 !== 'number' || c.baseStructuralPerM2 < 100 || c.baseStructuralPerM2 > 10000) {
    return 'Base structural cost must be a valid number between 100 and 10,000 SAR/m²';
  }
  if (typeof c.mepPerM2Base !== 'number' || c.mepPerM2Base < 0 || c.mepPerM2Base > 5000) {
    return 'Base MEP cost must be a valid non-negative number up to 5,000 SAR/m²';
  }
  if (typeof c.addons.basementCostPerM2 !== 'number' || c.addons.basementCostPerM2 < 0) {
    return 'Basement cost per m² must be a non-negative number';
  }
  if (typeof c.addons.poolFlatCost !== 'number' || c.addons.poolFlatCost < 0) {
    return 'Swimming pool flat cost must be a non-negative number';
  }
  if (typeof c.heightFactorPerFloorAbove3 !== 'number' || c.heightFactorPerFloorAbove3 < 0 || c.heightFactorPerFloorAbove3 > 0.5) {
    return 'Height factor must be between 0 and 0.5';
  }
  if (typeof c.varianceMinFactor !== 'number' || c.varianceMinFactor <= 0 || c.varianceMinFactor >= 1) {
    return 'Minimum variance factor must be between 0 and 1 (e.g. 0.94)';
  }
  if (typeof c.varianceMaxFactor !== 'number' || c.varianceMaxFactor <= 1 || c.varianceMaxFactor > 2) {
    return 'Maximum variance factor must be greater than 1 (e.g. 1.07)';
  }
  return null;
}

export function validateHVACCoefficients(
  c: HVACCalculatorCoefficients
): string | null {
  if (typeof c.areaPerTonSqM !== 'number' || c.areaPerTonSqM <= 0 || c.areaPerTonSqM > 200) {
    return 'Area per ton must be a valid positive number up to 200 m²/TR';
  }
  if (typeof c.defaultTariffRateSAR !== 'number' || c.defaultTariffRateSAR <= 0 || c.defaultTariffRateSAR > 2.0) {
    return 'Tariff rate must be a valid positive number up to 2.0 SAR/kWh';
  }
  for (const key of Object.keys(c.tiers) as (keyof typeof c.tiers)[]) {
    const tier = c.tiers[key];
    if (typeof tier.seer !== 'number' || tier.seer < 5 || tier.seer > 40) {
      return `Tier ${key} SEER rating must be a valid number between 5 and 40`;
    }
  }
  return null;
}

// ----------------------------------------------------------------------
// FIRESTORE OPERATIONS
// ----------------------------------------------------------------------

export async function getPublishedCalculatorConfig(
  type: CalculatorType
): Promise<AnyCalculatorConfigDoc> {
  const docId = `${type}_published`;
  try {
    const snap = await getDoc(doc(db, 'calculator_configs', docId));
    if (snap.exists()) {
      return snap.data() as AnyCalculatorConfigDoc;
    }
  } catch (err) {
    console.warn(`[CalculatorConfig] Failed to fetch published ${type} config, using default fallback:`, err);
  }
  return type === 'construction' ? DEFAULT_CONSTRUCTION_CONFIG : DEFAULT_HVAC_CONFIG;
}

export async function getDraftCalculatorConfig(
  type: CalculatorType
): Promise<AnyCalculatorConfigDoc> {
  const docId = `${type}_draft`;
  try {
    const snap = await getDoc(doc(db, 'calculator_configs', docId));
    if (snap.exists()) {
      return snap.data() as AnyCalculatorConfigDoc;
    }
  } catch (err) {
    console.warn(`[CalculatorConfig] Failed to fetch draft ${type} config, deriving from published:`, err);
  }
  // Initialize draft from published config
  const published = await getPublishedCalculatorConfig(type);
  return {
    ...published,
    id: `${type}_draft`,
    status: 'draft',
    updatedAt: new Date().toISOString(),
  };
}

export async function saveDraftCalculatorConfig(
  docData: AnyCalculatorConfigDoc
): Promise<void> {
  let validationErr: string | null = null;
  if (docData.calculatorType === 'construction') {
    validationErr = validateConstructionCoefficients(
      (docData as ConstructionCalculatorConfigDoc).coefficients
    );
  } else {
    validationErr = validateHVACCoefficients(
      (docData as HVACCalculatorConfigDoc).coefficients
    );
  }

  if (validationErr) {
    throw new Error(`Validation Error: ${validationErr}`);
  }

  const payload: AnyCalculatorConfigDoc = {
    ...docData,
    id: `${docData.calculatorType}_draft`,
    status: 'draft',
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'calculator_configs', payload.id), payload);
}

export async function publishCalculatorConfig(
  type: CalculatorType,
  publishedByEmail: string
): Promise<AnyCalculatorConfigDoc> {
  // 1. Get current draft or published config
  const draft = await getDraftCalculatorConfig(type);

  // Validate draft before publishing
  if (type === 'construction') {
    const err = validateConstructionCoefficients((draft as ConstructionCalculatorConfigDoc).coefficients);
    if (err) throw new Error(`Cannot publish: ${err}`);
  } else {
    const err = validateHVACCoefficients((draft as HVACCalculatorConfigDoc).coefficients);
    if (err) throw new Error(`Cannot publish: ${err}`);
  }

  // 2. Increment version number
  const newVersion = (draft.version || 1) + 1;
  const nowIso = new Date().toISOString();

  // 3. Save snapshot version doc: calculator_configs/{type}_v{newVersion}
  const versionedDoc: AnyCalculatorConfigDoc = {
    ...draft,
    id: `${type}_v${newVersion}`,
    version: newVersion,
    status: 'published',
    updatedAt: nowIso,
    publishedAt: nowIso,
    publishedBy: publishedByEmail,
  };

  await setDoc(doc(db, 'calculator_configs', versionedDoc.id), versionedDoc);

  // 4. Overwrite active published doc pointer: calculator_configs/{type}_published
  const publishedDoc: AnyCalculatorConfigDoc = {
    ...versionedDoc,
    id: `${type}_published`,
  };

  await setDoc(doc(db, 'calculator_configs', publishedDoc.id), publishedDoc);

  // 5. Update draft doc version indicator
  const updatedDraftDoc: AnyCalculatorConfigDoc = {
    ...draft,
    id: `${type}_draft`,
    version: newVersion,
    status: 'draft',
    updatedAt: nowIso,
  };

  await setDoc(doc(db, 'calculator_configs', updatedDraftDoc.id), updatedDraftDoc);

  return publishedDoc;
}

export function subscribeToPublishedCalculatorConfig(
  type: CalculatorType,
  onUpdate: (config: AnyCalculatorConfigDoc) => void
): () => void {
  const docRef = doc(db, 'calculator_configs', `${type}_published`);
  
  const unsubscribe = onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as AnyCalculatorConfigDoc);
      } else {
        onUpdate(type === 'construction' ? DEFAULT_CONSTRUCTION_CONFIG : DEFAULT_HVAC_CONFIG);
      }
    },
    (err) => {
      console.warn(`[CalculatorConfig] Subscription error for ${type}, falling back:`, err);
      onUpdate(type === 'construction' ? DEFAULT_CONSTRUCTION_CONFIG : DEFAULT_HVAC_CONFIG);
    }
  );

  return unsubscribe;
}
