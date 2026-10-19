/**
 * HARD GROUP - TRUSTED CALCULATOR ENGINE
 * 
 * Implements core engineering & financial calculation logic in trusted application code.
 * Accepts versioned configuration coefficients from Firestore or default fallbacks.
 * Prevents arbitrary formula execution while supporting dynamic admin coefficients.
 */

import {
  CostEstimateParams,
  CostEstimateResult,
} from '../../construction/types';
import { EfficiencyTier } from '../../hvac/types';
import {
  ConstructionCalculatorCoefficients,
  HVACCalculatorCoefficients,
} from './calculatorTypes';
import {
  DEFAULT_CONSTRUCTION_COEFFICIENTS,
  DEFAULT_HVAC_COEFFICIENTS,
} from './calculatorConfigService';

// ----------------------------------------------------------------------
// CONSTRUCTION CALCULATION ENGINE
// ----------------------------------------------------------------------

export function calculateConstructionCostWithConfig(
  params: CostEstimateParams,
  configCoeffs: ConstructionCalculatorCoefficients = DEFAULT_CONSTRUCTION_COEFFICIENTS
): CostEstimateResult {
  const {
    projectType,
    finishingLevel,
    builtUpArea,
    floors,
    hasBasement,
    hasPool,
    hasElevator,
    hasSmartHome,
  } = params;

  // Ensure safe positive numeric inputs
  const safeArea = Math.max(builtUpArea || 150, 10);
  const safeFloors = Math.max(floors || 1, 1);

  // 1. Structural base rate
  let baseStructuralPerM2 = configCoeffs.baseStructuralPerM2;

  // Finishing & MEP rates
  const finishingKey = finishingLevel && configCoeffs.finishingLevels[finishingLevel]
    ? finishingLevel
    : 'deluxe';
  const finishingRateObj = configCoeffs.finishingLevels[finishingKey];

  let baseFinishingPerM2 = finishingRateObj.baseFinishingPerM2;
  let mepPerM2 = finishingRateObj.mepPerM2 || configCoeffs.mepPerM2Base;

  // 2. Adjust for project type structural requirements
  const multipliers = configCoeffs.projectTypeMultipliers;
  switch (projectType) {
    case 'commercial-building':
      baseStructuralPerM2 *= multipliers.commercialBuilding;
      break;
    case 'warehouse':
      baseStructuralPerM2 = multipliers.warehouseStructuralPerM2;
      mepPerM2 = multipliers.warehouseMepPerM2;
      baseFinishingPerM2 = Math.min(baseFinishingPerM2, multipliers.warehouseMaxFinishingPerM2);
      break;
    case 'residential-compound':
      baseStructuralPerM2 *= multipliers.residentialCompound;
      break;
    case 'villa':
      baseStructuralPerM2 *= multipliers.villa;
      break;
    case 'duplex':
      baseStructuralPerM2 *= multipliers.duplex;
      break;
    default:
      break;
  }

  // 3. Compute base components
  let structuralCost = baseStructuralPerM2 * safeArea;
  let finishingCost = baseFinishingPerM2 * safeArea;
  let mepCost = mepPerM2 * safeArea;

  // 4. Compute Addons
  let addonsCost = 0;
  const addons = configCoeffs.addons;

  if (hasBasement) {
    const basementEstArea = Math.min(safeArea / Math.max(safeFloors, 1), 600);
    addonsCost += basementEstArea * addons.basementCostPerM2;
  }

  if (hasPool) {
    addonsCost += addons.poolFlatCost;
  }

  if (hasElevator) {
    const elevatorStops = Math.max(safeFloors, 2);
    addonsCost += addons.elevatorBaseCost + (elevatorStops - 2) * addons.elevatorExtraFloorCost;
  }

  if (hasSmartHome && finishingLevel !== 'skeleton') {
    addonsCost += Math.min(safeArea * addons.smartHomeCostPerM2, addons.smartHomeMaxCost);
  }

  // 5. Height Factor adjustment
  if (safeFloors > 3) {
    const floorFactor = 1 + (safeFloors - 3) * configCoeffs.heightFactorPerFloorAbove3;
    structuralCost *= floorFactor;
  }

  const subtotalSAR = structuralCost + finishingCost + mepCost + addonsCost;

  // Variance boundaries (+/-)
  const minTotalSAR = Math.round((subtotalSAR * configCoeffs.varianceMinFactor) / 1000) * 1000;
  const maxTotalSAR = Math.round((subtotalSAR * configCoeffs.varianceMaxFactor) / 1000) * 1000;
  const avgTotalSAR = Math.round(subtotalSAR / 1000) * 1000;
  const pricePerM2SAR = Math.round(avgTotalSAR / Math.max(safeArea, 1));

  // Estimated construction duration (months)
  let estimatedDurationMonths = 10;
  if (safeArea < 600) {
    estimatedDurationMonths = finishingLevel === 'skeleton' ? 5 : 12;
  } else if (safeArea < 1500) {
    estimatedDurationMonths = finishingLevel === 'skeleton' ? 8 : 16;
  } else if (safeArea < 4000) {
    estimatedDurationMonths = finishingLevel === 'skeleton' ? 12 : 22;
  } else {
    estimatedDurationMonths = finishingLevel === 'skeleton' ? 16 : 28;
  }

  if (hasBasement) estimatedDurationMonths += 3;

  return {
    minTotalSAR,
    maxTotalSAR,
    avgTotalSAR,
    structuralCostSAR: Math.round(structuralCost),
    finishingCostSAR: Math.round(finishingCost),
    mepCostSAR: Math.round(mepCost),
    addonsCostSAR: Math.round(addonsCost),
    pricePerM2SAR,
    estimatedDurationMonths,
  };
}

// ----------------------------------------------------------------------
// HVAC CALCULATION ENGINE
// ----------------------------------------------------------------------

export interface HVACCalculationParams {
  areaSqM: number;
  baselineSeer: number;
  targetTier: EfficiencyTier;
  dailyHours: number;
  tariffRate?: number;
  horizonYears: number;
}

export interface HVACCalculationResult {
  estimatedTR: number;
  coolingLoadBTUh: number;
  annualOperatingHours: number;
  baselineAnnualKWh: number;
  upgradedAnnualKWh: number;
  annualKWhSaved: number;
  totalKWhSaved: number;
  totalFinancialSavingsSAR: number;
  totalCo2OffsetTons: number;
  efficiencyGainPercent: number;
  targetSeer: number;
  targetLabel: string;
}

export function calculateHVACEfficiencyWithConfig(
  params: HVACCalculationParams,
  configCoeffs: HVACCalculatorCoefficients = DEFAULT_HVAC_COEFFICIENTS
): HVACCalculationResult {
  const {
    areaSqM,
    baselineSeer,
    targetTier,
    dailyHours,
    tariffRate,
    horizonYears,
  } = params;

  const safeArea = Math.max(areaSqM || 150, 10);
  const safeDailyHours = Math.max(dailyHours || 12, 1);
  const safeBaselineSeer = Math.max(baselineSeer || 10.5, 5);
  const safeYears = Math.max(horizonYears || 1, 1);
  const activeTariff = tariffRate && tariffRate > 0 ? tariffRate : configCoeffs.defaultTariffRateSAR;

  // Target Tier SEER
  const tierObj = configCoeffs.tiers[targetTier] || configCoeffs.tiers.inverter_high;
  const targetSeer = tierObj.seer;
  const targetLabel = tierObj.labelEn;

  // 1. Cooling load estimation
  const estimatedTR = safeArea / (configCoeffs.areaPerTonSqM || 20);
  const coolingLoadBTUh = estimatedTR * (configCoeffs.btuPerTon || 12000);
  const annualOperatingHours = safeDailyHours * 365;

  // 2. Annual kWh Consumption: (BTU/h / SEER / 1000) * Annual Operating Hours
  const baselineAnnualKWh = (coolingLoadBTUh / safeBaselineSeer / 1000) * annualOperatingHours;
  const upgradedAnnualKWh = (coolingLoadBTUh / targetSeer / 1000) * annualOperatingHours;

  const annualKWhSaved = Math.max(0, baselineAnnualKWh - upgradedAnnualKWh);
  const totalKWhSaved = annualKWhSaved * safeYears;

  // 3. Financial Savings = kWh Saved * Tariff Rate
  const totalFinancialSavingsSAR = totalKWhSaved * activeTariff;

  // 4. Carbon Offset (Tons CO₂)
  const co2FactorKg = configCoeffs.co2EmissionFactorKgPerKWh || 0.52;
  const totalCo2OffsetTons = (totalKWhSaved * (co2FactorKg / 1000));

  // 5. Efficiency Gain %
  const efficiencyGainPercent = Math.round(
    ((targetSeer - safeBaselineSeer) / safeBaselineSeer) * 100
  );

  return {
    estimatedTR,
    coolingLoadBTUh,
    annualOperatingHours,
    baselineAnnualKWh,
    upgradedAnnualKWh,
    annualKWhSaved,
    totalKWhSaved,
    totalFinancialSavingsSAR,
    totalCo2OffsetTons,
    efficiencyGainPercent,
    targetSeer,
    targetLabel,
  };
}
