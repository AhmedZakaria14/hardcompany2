export interface CityOption {
  en: string;
  ar: string;
}

export type SaudiCity = CityOption;

export const SAUDI_CITIES: CityOption[] = [
  { ar: 'الرياض', en: 'Riyadh' },
  { ar: 'مكة المكرمة', en: 'Makkah' },
  { ar: 'المدينة المنورة', en: 'Madinah' },
  { ar: 'جدة', en: 'Jeddah' },
  { ar: 'الدمام', en: 'Dammam' },
  { ar: 'الخبر', en: 'Al Khobar' },
  { ar: 'الظهران', en: 'Dhahran' },
  { ar: 'الهفوف', en: 'Al Hofuf' },
  { ar: 'المبرز', en: 'Al Mubarraz' },
  { ar: 'القطيف', en: 'Al Qatif' },
  { ar: 'سيهات', en: 'Saihat' },
  { ar: 'الجبيل', en: 'Al Jubail' },
  { ar: 'حفر الباطن', en: 'Hafar Al Batin' },
  { ar: 'الخفجي', en: 'Al Khafji' },
  { ar: 'بقيق', en: 'Buqayq' },
  { ar: 'رأس تنورة', en: 'Ras Tanura' },
  { ar: 'النعيرية', en: 'Al Nairyah' },
  { ar: 'الطائف', en: 'Taif' },
  { ar: 'ينبع', en: 'Yanbu' },
  { ar: 'رابغ', en: 'Rabigh' },
  { ar: 'القنفذة', en: 'Al Qunfudhah' },
  { ar: 'الليث', en: 'Al Lith' },
  { ar: 'بريدة', en: 'Buraidah' },
  { ar: 'عنيزة', en: 'Unaizah' },
  { ar: 'الرس', en: 'Ar Rass' },
  { ar: 'البكيرية', en: 'Al Bukayriyah' },
  { ar: 'المذنب', en: 'Al Mithnab' },
  { ar: 'أبها', en: 'Abha' },
  { ar: 'خميس مشيط', en: 'Khamis Mushait' },
  { ar: 'بيشة', en: 'Bisha' },
  { ar: 'النماص', en: 'Al Namas' },
  { ar: 'محايل عسير', en: 'Muhayil Asir' },
  { ar: 'جازان', en: 'Jazan' },
  { ar: 'صبيا', en: 'Sabya' },
  { ar: 'أبو عريش', en: 'Abu Arish' },
  { ar: 'صامطة', en: 'Samtah' },
  { ar: 'نجران', en: 'Najran' },
  { ar: 'شرورة', en: 'Sharurah' },
  { ar: 'الباحة', en: 'Al Baha' },
  { ar: 'بلجرشي', en: 'Baljurashi' },
  { ar: 'تبوك', en: 'Tabuk' },
  { ar: 'ضباء', en: 'Duba' },
  { ar: 'الوجه', en: 'Al Wajh' },
  { ar: 'أملج', en: 'Umluj' },
  { ar: 'حائل', en: 'Hail' },
  { ar: 'سكاكا', en: 'Sakaka' },
  { ar: 'القريات', en: 'Al Qurayyat' },
  { ar: 'عرعر', en: 'Arar' },
  { ar: 'رفحاء', en: 'Rafha' },
  { ar: 'طريف', en: 'Turaif' },
];

export const SAUDI_CITY_NAMES_AR = SAUDI_CITIES.map((c) => c.ar);
export const SAUDI_CITY_NAMES_EN = SAUDI_CITIES.map((c) => c.en);
