/**
 * HARD GROUP - VERSIONED CALCULATOR CONFIGURATION TYPES & SCHEMAS
 */

export type CalculatorType = 'construction' | 'hvac';
export type CalculatorConfigStatus = 'published' | 'draft' | 'archived';

// ----------------------------------------------------------------------
// CONSTRUCTION CALCULATOR COEFFICIENTS
// ----------------------------------------------------------------------

export interface FinishingLevelRates {
  baseFinishingPerM2: number;
  mepPerM2: number;
}

export interface ConstructionProjectTypeMultipliers {
  commercialBuilding: number; // e.g. 1.35
  warehouseStructuralPerM2: number; // e.g. 480
  warehouseMepPerM2: number; // e.g. 180
  warehouseMaxFinishingPerM2: number; // e.g. 350
  residentialCompound: number; // e.g. 1.08
  villa: number; // e.g. 1.0
  duplex: number; // e.g. 1.0
}

export interface ConstructionAddonCosts {
  basementCostPerM2: number; // SAR/m² (e.g. 1400)
  poolFlatCost: number; // SAR flat (e.g. 110000)
  elevatorBaseCost: number; // SAR (e.g. 75000)
  elevatorExtraFloorCost: number; // SAR per stop above 2 (e.g. 9000)
  smartHomeCostPerM2: number; // SAR/m² (e.g. 120)
  smartHomeMaxCost: number; // SAR cap (e.g. 180000)
}

export interface ConstructionCalculatorCoefficients {
  baseStructuralPerM2: number; // SAR/m² (e.g. 620)
  mepPerM2Base: number; // SAR/m² default (e.g. 280)
  finishingLevels: {
    skeleton: FinishingLevelRates;
    commercial: FinishingLevelRates;
    deluxe: FinishingLevelRates;
    superLuxury: FinishingLevelRates;
  };
  projectTypeMultipliers: ConstructionProjectTypeMultipliers;
  addons: ConstructionAddonCosts;
  heightFactorPerFloorAbove3: number; // e.g. 0.04 (4% per floor above 3)
  varianceMinFactor: number; // e.g. 0.94
  varianceMaxFactor: number; // e.g. 1.07
}

export interface ConstructionCalculatorConfigDoc {
  id: string;
  calculatorType: 'construction';
  version: number;
  status: CalculatorConfigStatus;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  assumptionsAr: string;
  assumptionsEn: string;
  coefficients: ConstructionCalculatorCoefficients;
  updatedAt: string;
  publishedAt?: string;
  publishedBy?: string;
}

// ----------------------------------------------------------------------
// HVAC CALCULATOR COEFFICIENTS
// ----------------------------------------------------------------------

export interface HVACTierOption {
  id: string;
  seer: number;
  labelAr: string;
  labelEn: string;
  seerDisplay: string;
}

export interface HVACCalculatorCoefficients {
  areaPerTonSqM: number; // m² per TR (e.g. 20)
  btuPerTon: number; // BTU/h per TR (e.g. 12000)
  co2EmissionFactorKgPerKWh: number; // kg CO₂/kWh (e.g. 0.52)
  defaultTariffRateSAR: number; // SAR/kWh (e.g. 0.18)
  tiers: {
    split_standard: HVACTierOption;
    inverter_high: HVACTierOption;
    package_unit: HVACTierOption;
    vrf_central: HVACTierOption;
  };
  baselineOptions: Array<{
    id: string;
    seer: number;
    labelAr: string;
    labelEn: string;
  }>;
}

export interface HVACCalculatorConfigDoc {
  id: string;
  calculatorType: 'hvac';
  version: number;
  status: CalculatorConfigStatus;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  assumptionsAr: string;
  assumptionsEn: string;
  coefficients: HVACCalculatorCoefficients;
  updatedAt: string;
  publishedAt?: string;
  publishedBy?: string;
}

export type AnyCalculatorConfigDoc = ConstructionCalculatorConfigDoc | HVACCalculatorConfigDoc;

// Snapshot stored with Quote Requests
export interface QuoteCalculatorSnapshot {
  calculatorType: CalculatorType;
  calculatorVersion: string; // e.g. "construction_v1" or "hvac_v2"
  publishedAt?: string;
  inputSnapshot: Record<string, any>;
  calculationSnapshot: Record<string, any>;
}
