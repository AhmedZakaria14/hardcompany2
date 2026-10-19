import {
  HVACService,
  HVACGalleryItem,
  HVACTestimonial,
  HVACFaqItem,
  HVACChecklistItem,
  HVACLead,
} from '../types';

export const initialServices: HVACService[] = [
  {
    id: 'hvac-repair',
    slug: 'repair',
    titleEn: 'AC Repair & Rapid Troubleshooting',
    titleAr: 'صيانة وإصلاح أعطال التكييف الفورية',
    descriptionEn:
      'Diagnostic testing for electrical faults, compressor failures, faulty contactors, thermostat malfunctions, and circuit board repairs.',
    descriptionAr:
      'فحص متقدم للأعطال الكهربائية، تبديل الكمبروسرات التالفة، معالجة الكونتاكتور واللوحات الإلكترونية، وضبط الثرموستات الذكي.',
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    badgeEn: 'Emergency Dispatch',
    badgeAr: 'طوارئ واستجابة سريعة',
    active: true,
    sortOrder: 1,
  },
  {
    id: 'hvac-cleaning',
    slug: 'cleaning',
    titleEn: 'Deep Coil Cleaning & Chemical Washing',
    titleAr: 'الغسيل الكيميائي العميق وتنظيف الكويلات',
    descriptionEn:
      'High-pressure chemical decontamination of condenser and evaporator coils, anti-fungal treatment, and deep tray drainage clearing.',
    descriptionAr:
      'غسيل كيميائي عالي الضغط للكويلات الداخلية والخارجية، معالجة الفطريات، تنظيف وتطهير مجاري تصريف المياه لمنع الروائح والانسداد.',
    image:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    badgeEn: 'Allergen Removal',
    badgeAr: 'تنقية هواء ومكافحة البكتيريا',
    active: true,
    sortOrder: 2,
  },
  {
    id: 'hvac-installation',
    slug: 'installation',
    titleEn: 'New AC System & Unit Installation',
    titleAr: 'توريد وتركيب أنظمة التكييف الجديدة',
    descriptionEn:
      'Turnkey installation of split, ducted, concealed, package, and VRF systems engineered with certified copper piping and vibration pads.',
    descriptionAr:
      'تركيب أنظمة السبليت، الكونسيلد المخفي، الباكج، وأنظمة VRF بأنابيب نحاسية معزولة وقواعد تخميد الاهتزازات المعتمدة.',
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    badgeEn: 'Warranty Guaranteed',
    badgeAr: 'ضمان التوريد والتركيب',
    active: true,
    sortOrder: 3,
  },
  {
    id: 'hvac-contracts',
    slug: 'contracts',
    titleEn: 'Annual Maintenance Contracts (AMC)',
    titleAr: 'عقود الصيانة الوقائية السنوية (AMC)',
    descriptionEn:
      'Structured quarterly maintenance plans for villas, commercial towers, schools, and medical clinics with priority emergency response.',
    descriptionAr:
      'عقود دورية ربع سنوية مصممة للفلل، المجمعات، المباني الإدارية والعيادات مع أولوية قصوى لمباشرة الطوارئ وتوفير قطع الغيار.',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    badgeEn: 'Priority Service',
    badgeAr: 'أولوية قصوى وخصومات دورية',
    active: true,
    sortOrder: 4,
  },
  {
    id: 'hvac-inspection',
    slug: 'inspection',
    titleEn: 'Inspection, Gas Charging & Diagnostics',
    titleAr: 'فحص ضغط الغاز وتعبئة الفريون الأصلي',
    descriptionEn:
      'Electronic nitrogen leak testing, vacuum micron purging, and precise R410A / R32 / R22 refrigerant charging to factory specs.',
    descriptionAr:
      'كشف إلكتروني لتسريبات غاز التبريد بواسطة النيتروجين، تفريغ فاكيوم بالمايكرون، وتعبئة فريون R410A و R32 بموازين دقيقة.',
    image:
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    badgeEn: 'Pure R410A/R32',
    badgeAr: 'فريون أمريكي وأوروبي أصلي',
    active: true,
    sortOrder: 5,
  },
  {
    id: 'hvac-routine',
    slug: 'routine',
    titleEn: 'Routine Servicing & Filter Replacement',
    titleAr: 'الصيانة الدورية وتبديل الفلاتر وضبط الأداء',
    descriptionEn:
      'Comprehensive pre-summer checkups, HEPA filter replacements, airflow balancing, fan motor greasing, and amp draw testing.',
    descriptionAr:
      'فحص شامل قبل موسم الصيف، تنظيف واستبدال فلاتر الهواء، معايرة تدفق الهواء، تشحيم المحركات وفحص استهلاك الأمبير.',
    image:
      'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80',
    badgeEn: 'Pre-Summer Tuning',
    badgeAr: 'جاهزية تامة للصيف',
    active: true,
    sortOrder: 6,
  },
];

export const initialGallery: HVACGalleryItem[] = [
  {
    id: 'gal-1',
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80',
    titleEn: 'VRF Outdoor Multi-Unit Maintenance',
    titleAr: 'صيانة وفحص أنظمة التبريد المتغير VRF',
    categoryEn: 'Commercial VRF',
    categoryAr: 'أنظمة تجارية',
    captionEn: 'Quarterly overhaul and compressor pressure balancing in Al Khobar Tower.',
    captionAr: 'صيانة دورية شاملة وموازنة ضغوط الكمبروسرات لبرج إداري في الخبر.',
    locationEn: 'Al Khobar',
    locationAr: 'الخبر',
    active: true,
  },
  {
    id: 'gal-2',
    image:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    titleEn: 'Deep Chemical Coil Decontamination',
    titleAr: 'الغسيل الكيميائي العميق لملفات المكثف',
    categoryEn: 'Deep Cleaning',
    categoryAr: 'غسيل كيميائي',
    captionEn: 'Removing sand and salt encrustation to boost cooling efficiency by 34%.',
    captionAr: 'إزالة الرواسب والأتربة وتحسين كفاءة التبريد وخفض استهلاك الطاقة بنسبة ٣٤٪.',
    locationEn: 'Dammam Corniche',
    locationAr: 'كورنيش الدمام',
    active: true,
  },
  {
    id: 'gal-3',
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
    titleEn: 'Rooftop Concealed Package Servicing',
    titleAr: 'صيانة وحدات الباكج السطحية المدمجة',
    categoryEn: 'Rooftop Package',
    categoryAr: 'وحدات سطحية',
    captionEn: 'Blower fan replacement and belt tensioning for residential compound.',
    captionAr: 'تبديل محركات الدفع وتعديل سيور المراوح لمجمع سكني راقٍ بالظهران.',
    locationEn: 'Dhahran Hills',
    locationAr: 'تلال الظهران',
    active: true,
  },
  {
    id: 'gal-4',
    image:
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80',
    titleEn: 'Electronic Nitrogen Leak Detection',
    titleAr: 'كشف تسريبات الغاز بالنيتروجين المضغوط',
    categoryEn: 'Diagnostics',
    categoryAr: 'كشف وفحص',
    captionEn: 'High-precision micro-leak repair on concealed copper lines.',
    captionAr: 'معالجة تسريب مجهري دقيق في خطوط النحاس المدفونة دون تكسير.',
    locationEn: 'Qatif',
    locationAr: 'القطيف',
    active: true,
  },
  {
    id: 'gal-5',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    titleEn: 'Air Duct Sanitization & Airflow Balancing',
    titleAr: 'تعقيم مجاري الهواء وموازنة التدفق',
    categoryEn: 'Air Quality',
    categoryAr: 'جودة الهواء',
    captionEn: 'UV sanitization and bacterial decontamination in private medical clinic.',
    captionAr: 'تعقيم بالأشعة فوق البنفسجية وتطهير شامل لمجاري الهواء لمركز طبي.',
    locationEn: 'Jubail Industrial',
    locationAr: 'الجبيل الصناعية',
    active: true,
  },
  {
    id: 'gal-6',
    image:
      'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1000&q=80',
    titleEn: 'Luxury Villa Multi-Split Overhaul',
    titleAr: 'صيانة وتجديد منظومة تكييف قصر سكني',
    categoryEn: 'Residential Villa',
    categoryAr: 'فلل وقصور',
    captionEn: 'Full 14-unit servicing, condensate pump install, and smart thermostat sync.',
    captionAr: 'صيانة كاملة لـ ١٤ وحدة سبليت وكونسيلد وتركيب مضخات تصريف وثرموستات ذكي.',
    locationEn: 'Saihat',
    locationAr: 'سيهات',
    active: true,
  },
];

export const initialTestimonials: HVACTestimonial[] = [
  {
    id: 'rev-1',
    nameEn: 'Eng. Khalid Al-Otaibi',
    nameAr: 'م. خالد العتيبي',
    cityEn: 'Al Khobar (Al Hada)',
    cityAr: 'الخبر (حي الهدى)',
    rating: 5,
    quoteEn:
      'During the 49°C heatwave in July, our central VRF failed. The HARD emergency team arrived in 35 minutes, diagnosed a faulty inverter board, replaced it with a genuine part, and had the entire villa chilled before sunset. Exceptional professionalism.',
    quoteAr:
      'تعطل نظام التكييف المركزي بالفيلا خلال ذروة الصيف ودرجة الحرارة قاربت ٥٠ مئوية. وصل فريق طوارئ هارد خلال ٣٥ دقيقة وشخصوا عطل لوحة الإنفرتر واستبدلوها بقطعة أصلية وعاد التبريد بكفاءة مبهرة.',
    serviceEn: 'Emergency VRF Repair',
    serviceAr: 'صيانة طوارئ VRF',
    date: '2026-07-14',
    active: true,
  },
  {
    id: 'rev-2',
    nameEn: 'Fahad Al-Dossary',
    nameAr: 'فهد الدوسري',
    cityEn: 'Dammam (Al Faisaliyah)',
    cityAr: 'الدمام (الفيصلية)',
    rating: 5,
    quoteEn:
      'The chemical coil cleaning service completely transformed our ACs. The air smells fresh, the cooling is ice-cold even at 2 PM, and our monthly electric bill dropped by almost 28%. Highest recommendation.',
    quoteAr:
      'الغسيل الكيميائي العميق لـ ٨ مكيفات سبليت بالمنزل فرق معنا بشكل جذري؛ اختفت الروائح المكتومة وصار التبريد قوي جداً حتى في عز القايلة، وفاتورة الكهرباء نزلت بشكل ملحوظ.',
    serviceEn: 'Deep Chemical Washing',
    serviceAr: 'غسيل كيميائي شامل',
    date: '2026-06-28',
    active: true,
  },
  {
    id: 'rev-3',
    nameEn: 'Sara Al-Mansoori',
    nameAr: 'سارة المنصوري',
    cityEn: 'Dhahran',
    cityAr: 'الظهران',
    rating: 5,
    quoteEn:
      'We signed an Annual Maintenance Contract (AMC) for our commercial office building with HARD. Their scheduled quarterly visits, prompt technician logs, and zero downtime have made facility management effortless.',
    quoteAr:
      'وقعنا عقد صيانة سنوي (AMC) لمبنى مكاتبنا بالظهران. التزامهم بالمواعيد الدورية والتقارير الفنية الموثقة أراحنا تماماً من مفاجآت تعطل التكييف أثناء ساعات العمل.',
    serviceEn: 'Annual AMC Contract',
    serviceAr: 'عقد صيانة سنوي',
    date: '2026-05-19',
    active: true,
  },
  {
    id: 'rev-4',
    nameEn: 'Dr. Tariq Al-Ghamdi',
    nameAr: 'د. طارق الغامدي',
    cityEn: 'Qatif (Al Shati)',
    cityAr: 'القطيف (الشاطئ)',
    rating: 5,
    quoteEn:
      'Honest pricing with no guesswork. Other companies claimed my compressor was dead, but the HARD technician proved it was merely a blown capacitor and saved me 4,000 SAR. Genuine integrity.',
    quoteAr:
      'أمانة ومهنية نادرة. شركتان سابقتان أخبروني بضرورة تبديل الكمبروسر بتكلفة باهظة، بينما فني هارد فحص بدقة واكتشف أن المشكلة فقط في كابستر الكهرباء ووفر علي آلاف الريالات.',
    serviceEn: 'Electrical Diagnostic & Repair',
    serviceAr: 'فحص كهربائي وإصلاح',
    date: '2026-04-10',
    active: true,
  },
];

export const initialFaqs: HVACFaqItem[] = [
  {
    id: 'faq-1',
    questionEn: 'How often should AC units be chemically deep-cleaned in the Eastern Province?',
    questionAr: 'كم مرة ينصح بالغسيل الكيميائي العميق لمكيفات الهواء في المنطقة الشرقية؟',
    answerEn:
      'Due to high humidity and fine coastal dust in the Eastern Province (Dammam, Khobar, Qatif, Jubail), we recommend a deep chemical coil wash twice a year — once before the extreme summer peak (April/May) and once post-summer (October). Filters should be rinsed monthly.',
    answerAr:
      'نظراً لارتفاع الرطوبة والغبار الساحلي في مدن الشرقية (الخبر، الدمام، القطيف، الجبيل)، نوصي بالغسيل الكيميائي العميق مرتين سنوياً؛ الأولى قبل بداية ذروة الصيف (أبريل/مايو)، والثانية بعد انكسار الحرارة (أكتوبر)، مع غسل فلاتر الهواء بانتظام كل شهر.',
  },
  {
    id: 'faq-2',
    questionEn: 'What is the response time for 24/7 emergency AC breakdowns?',
    questionAr: 'ما هي المدة الزمنية لوصول فريق طوارئ التكييف في الحالات العاجلة؟',
    answerEn:
      'Our mobile service units are positioned across Dammam, Khobar, and Dhahran, with average on-site arrival within 30 to 45 minutes for urgent calls. Immediate phone triage and dispatch request review occur upon submission.',
    answerAr:
      'تتوزع سيارات الخدمة الميدانية السريعة في نقاط حيوية بالخبر والدمام والظهران، ويصل الفني لموقعك خلال ٣٠ إلى ٤٥ دقيقة في المتوسط للبلاغات الطارئة، مع توجيه هاتفي فوري ومراجعة طلب الإسناد عند الإرسال.',
  },
  {
    id: 'faq-3',
    questionEn: 'Do you use genuine certified refrigerants (R410A / R32)?',
    questionAr: 'هل تستخدمون فريون أصلي معتمد وتتحققون من عدم وجود تسريب؟',
    answerEn:
      'Yes, we exclusively use 100% pure American and European brand refrigerants (Honeywell, Chemours/DuPont, Arkema). We never charge refrigerant without performing a vacuum decay test and nitrogen leak check first, ensuring long-term compressor safety.',
    answerAr:
      'نعم بالتأكيد، نستخدم حصراً عبوات غاز تبريد أصلية ١٠٠٪ من كبرى الشركات العالمية. ولا نقوم بتعبئة الغاز مطلقاً قبل إجراء فحص تسريب بالنيتروجين واختبار الفاكيوم الإلكتروني لضمان سلامة الضاغط.',
  },
  {
    id: 'faq-4',
    questionEn: 'What is included in an Annual Maintenance Contract (AMC)?',
    questionAr: 'ما الذي تشمله عقود الصيانة السنوية (AMC) للفلل والمباني التجارية؟',
    answerEn:
      'Our AMC includes 4 quarterly scheduled comprehensive checkups, deep coil chemical wash, electrical amp balancing, drain unclogging, emergency dispatch priority with zero callout fees, and a 20% discount on all replacement spare parts.',
    answerAr:
      'تشمل عقود الصيانة السنوية ٤ زيارات دورية ربع سنوية، غسيل كيميائي للكويلات، فحص الأمبير والثرموستات، تنظيف مجاري التصريف، أولوية قصوى للطوارئ على مدار الساعة بدون رسوم معاينة، مع خصم ٢٠٪ على قطع الغيار.',
  },
  {
    id: 'faq-5',
    questionEn: 'What is the difference between regular water washing and chemical cleaning?',
    questionAr: 'ما الفرق بين الغسيل العادي بالماء والغسيل الكيميائي المتخصص؟',
    answerEn:
      'Water washing only removes surface-level dust on filters. Chemical washing utilizes specialized, coil-safe foaming agents that dissolve deep-seated oily films, salt encrustation, mold, and bacterial colonies trapped deep inside the aluminum fins, restoring factory airflow and cooling power.',
    answerAr:
      'الغسيل العادي بالماء ينظف الأتربة السطحية فقط، بينما الغسيل الكيميائي يستخدم محاليل رغوية خاصة آمنة تزيل الدهون، التكلسات الملحية، والبكتيريا المتغلغلة بين زعانف الألمنيوم الدقيقة، مما يعيد تدفق الهواء وقوة التبريد الأصلية للجهاز.',
  },
  {
    id: 'faq-6',
    questionEn: 'Do you offer written warranties on AC repairs and compressor replacements?',
    questionAr: 'هل تقدمون ضماناً خطياً معتمداً على أعمال الإصلاح وقطع الغيار؟',
    answerEn:
      'Yes, all repair operations come with an official warranty certificate: 3 to 6 months on standard repairs and up to 1 year on compressor and motor replacements with genuine parts.',
    answerAr:
      'نعم، نقدم شهادة ضمان رسمية معتمدة تمتد من ٣ إلى ٦ أشهر على أعمال الإصلاح العامة، وتصل إلى سنة كاملة على الكمبروسرات والمحركات المستبدلة بقطع أصلية.',
  },
  {
    id: 'faq-7',
    questionEn: 'Can HARD maintain centralized VRF, Chiller, and Rooftop Package units?',
    questionAr: 'هل تمتلك هارد القدرة على صيانة شيلرات التبريد المركزي ووحدات الباكج السطحية؟',
    answerEn:
      'Yes, our team includes certified electro-mechanical engineers equipped with industrial diagnostic manifolds, oil acid test kits, and thermal imaging cameras specifically for heavy commercial VRF, chilled water systems, and rooftop package units.',
    answerAr:
      'نعم، يضم فريقنا مهندسين كهروميكانيكيين متخصصين مجهزين بأحدث أجهزة قياس الضغط الصناعية، كاميرات الفحص الحراري، وأجهزة فحص حموضة الزيت لصيانة الشيلرات المركزية وأنظمة VRF والباكج للمباني الكبرى.',
  },
];

export const summerChecklist: HVACChecklistItem[] = [
  {
    id: 'sc-1',
    titleEn: 'Condenser Coil Chemical Pressure Wash',
    titleAr: 'الغسيل الكيميائي لملفات المكثف الخارجية',
    descEn: 'Removes baked-in sand and salt deposits to allow proper heat rejection in 48°C+ ambient temperatures.',
    descAr: 'إزالة الأتربة والتكلسات الملحية لضمان تشتيت الحرارة بفاعلية عند تجاوز درجات الحرارة ٤٨ مئوية.',
    importanceEn: 'Critical',
    importanceAr: 'بالغ الأهمية',
    iconName: 'Sparkles',
  },
  {
    id: 'sc-2',
    titleEn: 'Refrigerant Charge & Subcooling Verification',
    titleAr: 'معايرة ضغط غاز الفريون ودرجة التبريد الفائق',
    descEn: 'Ensures optimal refrigerant levels to prevent compressor overheating and maintain sub-zero coil temperatures.',
    descAr: 'التأكد من دقة كمية الغاز لحماية الضاغط من السخونة وضمان أعلى إنتاجية للبرودة.',
    importanceEn: 'High',
    importanceAr: 'أهمية عالية',
    iconName: 'Gauge',
  },
  {
    id: 'sc-3',
    titleEn: 'Drain Line & Condensate Pan Anti-Algae Treatment',
    titleAr: 'تطهير مجاري تصريف المياه لمنع الانسداد والتسريب',
    descEn: 'Clears accumulated slime and bacterial mold preventing internal ceiling leaks and musty odors.',
    descAr: 'تنظيف وتطهير حوض التصريف بالسوائل المعقمة لمنع طفح المياه وتلف الجبس والدهانات.',
    importanceEn: 'High',
    importanceAr: 'أهمية عالية',
    iconName: 'Droplets',
  },
  {
    id: 'sc-4',
    titleEn: 'Electrical Contactor & Capacitor Amp Testing',
    titleAr: 'فحص استهلاك الأمبير للكونتاكتور ومكثفات التشغيل',
    descEn: 'Weak capacitors cause sudden motor burnouts under heavy summer start loads; early replacement saves compressors.',
    descAr: 'فحص كفاءة الكابستر، حيث يتسبب ضعفه في احتراق محرك الكمبروسر عند ضغط التشغيل المستمر.',
    importanceEn: 'Preventative',
    importanceAr: 'فحص وقائي',
    iconName: 'Zap',
  },
];

export const winterChecklist: HVACChecklistItem[] = [
  {
    id: 'wc-1',
    titleEn: 'Heating Cycle & Reversing Valve Operational Check',
    titleAr: 'فحص دورة التدفئة وصمام العكس الرباعي',
    descEn: 'Tests heat mode activation, heating elements, and safety cutouts before cold desert nights.',
    descAr: 'التأكد من سلاسة تحويل الصمام لدورة التدفئة وسلامة الحساسات قبل حلول ليالي الشتاء الباردة.',
    importanceEn: 'Seasonal',
    importanceAr: 'موسمي',
    iconName: 'Flame',
  },
  {
    id: 'wc-2',
    titleEn: 'Deep Duct Cleaning & HEPA Filter Upgrades',
    titleAr: 'تعقيم مجاري الهواء واستبدال الفلاتر عالية الكفاءة',
    descEn: 'Off-peak season is the ideal window to sanitize ductwork and replace pleated allergen filters.',
    descAr: 'فترة الشتاء هي التوقيت المثالي لتعقيم قنوات الهواء وتغيير الفلاتر للتخلص من مسببات الحساسية.',
    importanceEn: 'Air Quality',
    importanceAr: 'جودة الهواء',
    iconName: 'Wind',
  },
  {
    id: 'wc-3',
    titleEn: 'Outdoor Unit Protective De-scaling & Cover Service',
    titleAr: 'معالجة الهيكل الخارجي ضد الصدأ وتأثير الرطوبة',
    descEn: 'Applying anti-corrosion protective coatings to outdoor chassis exposed to coastal sea breezes.',
    descAr: 'رش طبقة حماية عازلة لمنع تأكل الصاج الخارجي بفعل الرطوبة والرياح الساحلية المحملة بالأملاح.',
    importanceEn: 'Protection',
    importanceAr: 'حماية وتمديد عمر',
    iconName: 'Shield',
  },
  {
    id: 'wc-4',
    titleEn: 'Smart Thermostat Programming & Energy Calibration',
    titleAr: 'إعادة برمجة الثرموستات الذكي وتعديل جداول التشغيل',
    descEn: 'Configures energy-saving temperature setbacks, fan schedules, and humidity control sensors.',
    descAr: 'ضبط إعدادات التوفير الذكية، وحساسات الرطوبة النسبية لتقليل استهلاك الطاقة الشتوي.',
    importanceEn: 'Efficiency',
    importanceAr: 'كفاءة طاقة',
    iconName: 'Cpu',
  },
];

export const initialSampleLeads: HVACLead[] = [
  {
    id: 'lead-1',
    referenceNumber: 'HVAC-2026-9812',
    clientName: 'Abdullah Al-Dossary',
    phoneNumber: '+966501234567',
    email: 'a.dossary@gmail.com',
    city: 'Al Khobar',
    service: 'Deep Chemical Washing',
    notes: '6 Split AC units in residential villa needing full chemical wash before summer.',
    source: 'hvac',
    createdAt: '2026-08-20T10:15:00.000Z',
    status: 'new',
    preferredDate: '2026-08-25',
    isUrgent: false,
    areaSqM: 180,
    estimatedSavingsSAR: 1450,
  },
  {
    id: 'lead-2',
    referenceNumber: 'HVAC-2026-9813',
    clientName: 'Faisal Al-Shehri',
    phoneNumber: '+966559876543',
    email: 'faisal.shehri@corp.sa',
    city: 'Dammam',
    service: 'AC Repair & Rapid Troubleshooting',
    notes: 'Rooftop package unit stopped cooling in server room. Emergency same-day required.',
    source: 'hvac',
    createdAt: '2026-08-21T14:30:00.000Z',
    status: 'contacted',
    preferredDate: '2026-08-21',
    isUrgent: true,
  },
  {
    id: 'lead-3',
    referenceNumber: 'HVAC-2026-9814',
    clientName: 'Noura Al-Hajri',
    phoneNumber: '+966543210987',
    email: 'noura.hajri@hotmail.com',
    city: 'Dhahran',
    service: 'Annual Maintenance Contracts (AMC)',
    notes: 'Requesting quote for full villa quarterly AMC contract (12 units total).',
    source: 'hvac',
    createdAt: '2026-08-22T09:00:00.000Z',
    status: 'scheduled',
    preferredDate: '2026-08-26',
    isUrgent: false,
  },
];
