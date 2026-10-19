-- ==============================================================================
-- HARD REAL ESTATE & DEVELOPMENTS - SUPABASE POSTGRESQL MASTER SCHEMA & SEED
-- ==============================================================================

-- Enable UUID and Cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROPERTIES TABLE (Luxury Listings with Bilingual Data & Media)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  price NUMERIC NOT NULL,
  price_prefix_en TEXT DEFAULT 'Guide Price',
  price_prefix_ar TEXT DEFAULT 'السعر التقديري',
  location_en TEXT NOT NULL,
  location_ar TEXT NOT NULL,
  city TEXT NOT NULL,
  district_en TEXT,
  district_ar TEXT,
  coordinates JSONB,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area_sqm NUMERIC NOT NULL,
  features_en TEXT[],
  features_ar TEXT[],
  images TEXT[] NOT NULL,
  floor_plans TEXT[],
  video_url TEXT,
  virtual_tour_url TEXT,
  is_exclusive BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  agent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. LEADS TABLE (Inquiries, Viewing Requests, Valuations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY DEFAULT ('LEAD-' || floor(100000 + random() * 900000)::TEXT),
  type TEXT NOT NULL DEFAULT 'property_inquiry',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_contact_method TEXT DEFAULT 'whatsapp',
  message TEXT,
  property_id TEXT,
  project_id TEXT,
  preferred_date DATE,
  preferred_time_slot TEXT,
  property_type TEXT,
  budget NUMERIC,
  crm_synced BOOLEAN DEFAULT false,
  crm_reference_id TEXT,
  source TEXT DEFAULT 'HARD Web Portal',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. PROJECTS TABLE (Master Developments & Off-Plan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  location_en TEXT NOT NULL,
  location_ar TEXT NOT NULL,
  type_en TEXT NOT NULL,
  type_ar TEXT NOT NULL,
  status_en TEXT NOT NULL,
  status_ar TEXT NOT NULL,
  completion_date TEXT,
  units_count INTEGER,
  starting_price NUMERIC,
  image TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  features_en TEXT[],
  features_ar TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. BLOG POSTS TABLE (Market Insights & Real Estate Reports)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  excerpt_en TEXT,
  excerpt_ar TEXT,
  content_en TEXT,
  content_ar TEXT,
  author_en TEXT,
  author_ar TEXT,
  date TEXT,
  category_en TEXT,
  category_ar TEXT,
  read_time_en TEXT,
  read_time_ar TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TESTIMONIALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  role_en TEXT,
  role_ar TEXT,
  content_en TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar TEXT,
  property_type_en TEXT,
  property_type_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. SUBSCRIBERS TABLE (VIP Access & Newsletter)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Security Policies
DROP POLICY IF EXISTS "Public Read Properties" ON properties;
CREATE POLICY "Public Read Properties" ON properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Projects" ON projects;
CREATE POLICY "Public Read Projects" ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Blog" ON blog_posts;
CREATE POLICY "Public Read Blog" ON blog_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Testimonials" ON testimonials;
CREATE POLICY "Public Read Testimonials" ON testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Leads" ON leads;
CREATE POLICY "Public Insert Leads" ON leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Insert Subscribers" ON subscribers;
CREATE POLICY "Public Insert Subscribers" ON subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Access Properties" ON properties;
CREATE POLICY "Admin Full Access Properties" ON properties FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Access Leads" ON leads;
CREATE POLICY "Admin Full Access Leads" ON leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Access Projects" ON projects;
CREATE POLICY "Admin Full Access Projects" ON projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Access Blog" ON blog_posts;
CREATE POLICY "Admin Full Access Blog" ON blog_posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Access Testimonials" ON testimonials;
CREATE POLICY "Admin Full Access Testimonials" ON testimonials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Access Subscribers" ON subscribers;
CREATE POLICY "Admin Full Access Subscribers" ON subscribers FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- MASTER SEED DATA (ALL 6 PROPERTIES, 3 PROJECTS, 3 BLOGS, 3 TESTIMONIALS)
-- ==============================================================================

-- 1. SEED PROPERTIES
INSERT INTO properties (
  id, title_en, title_ar, description_en, description_ar, price, price_prefix_en, price_prefix_ar,
  location_en, location_ar, city, district_en, district_ar, coordinates, type, status,
  bedrooms, bathrooms, area_sqm, features_en, features_ar, images, is_exclusive, is_featured
) VALUES
(
  'prop-1',
  'The Sky Crest Penthouse with Panoramic Arabian Gulf Views',
  'بنتهاوس ذا سكاي كريست مع إطلالات بانورامية على كورنيش الخُبر والخليج',
  'An architectural masterpiece atop Al Khobar Corniche featuring double-height floor-to-ceiling glass, private infinity pool, Italian marble finishes, bespoke designer kitchen, and private direct elevator lobby.',
  'تحفة معمارية في قمة كورنيش الخُبر تتميز بزجاج مزدوج الارتفاع من الأرض حتى السقف، ومسبح إنفينيتي خاص، وتشطيبات من الرخام الإيطالي الفاخر، ومصعد خاص مباشر بإطلالة ساحلية مفتوحة.',
  25687500,
  'Guide Price',
  'السعر التقديري',
  'Prince Turki Street, Corniche, Al Khobar',
  'طريق الأمير تركي، الكورنيش، الخُبر',
  'khobar',
  'Corniche Waterfront',
  'كورنيش الخُبر',
  '{"lat": 26.2886, "lng": 50.2185}',
  'penthouse',
  'for-sale',
  5,
  6,
  729,
  ARRAY['Private Infinity Pool', 'Private Elevator', 'Concierge & Valet 24/7', 'Smart Home Automation', 'Private Spa & Sauna', 'Majlis & Executive Lounge', '4 Covered Parking Bays', 'Private Coastal Promenade Access'],
  ARRAY['مسبح إنفينيتي خاص', 'مصعد خاص مباشر', 'خدمات استقبال وحراسة 24/7', 'نظام تحكم منزلي ذكي متكامل', 'سبا وساونا خاصة', 'مجلس وصالون استقبال تنفيذي', '4 مواقف سيارات مغطاة', 'مدخل مباشر للممشى البحري'],
  ARRAY[
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80'
  ],
  true,
  true
),
(
  'prop-2',
  'Serene Royal Oasis Mansion in Dhahran Hills',
  'قصر الواحة الملكية في تلال الظهران الفاخرة',
  'A palatial contemporary estate nestled in the exclusive Dhahran Hills district. Features bespoke landscaped botanical gardens, resort-style heated lap pool, private cinema, separate grand reception majlis, separate driver & staff quarters, and high-security automation.',
  'قصر عصري استثنائي يقع في أرقى أحياء تلال الظهران. يتضمن حدائق منسقة خاصة ونوافير، ومسبحاً مدفأ بطراز المنتجعات، وسينما خاصة، ومجالس ضيافة ملكية مستقلة للرجال والنساء، وجناحاً مستقلاً للخدمات، ونظام أمان ذكي متكامل.',
  45937500,
  'Guide Price',
  'السعر التقديري',
  'Royal Boulevard, Dhahran Hills, Dhahran',
  'شارع القصور، تلال الظهران',
  'dhahran',
  'Dhahran Hills / Al Dana',
  'تلال الظهران / الدانة',
  '{"lat": 26.305, "lng": 50.145}',
  'mansion',
  'for-sale',
  6,
  8,
  1319,
  ARRAY['Private 12-Seat Cinema', 'Private Grand Royal Majlis', 'Heated Lap Pool', 'Chef Commercial Kitchen', 'Gymnasium & Moroccan Hammam', 'Smart Security & Solar Infrastructure', '6 Covered Parking Bays', 'Driver & Maid Quarters'],
  ARRAY['سينما خاصة 12 مقعداً', 'مجلس ضيافة ملكي فسيح', 'مسبح مدفأ متدرج', 'مطبخ تحضيري ومركزي مجهز', 'صالة رياضية وحمام مغربي', 'نظام أمن ذكي وطاقة شمسية', '6 مواقف سيارات مغطاة', 'أجنحة مستقلة للسائق والخدمات'],
  ARRAY[
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80'
  ],
  true,
  true
),
(
  'prop-3',
  'Azure Luxury Residence in Al Shobaily Waterfront',
  'شقة فاخرة بإطلالة مائية في الشبيلي جراند مول - الخُبر',
  'Sophisticated 3-bedroom residence offering uninterrupted views of Al Shobaily Bay and Al Khobar coast. Features floor-to-ceiling acoustic glass, wrap-around balcony, Miele-equipped kitchen, and luxury tower amenities.',
  'شقة فاخرة بتصميم عصري مكونة من 3 غرف نوم توفر إطلالات ساحرة على خليج الشبيلي وواجهة الخُبر البحرية. تتميز بزجاج عازل للصوت من الأرض حتى السقف وشرفة واسعة ومطبخ حديث متكامل.',
  5325000,
  'Guide Price',
  'السعر التقديري',
  'Al Shobaily Bay Boulevard, Al Khobar',
  'بوليفارد الشبيلي، الخُبر',
  'khobar',
  'Al Shobaily District',
  'حي الشبيلي',
  '{"lat": 26.241, "lng": 50.211}',
  'apartment',
  'for-sale',
  3,
  4,
  274,
  ARRAY['Panoramic Sea View Balcony', 'State-of-the-Art Fitness Center', 'Infinity Bay Swimming Pool', 'Resident Private Cinema', '2 Covered Parking Slots', 'Private Marina Berth Access'],
  ARRAY['شرفة بانورامية بإطلالة بحرية', 'نادي لياقة بدنية مجهز بالكامل', 'مسبح إنفينيتي بإطلالة مائية', 'سينما خاصة للقاطنين', 'موقفان مغطيان للسيارات', 'مرسى لليخوت والقوارب'],
  ARRAY[
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80'
  ],
  false,
  true
),
(
  'prop-4',
  'Contemporary Waterfront Villa in Al Shati Dammam',
  'فيلا عصرية فاخرة بحي الشاطئ الغربي - الدمام',
  'Charming modern 4-bedroom contemporary villa located in Al Shati, Dammam. Open-plan living spaces bathed in natural sunlight, landscaped private courtyard with waterfall fountain, high ceilings, and premium ceramic & wood flooring.',
  'فيلا عصرية حديثة مكونة من 4 غرف نوم في حي الشاطئ بالدمام. مساحات معيشة مفتوحة غارقة بالضوء الطبيعي، وفناء خاص منسق مع شلال مائي، وأسقف مرتفعة وتشطيبات خشبية ورخامية راقية.',
  4050000,
  'Guide Price',
  'السعر التقديري',
  'Corniche Road, Al Shati, Dammam',
  'طريق الكورنيش، حي الشاطئ، الدمام',
  'dammam',
  'Al Shati District',
  'حي الشاطئ',
  '{"lat": 26.462, "lng": 50.118}',
  'villa',
  'for-sale',
  4,
  5,
  427,
  ARRAY['Private Landscaped Garden & Water Feature', 'Rooftop Terrace Lounge', 'Smart Entry & Ambient Lighting', 'Maid Room with En-suite', 'Close to Dammam Corniche & Parks', '2 Covered Parking Bays'],
  ARRAY['حديقة خاصة منسقة مع شلال مائي', 'جلسة روف عصرية بإطلالة مفتوحة', 'دخول ذكي وإضاءات تفاعلية', 'غرفة خادمة بدورة مياه خاصة', 'قريب من ممشى كورنيش الدمام والحدائق', 'موقفان مغطيان للسيارات'],
  ARRAY[
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'
  ],
  false,
  false
),
(
  'prop-5',
  'The Grand Rakah Executive Sky Suite',
  'جناح تنفيذي راقٍ للإيجار السنوي - حي الراكة الخُبر',
  'Prime luxury rental home ready for immediate occupancy. High-end furnished layout, custom ambient lighting, walk-in closets, central HVAC, and immediate highway access to Dhahran Techno Valley and Al Khobar commercial core.',
  'شقة فاخرة مؤثثة بالكامل للإيجار السنوي في حي الراكة الراقي بين الخُبر والدمام. تشطيبات فندقية فاخرة وتكييف مركزي وموقع استراتيجي ممتاز بالقرب من وادي الظهران للتقنية وأرامكو.',
  240000,
  'Annual Rent',
  'إيجار سنوي',
  'King Khalid Road, Al Rakah, Al Khobar',
  'طريق الملك خالد، حي الراكة، الخُبر',
  'khobar',
  'Al Rakah South',
  'حي الراكة الجنوبية',
  '{"lat": 26.368, "lng": 50.198}',
  'apartment',
  'for-rent',
  2,
  3,
  172,
  ARRAY['Fully Designer Furnished', 'All Utilities & High-Speed WiFi Ready', '24/7 Secure Access & CCTV', 'Heated Indoor Pool & Gym', 'Assigned Basement Parking', 'Weekly Housekeeping Available'],
  ARRAY['مفروشة بالكامل بتصميم راقٍ', 'جاهزة بالخدمات وإنترنت فائق السرعة', 'دخول آمن وحراسة على مدار الساعة', 'مسبح داخلي مدفأ ونادي صحي', 'موقف سيارة مخصص بالقبو', 'خدمات تنظيف دورية متوفرة'],
  ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab00f?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1600&q=80'
  ],
  false,
  false
),
(
  'prop-6',
  'The Royal Marina Villa in Al Shobaily Bay',
  'فيلا المارينا الملكية المستقلة - خليج الشبيلي الخُبر',
  'A premier waterfront estate located on the tranquil shores of Al Shobaily Bay. Featuring private direct boat slip, expansive marble terraces, floor-to-ceiling glass pavilions, and grand reception halls.',
  'فيلا ملكية فاخرة مستقلة مباشرة على مياه خليج الشبيلي مع مرسى خاص للقوارب واليخوت. تتميز بتراسات رخامية شاسعة وصالات استقبال فاخرة وإطلالات بحرية آسرة.',
  8062500,
  'Guide Price',
  'السعر التقديري',
  'Marina Island Way, Al Shobaily, Al Khobar',
  'طريق جزيرة المارينا، الشبيلي، الخُبر',
  'khobar',
  'Al Shobaily Waterfront',
  'واجهة الشبيلي البحرية',
  '{"lat": 26.235, "lng": 50.219}',
  'villa',
  'for-sale',
  5,
  6,
  576,
  ARRAY['Private Boat Berth & Slipway', 'Sea-Facing Infinity Pool', 'Separate Guest Majlis', 'Chef & Service Kitchens', 'Smart Automation & Security', '4 Covered Garage Bays'],
  ARRAY['مرسى خاص مباشر للقوارب', 'مسبح إنفينيتي مواجه للبحر', 'مجلس ضيافة مستقل للزوار', 'مطبخ رئيسي وتحضيري', 'نظام تحكم ذكي وأمان متطور', 'كراج مغطى يتسع لـ 4 سيارات'],
  ARRAY[
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80'
  ],
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_ar = EXCLUDED.title_ar,
  price = EXCLUDED.price,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  images = EXCLUDED.images;

-- 2. SEED PROJECTS
INSERT INTO projects (
  id, name_en, name_ar, location_en, location_ar, type_en, type_ar,
  status_en, status_ar, completion_date, units_count, starting_price,
  image, description_en, description_ar, features_en, features_ar
) VALUES
(
  'proj-1',
  'The Pearl of Khobar Waterfront Towers',
  'أبراج لؤلؤة الخُبر البحرية الفاخرة',
  'Al Shobaily Waterfront, Al Khobar, Eastern Province',
  'واجهة الشبيلي البحرية، الخُبر، المنطقة الشرقية',
  'Luxury Residential Towers',
  'أبراج سكنية فاخرة',
  'Under Construction (65%)',
  'قيد الإنشاء (65%)',
  'Q4 2026',
  280,
  1912500,
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'A premier waterfront master community featuring branded residences, private marina slips, Michelin-curated promenade dining, and smart wellness club.',
  'مجتمع سكني بحري متكامل يضم شققاً فندقية فاخرة ومراسي خاصة لليخوت ومطاعم عالمية وممشى ساحلي ونادي صحي متطور.',
  ARRAY['Flexible Milestone Payment Plan', 'Direct Access to Al Shobaily Bay Promenade', 'Guaranteed 3-Year Rental Management Yield', 'Full REGA Compliance & Certified Governance'],
  ARRAY['خطة سداد مرنة مرتبطة بمراحل الإنجاز', 'وصول مباشر لممشى خليج الشبيلي والمارينا', 'إدارة تأجير وتشغيل متكاملة بعوائد مجزية', 'مرخص رسمياً ومعتمد من الهيئة العامة للعقار']
),
(
  'proj-2',
  'Dhahran Heights Executive Residential Club',
  'مرتفعات الظهران السكنية الفاخرة',
  'King Saud Road, Dhahran / Al Dana',
  'طريق الملك سعود، الظهران / حي الدانة',
  'Gated Luxury Mansions',
  'فلل وقصور مستقلة بمجمع مغلق',
  'Off-Plan Launching',
  'إطلاق المخطط',
  'Q2 2026',
  48,
  7875000,
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  'An exclusive gated community comprising modern architectural villas, private clubhouses, and central green parks adjacent to Dhahran business district.',
  'مجمع سكني خاص مغلق يضم قصوراً وفللاً فاخرة بتصاميم معمارية فريدة ومساحات خضراء شاسعة بالقرب من مراكز الأعمال في الظهران.',
  ARRAY['Private 18-Hole Championship Golf Proximity', 'Dedicated Private Chauffeur & Concierge Suite', 'High-Ceiling Solar & Smart Micro-Grid Design', 'Comprehensive REGA Developer Security Bond'],
  ARRAY['بالقرب من ملاعب الجولف والأندية الخاصة', 'خدمات استقبال واستقبال ضيوف على مدار الساعة', 'تصميم بيئي ذكي يعتمد على الطاقة المستدامة', 'ضمانات إنشائية واعتمادات موثقة من الهيئة العامة للعقار']
),
(
  'proj-3',
  'Dammam Marina Crystal Residences',
  'أبراج مارينا الدمام الكريستالية',
  'Corniche Al Shati, Dammam',
  'كورنيش حي الشاطئ، الدمام',
  'Waterfront Sky Residences',
  'شقق وأجنحة بحرية فاخرة',
  'Under Construction (45%)',
  'قيد الإنشاء (45%)',
  'Q1 2027',
  160,
  3262500,
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'Iconic crystal-glass high-rise residences along Dammam waterfront featuring sky lounges, infinity ocean pools, and commercial boardwalk.',
  'أبراج سكنية زجاجية شاهقة على واجهة الدمام البحرية تتميز بصالات سكاي لاونج ومسابح معلقة وممشى تجاري فاخر.',
  ARRAY['Unobstructed Direct Arabian Gulf Views', '10% Down Payment with Easy Installments', 'EV Charging & Smart Parking for Every Unit', 'Official Escrow & Certified REGA Standards'],
  ARRAY['إطلالات بحرية مفتوحة ومباشرة على الخليج العربي', 'دفعة أولى 10% وأقساط ميسرة', 'محطات شحن سيارات كهربائية ومواقف ذكية لكل وحدة', 'حساب ضمان معتمد وتوثيق رسمي لدى الهيئة العامة للعقار']
)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  starting_price = EXCLUDED.starting_price,
  image = EXCLUDED.image;

-- 3. SEED BLOG POSTS
INSERT INTO blog_posts (
  id, title_en, title_ar, excerpt_en, excerpt_ar, author_en, author_ar,
  date, category_en, category_ar, read_time_en, read_time_ar, image
) VALUES
(
  'post-1',
  'Eastern Province Real Estate Outlook 2025: Khobar & Dammam Growth Corridors',
  'آفاق السوق العقاري في المنطقة الشرقية 2025: محاور النمو في الخُبر والدمام',
  'An in-depth market report examining luxury capital appreciation, rental yield dynamics, and infrastructure investments across Eastern Province.',
  'تقرير شامل يحلل نمو العوائد الاستثمارية وارتفاع القيمة الرأسمالية ومشاريع البنية التحتية العملاقة في المنطقة الشرقية.',
  'Faisal Al-Otaibi',
  'فيصل العتيبي',
  'August 12, 2025',
  'Market Intelligence',
  'دراسات وتقارير السوق',
  '6 min read',
  'قراءة 6 دقائق',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
),
(
  'post-2',
  'Navigating REGA & FAL Brokerage Regulations in Saudi Arabia',
  'دليل المستثمر للوائح الهيئة العامة للعقار ورخص الوساطة (فال)',
  'Essential legal considerations, escrow protection frameworks, and compliance standards for foreign and local investors in Saudi real estate.',
  'أبرز الإرشادات القانونية والضمانات البنكية وحماية العقود عبر منصات الهيئة العامة للعقار وبرنامج إيجار.',
  'Reem Al-Qahtani',
  'ريم القحطاني',
  'July 28, 2025',
  'Regulatory Insights',
  'إرشادات وتنظيمات عقارية',
  '5 min read',
  'قراءة 5 دقائق',
  'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80'
),
(
  'post-3',
  'Why Luxury Waterfront Living in Al Shobaily & Khobar Corniche Outperforms',
  'لماذا تتفوق العقارات الساحلية في الشبيلي وكورنيش الخُبر استثمارياً؟',
  'A strategic review of capital growth, high occupancy rates, and lifestyle premium in Eastern Province coastal communities.',
  'تحليل مقارن لمعدلات الإشغال وارتفاع القيمة الإيجارية في المشاريع والواجهات البحرية بالمنطقة الشرقية.',
  'Sultan Al-Ghamdi',
  'سلطان الغامدي',
  'June 30, 2025',
  'Investment Strategy',
  'استراتيجيات الاستثمار',
  '4 min read',
  'قراءة 4 دقائق',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  title_ar = EXCLUDED.title_ar;

-- 4. SEED TESTIMONIALS
INSERT INTO testimonials (
  id, name_en, name_ar, role_en, role_ar, content_en, content_ar, rating, property_type_en, property_type_ar
) VALUES
(
  'test-1',
  'Eng. Khalid Al-Zahrani',
  'م. خالد الزهراني',
  'Managing Director, Energy Investments',
  'مدير تنفيذي لاستثمارات الطاقة',
  'Listing my luxury villa in Al Khobar with HARD was the best decision. Their cinematic media marketing and verified buyer network brought 3 qualified cash offers in under two weeks. We closed smoothly above our initial reserve price.',
  'كان عرض قصرنا في الخُبر مع شركة هارد للعقارات أفضل قرار اتخذته. حملتهم الإعلامية السينمائية وشبكة المشترين المعتمدين حققت 3 عروض شراء نقدية خلال أقل من أسبوعين، وتم الإفراغ بسلاسة تفوق توقعاتنا.',
  5,
  'Sold Khobar Waterfront Villa in 11 Days',
  'بيع فيلا كورنيش الخُبر في 11 يوماً'
),
(
  'test-2',
  'Dr. Fatima Al-Mansoor',
  'د. فاطمة المنصور',
  'Healthcare Executive & Portfolio Investor',
  'مستثمرة عقارية وقيادية في القطاع الصحي',
  'As an active investor acquiring prime residential towers and commercial land in the Eastern Province, the market intelligence and REGA-verified transaction advisory provided by HARD were truly exceptional.',
  'بصفتي مستثمرة في الأراضي والمجمعات السكنية بالمنطقة الشرقية، كانت دراسات السوق والوساطة الاحترافية الموثقة عبر منصات الهيئة العامة للعقار مع هارد على أعلى مستوى من الدقة والاحترافية.',
  5,
  'Acquired 2 Prime Waterfront Assets (28M SAR)',
  'شراء أصلين بحريين فاخرين بقيمة 28 مليون ريال'
),
(
  'test-3',
  'Mark & Sarah Thompson',
  'مارك وسارة طومسون',
  'Executive Relocation Clients',
  'عائلة تنفيذية مقيمة بالمنطقة الشرقية',
  'Relocating to Saudi Arabia, navigating local title registries and neighborhood selections seemed daunting. The advisors at HARD guided us through every step, finding our dream family home in Dhahran Hills completely hassle-free.',
  'أثناء انتقالنا للعمل في المملكة، ساعدنا فريق هارد في اختيار الحي المثالي واستكمال كافة إجراءات التوثيق السكني بسلاسة تامة وشفافية مطلقة في تلال الظهران.',
  5,
  'Family Home in Dhahran Hills',
  'شراء منزل عائلي فاخر في تلال الظهران'
)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar;
