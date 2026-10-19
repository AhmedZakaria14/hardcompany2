import { Home, Building2, Sparkles, Crown, Building, Store, Layers, LucideIcon } from 'lucide-react';
import { Property, PropertyType, Language } from '../types';

export interface PropertyTypeConfig {
  id: PropertyType;
  labelKey: string;
  defaultLabel: {
    en: string;
    ar: string;
  };
  icon: LucideIcon;
}

export const PROPERTY_TAXONOMY: PropertyTypeConfig[] = [
  {
    id: 'villa',
    labelKey: 'villa',
    defaultLabel: { en: 'Villa', ar: 'فيلا' },
    icon: Home,
  },
  {
    id: 'apartment',
    labelKey: 'apartment',
    defaultLabel: { en: 'Apartment', ar: 'شقة سكنية' },
    icon: Building2,
  },
  {
    id: 'penthouse',
    labelKey: 'penthouse',
    defaultLabel: { en: 'Penthouse', ar: 'بنتهاوس' },
    icon: Sparkles,
  },
  {
    id: 'mansion',
    labelKey: 'mansion',
    defaultLabel: { en: 'Mansion & Palace', ar: 'قصر ومقر فاخر' },
    icon: Crown,
  },
  {
    id: 'townhouse',
    labelKey: 'townhouse',
    defaultLabel: { en: 'Townhouse', ar: 'تاون هاوس' },
    icon: Building,
  },
  {
    id: 'commercial',
    labelKey: 'commercial',
    defaultLabel: { en: 'Commercial', ar: 'تجاري' },
    icon: Store,
  },
];

export const ALL_PROPERTY_TYPE_IDS: PropertyType[] = PROPERTY_TAXONOMY.map((t) => t.id);

/**
 * Calculates dynamic counts for 'all' and every defined property type category.
 * Guaranteed: Sum of category counts === count of 'all'.
 */
export function calculatePropertyTypeCounts(properties: Property[]): Record<string, number> {
  const counts: Record<string, number> = {
    all: properties.length,
  };

  PROPERTY_TAXONOMY.forEach((typeConfig) => {
    counts[typeConfig.id] = 0;
  });

  properties.forEach((prop) => {
    if (prop.type && counts[prop.type] !== undefined) {
      counts[prop.type]++;
    }
  });

  return counts;
}

/**
 * Returns localized property type label.
 */
export function getPropertyTypeLabel(type: PropertyType, lang: Language, translationsObj?: any): string {
  if (translationsObj?.properties?.filters?.[type]) {
    return translationsObj.properties.filters[type];
  }
  const match = PROPERTY_TAXONOMY.find((t) => t.id === type);
  if (match) {
    return match.defaultLabel[lang];
  }
  return type;
}
