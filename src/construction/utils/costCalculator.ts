import { CostEstimateParams, CostEstimateResult } from '../types';

export function calculateConstructionCost(params: CostEstimateParams): CostEstimateResult {
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

  // Base price per m² according to finishing level & project type (Saudi market benchmarks)
  let baseStructuralPerM2 = 620; // SAR / m² (materials + labor + testing)
  let baseFinishingPerM2 = 0;
  let mepPerM2 = 280;

  switch (finishingLevel) {
    case 'skeleton':
      baseFinishingPerM2 = 0;
      mepPerM2 = 120; // Rough-in plumbing/electric piping only
      break;
    case 'commercial':
      baseFinishingPerM2 = 550;
      mepPerM2 = 320;
      break;
    case 'deluxe':
      baseFinishingPerM2 = 980;
      mepPerM2 = 420;
      break;
    case 'super-luxury':
      baseFinishingPerM2 = 1650;
      mepPerM2 = 580;
      break;
  }

  // Adjust for project type structural requirements
  switch (projectType) {
    case 'commercial-building':
      baseStructuralPerM2 *= 1.35; // heavier columns, deep foundations, wind/seismic
      break;
    case 'warehouse':
      baseStructuralPerM2 = 480; // steel frame / PEB
      mepPerM2 = 180;
      baseFinishingPerM2 = Math.min(baseFinishingPerM2, 350);
      break;
    case 'residential-compound':
      baseStructuralPerM2 *= 1.08;
      break;
    case 'villa':
    case 'duplex':
    default:
      break;
  }

  // Multiply by built-up area
  let structuralCost = baseStructuralPerM2 * builtUpArea;
  let finishingCost = baseFinishingPerM2 * builtUpArea;
  let mepCost = mepPerM2 * builtUpArea;

  // Addons and floor complexity adjustments
  let addonsCost = 0;

  if (hasBasement) {
    // Basement requires heavy shoring, dewatering, tanking insulation
    const basementEstArea = Math.min(builtUpArea / Math.max(floors, 1), 600);
    addonsCost += basementEstArea * 1400; // SAR
  }

  if (hasPool) {
    addonsCost += 110000; // Custom reinforced concrete + filtration + mosaic
  }

  if (hasElevator) {
    const elevatorStops = Math.max(floors, 2);
    addonsCost += 75000 + (elevatorStops - 2) * 9000; // Hydraulic / Gearless Italian system
  }

  if (hasSmartHome && finishingLevel !== 'skeleton') {
    addonsCost += Math.min(builtUpArea * 120, 180000); // KNX / Zigbee infrastructure
  }

  // Height factor (scaffolding and crane costs)
  if (floors > 3) {
    const floorFactor = 1 + (floors - 3) * 0.04;
    structuralCost *= floorFactor;
  }

  const subtotalSAR = structuralCost + finishingCost + mepCost + addonsCost;

  // Price range variance (+/- 7%)
  const minTotalSAR = Math.round((subtotalSAR * 0.94) / 1000) * 1000;
  const maxTotalSAR = Math.round((subtotalSAR * 1.07) / 1000) * 1000;
  const avgTotalSAR = Math.round(subtotalSAR / 1000) * 1000;
  const pricePerM2SAR = Math.round(avgTotalSAR / Math.max(builtUpArea, 1));

  // Estimated construction duration (months)
  let estimatedDurationMonths = 10;
  if (builtUpArea < 600) {
    estimatedDurationMonths = finishingLevel === 'skeleton' ? 5 : 12;
  } else if (builtUpArea < 1500) {
    estimatedDurationMonths = finishingLevel === 'skeleton' ? 8 : 16;
  } else if (builtUpArea < 4000) {
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

export function formatSAR(amount: number, isAr: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
  return isAr ? `${formatted} ر.س` : `${formatted} SAR`;
}
