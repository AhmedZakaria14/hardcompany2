import { Language } from './types';

export interface BilingualEntry {
  en: string;
  ar: string;
}

export function pick(entry: BilingualEntry | undefined, lang: Language): string {
  if (!entry) return '';
  return entry[lang] || entry.en || '';
}

export const T = {
  emergencyBar: {
    badge: {
      en: '24/7 Emergency Response',
      ar: 'طوارئ واستجابة على مدار ٢٤/٧',
    },
    coverage: {
      en: 'Rapid technician dispatch across Eastern Province & Riyadh',
      ar: 'مباشرة ميدانية سريعة في المنطقة الشرقية والرياض',
    },
    callNow: {
      en: 'Call 24/7: +966 55 064 1000',
      ar: 'اتصل للطوارئ: 0550641000',
    },
    phoneNumber: '+966 55 064 1000',
    phoneDisplay: '+966 55 064 1000',
  },
  brand: {
    wordHard: 'HARD',
    suffix: 'HVAC Maintenance',
    portalTitle: {
      en: 'Corporate Group Portal',
      ar: 'بوابة المجموعة',
    },
    constructionTitle: {
      en: 'Construction Division',
      ar: 'قطاع الإنشاءات',
    },
    realEstateTitle: {
      en: 'Real Estate Division',
      ar: 'قطاع العقارات',
    },
  },
  nav: {
    services: {
      en: 'Services',
      ar: 'خدماتنا',
    },
    whyUs: {
      en: 'Why Choose Us',
      ar: 'لماذا هارد؟',
    },
    work: {
      en: 'Our Work',
      ar: 'معرض الأعمال',
    },
    calculator: {
      en: 'Efficiency Calc',
      ar: 'حاسبة الكفاءة',
    },
    checklist: {
      en: 'Maintenance Guide',
      ar: 'دليل الصيانة',
    },
    reviews: {
      en: 'Reviews',
      ar: 'آراء العملاء',
    },
    faq: {
      en: 'FAQ',
      ar: 'الأسئلة الشائعة',
    },
    contact: {
      en: 'Contact Us',
      ar: 'اتصل بنا',
    },
    callPill: {
      en: 'Call 24/7',
      ar: 'اتصال 24/7',
    },
    bookServiceBtn: {
      en: 'Book Service Now',
      ar: 'احجز موعد صيانة',
    },
    portalBack: {
      en: 'Group Portal',
      ar: 'بوابة هارد',
    },
    adminPanel: {
      en: 'Admin CMS',
      ar: 'لوحة التحكم',
    },
  },
  hero: {
    eyebrow: {
      en: 'Heating · Cooling · Ventilation',
      ar: 'التبريد · التدفئة · التهوية المركزية',
    },
    headline: {
      en: 'Precision AC Maintenance & Deep Cleaning for Lasting Cooling in Saudi Climate',
      ar: 'صيانة وغسيل أجهزة التكييف والتبريد بأعلى معايير الدقة والاحترافية',
    },
    subheadline: {
      en: 'Certified HVAC engineers delivering deep coil chemical cleaning, rapid troubleshooting, duct sanitization, and preventative maintenance contracts across the Eastern Province and Riyadh.',
      ar: 'كوادر هندسية وفنية متخصصة تقدم غسيل كيميائي شامل للكويلات، صيانة الأعطال المستعصية، وتعقيم مجاري الهواء مع عقود صيانة سنوية موثوقة في المنطقة الشرقية والرياض.',
    },
    badge1: {
      en: 'SBC & SASO Compliant',
      ar: 'معتمد وفق الكود السعودي والمواصفات',
    },
    badge2: {
      en: '24/7 Emergency Dispatch',
      ar: 'مباشرة طوارئ ٢٤ ساعة',
    },
    badge3: {
      en: 'Genuine Spare Parts Guarantee',
      ar: 'ضمان قطع الغيار الأصلية',
    },
  },
  quoteForm: {
    title: {
      en: 'Get Instant Service Quote',
      ar: 'احصل على عرض سعر فوري',
    },
    subtitle: {
      en: 'Select your city & service for prompt scheduling',
      ar: 'حدد مدينتك ونوع الخدمة لبدء التنسيق الفوري',
    },
    cityLabel: {
      en: 'Select City',
      ar: 'اختر المدينة',
    },
    cityPlaceholder: {
      en: 'Select your location...',
      ar: 'اختر موقعك...',
    },
    otherCityLabel: {
      en: 'Specify Your City / District',
      ar: 'حدد مدينتك أو حيك السكني',
    },
    otherCityPlaceholder: {
      en: 'e.g. Al Hasa, Bqaiq, Industrial Area...',
      ar: 'مثال: الأحساء، بقيق، المدينة الصناعية...',
    },
    serviceLabel: {
      en: 'Service Type',
      ar: 'نوع الخدمة المطلوبة',
    },
    servicePlaceholder: {
      en: 'Select AC Service...',
      ar: 'اختر الخدمة...',
    },
    btnInstantQuote: {
      en: 'Get Instant Quote',
      ar: 'احصل على عرض السعر',
    },
    dialogTitle: {
      en: 'Complete Your Quote Request',
      ar: 'استكمال بيانات طلب عرض السعر',
    },
    dialogSubtitle: {
      en: 'Our dispatch engineer will review your system specs and confirm exact timing within 15 minutes.',
      ar: 'سيقوم مهندس التشغيل بمراجعة تفاصيل جهازك والتواصل لتأكيد الموعد خلال 15 دقيقة.',
    },
    fullNameLabel: {
      en: 'Full Name',
      ar: 'الاسم الكامل',
    },
    phoneLabel: {
      en: 'Phone Number (Saudi Mobile)',
      ar: 'رقم الجوال السعودي',
    },
    emailLabel: {
      en: 'Email Address (Optional)',
      ar: 'البريد الإلكتروني (اختياري)',
    },
    notesLabel: {
      en: 'Unit Details & Symptoms (e.g. 3 Split units, not cooling, water leak)',
      ar: 'تفاصيل الأجهزة والعطل (مثال: ٣ مكيفات سبليت، تبريد ضعيف، تسريب مياه)',
    },
    urgencyLabel: {
      en: 'Urgent Same-Day Emergency Dispatch',
      ar: 'طلب صيانة طارئة في نفس اليوم',
    },
    refLabel: {
      en: 'Reference ID Generated:',
      ar: 'الرقم المرجعي للطلب:',
    },
    submitBtn: {
      en: 'Send Request',
      ar: 'إرسال طلب الصيانة',
    },
    sendingBtn: {
      en: 'Sending...',
      ar: 'جاري الإرسال...',
    },
    whatsappHandoff: {
      en: 'Continue on WhatsApp',
      ar: 'المتابعة المباشرة عبر واتساب',
    },
    successMessage: {
      en: 'Your quote request has been recorded successfully. Reference:',
      ar: 'تم تسجيل طلبك بنجاح. الرقم المرجعي للطلب:',
    },
    closeBtn: {
      en: 'Close',
      ar: 'إغلاق',
    },
  },
  services: {
    eyebrow: {
      en: 'Our Specialized Capabilities',
      ar: 'حلولنا الشاملة',
    },
    title: {
      en: 'Complete HVAC Engineering & Maintenance Services',
      ar: 'خدمات هندسية متكاملة لصيانة وتشغيل أنظمة التكييف',
    },
    subtitle: {
      en: 'From residential split systems to heavy central VRF chillers, HARD delivers certified maintenance with precision diagnostic tools.',
      ar: 'من المكيفات الجدارية والسبليت للمنازل، إلى أنظمة الشيلرات والمكيفات المركزية والباكج للشركات والمجمعات.',
    },
  },
  whyUs: {
    eyebrow: {
      en: 'The HARD Advantage',
      ar: 'معايير التميز',
    },
    title: {
      en: 'Why Residential & Commercial Clients Trust HARD HVAC',
      ar: 'لماذا يختار عملاؤنا في الشرقية خدمات هارد؟',
    },
    subtitle: {
      en: 'Engineered for extreme Gulf summer loads with uncompromising craftsmanship, safety certifications, and transparent pricing.',
      ar: 'مصممة للعمل بكفاءة تامة تحت درجات حرارة الصيف القصوى، مع التزام صارم بالأمان والشفافية التامة.',
    },
    badges: [
      {
        id: 'licensed',
        title: {
          en: 'Licensed & Insured',
          ar: 'مرخص ومعتمد نظاميًا',
        },
        desc: {
          en: 'Fully registered Saudi commercial entity with comprehensive liability insurance and municipality compliance.',
          ar: 'كيان سعودي معتمد ومؤهل رسميًا مع تغطية تأمينية شاملة والتزام بأنظمة البلديات والدفاع المدني.',
        },
      },
      {
        id: 'certified',
        title: {
          en: 'Certified HVAC Technicians',
          ar: 'مهندسون وفنيون معتمدون',
        },
        desc: {
          en: 'Rigorous manufacturer-certified staff specialized in Daikin, Carrier, LG, Gree, York, and Trane systems.',
          ar: 'كوادر مؤهلة وخبراء معتمدون في أنظمة دايكن، كارير، إل جي، جري، يورك، وترين بمختلف السعات.',
        },
      },
      {
        id: 'pricing',
        title: {
          en: 'Upfront Transparent Pricing',
          ar: 'تسعير واضح وشفاف',
        },
        desc: {
          en: 'Detailed itemized quotes before any work begins — no hidden diagnosis fees or unexpected surcharges.',
          ar: 'عروض أسعار تفصيلية ومحددة قبل بدء أي عمل دون أي رسوم فحص مخفية أو تكاليف غير معلنة.',
        },
      },
      {
        id: 'dispatch',
        title: {
          en: '24/7 Rapid Emergency Response',
          ar: 'استجابة طوارئ على مدار الساعة',
        },
        desc: {
          en: 'Dedicated mobile service vans equipped with diagnostic pressure gauges, vacuum pumps, and genuine gas cylinders.',
          ar: 'أسطول متنقل مجهز بأحدث أجهزة كشف الأعطال ومضخات التفريغ واسطوانات الفريون الأصلية.',
        },
      },
      {
        id: 'warranty',
        title: {
          en: 'Comprehensive Service Warranty',
          ar: 'ضمان مكتوب على الصيانة والقطع',
        },
        desc: {
          en: 'All repairs, compressor replacements, and cleaning procedures are backed by a certified warranty certificate.',
          ar: 'نوفر شهادة ضمان رسمية على جميع أعمال الإصلاح وتبديل الكمبروسرات وتعبئة الغاز وقطع الغيار.',
        },
      },
    ],
  },
  gallery: {
    eyebrow: {
      en: 'Real Field Operations',
      ar: 'من الميدان',
    },
    title: {
      en: 'Featured Job Work & Maintenance Portfolio',
      ar: 'معرض أعمالنا ومشاريع الصيانة المنفذة',
    },
    subtitle: {
      en: 'Actual inspection, cleaning, coil decontamination, and VRF installation projects completed across the Kingdom.',
      ar: 'صور حقيقية لعمليات الغسيل الكيميائي، معالجة مجاري الهواء، وتركيب وتشغيل وحدات التكييف المركزية.',
    },
  },
  calculator: {
    eyebrow: {
      en: 'Energy Efficiency',
      ar: 'كفاءة الطاقة والتوفير',
    },
    title: {
      en: 'Calculate Energy Efficiency & Electricity Bill Savings',
      ar: 'احسب الوفر السنوي في فاتورة الكهرباء وكفاءة التبريد',
    },
    subtitle: {
      en: 'Estimate your annual electricity bill reductions and environmental impact when upgrading to high-SEER and VRF inverter cooling systems with regular maintenance.',
      ar: 'احسب حجم الوفر المالي التقديري في فاتورة الكهرباء السنوية والأثر البيئي عند تحديث أجهزة التكييف إلى أنظمة الانفرتر وVRF عالية الكفاءة.',
    },
    areaSliderLabel: {
      en: 'Air-Conditioned Area (Square Metres):',
      ar: 'المساحة المكيفة الإجمالية (متر مربع):',
    },
    tierLabel: {
      en: 'Upgraded Target Cooling System:',
      ar: 'نظام التكييف المستهدف للتحديث:',
    },
    baselineLabel: {
      en: 'Existing Baseline System Efficiency:',
      ar: 'كفاءة النظام الحالي (قبل التحديث):',
    },
    baselineLegacy: {
      en: 'Legacy Non-Inverter Split / Window (10.5 SEER)',
      ar: 'سبليت/شباك قديم بدون إنفرتر (SEER 10.5)',
    },
    baselineStandardCentral: {
      en: 'Standard Central Packaged Unit (11.5 SEER)',
      ar: 'سنترال/باكج تقليدي (SEER 11.5)',
    },
    baselineChiller: {
      en: 'Standard Reciprocating Chiller (10.0 SEER)',
      ar: 'شيلر تبادلي عادي (SEER 10.0)',
    },
    hoursLabel: {
      en: 'Average Daily Cooling Operating Hours:',
      ar: 'متوسط ساعات تشغيل التكييف اليومية:',
    },
    tariffLabel: {
      en: 'SEC Electricity Tariff Rate:',
      ar: 'تعرفة الكهرباء المطبقة (شركة الكهرباء):',
    },
    tariffResidential: {
      en: 'Residential ≤6,000 kWh (0.18 SAR/kWh)',
      ar: 'سكني - الشريحة الأولى (0.18 ريال / ك.و.س)',
    },
    tariffResidentialTier2: {
      en: 'Residential >6,000 kWh (0.30 SAR/kWh)',
      ar: 'سكني - الشريحة الثانية (0.30 ريال / ك.و.س)',
    },
    tariffCommercial: {
      en: 'Commercial Rate (0.20 SAR/kWh)',
      ar: 'تجاري (0.20 ريال / ك.و.س)',
    },
    tariffGovernment: {
      en: 'Government / Institutional Rate (0.26 SAR/kWh)',
      ar: 'حكومي / مؤسسي (0.26 ريال / ك.و.س)',
    },
    periodLabel: {
      en: 'Calculation Horizon:',
      ar: 'المدة الزمنية لحساب الوفر:',
    },
    period1Yr: {
      en: '1 Year (Annual)',
      ar: 'سنة واحدة (سنوي)',
    },
    period3Yr: {
      en: '3 Years (Cumulative)',
      ar: '3 سنوات (تراكمي)',
    },
    period5Yr: {
      en: '5 Years (Cumulative)',
      ar: '5 سنوات (تراكمي)',
    },
    tierSplitStandard: {
      en: 'Standard Split Upgrade (13.5 SEER)',
      ar: 'ترقية إلى سبليت معتمد (SEER 13.5)',
    },
    tierInverterHigh: {
      en: 'Inverter High-SEER Split (18.0 SEER)',
      ar: 'ترقية إلى سبليت إنفرتر ذكي (SEER 18.0)',
    },
    tierPackage: {
      en: 'High-Efficiency Rooftop Package (15.5 SEER)',
      ar: 'ترقية إلى باكج سطح عالي الكفاءة (SEER 15.5)',
    },
    tierVRF: {
      en: 'Smart VRF / Inverter Chiller (21.0+ SEER)',
      ar: 'ترقية إلى نظام VRF أو شيلر إنفرتر (SEER 21.0+)',
    },
    annualSavingsTitle: {
      en: 'Estimated Financial Savings',
      ar: 'الوفر المالي التقديري',
    },
    kwhSavedTitle: {
      en: 'Estimated Electrical Energy Saved',
      ar: 'طاقة الكهرباء الموفرة التقديرية',
    },
    efficiencyGainTitle: {
      en: 'Seasonal Efficiency Rating (SEER)',
      ar: 'معامل كفاءة الطاقة الموسمي (SEER)',
    },
    carbonOffsetTitle: {
      en: 'Estimated Grid CO₂ Reduction',
      ar: 'الخفض التقديري للانبعاثات الكربونية',
    },
    illustrativeTag: {
      en: 'Illustrative Technical Simulation (Unmeasured Model)',
      ar: 'محاكاة هندسية نموذجية (تقدير غير مقاس ميدانياً)',
    },
    assumptionsCardTitle: {
      en: 'Model Calculation Parameters & Visible Assumptions',
      ar: 'معايير وافتراضات النموذج الهندسي المكشوفة',
    },
    methodologyTitle: {
      en: 'Engineering Physics Formula & SEC Tariff Assumptions',
      ar: 'معادلة الفيزياء الهندسية وافتراضات التعرفة',
    },
    methodologyDesc: {
      en: 'Cooling Load = Area / 20 m² per Ton of Refrigeration (TR). Annual kWh = (Load × 12,000 BTU/h / SEER) × Operating Hours. Savings = (Baseline kWh − Upgraded kWh) × Selected Tariff.',
      ar: 'حمل التبريد = المساحة / 20 م² لكل طن تبريد. الاستهلاك السنوي = (الحمل × 12,000 / معامل SEER) × ساعات التشغيل. الوفر = (الاستهلاك الحالي − الاستهلاك الجديد) × التعرفة.',
    },
    measuredSavingsNotice: {
      en: 'Important: These figures represent illustrative unmeasured engineering model estimates. Actual measured field savings require baseline power metering (IPMVP Protocol) and weather-normalized data.',
      ar: 'تنبيه: هذه الأرقام تمثل محاكاة هندسية تقديرية غير مقاسة ميدانياً. يتطلب قياس الوفر الفعلي تركيب عدادات طاقة ومعايرة مناخية وفق بروتوكول القياس والتحقق IPMVP.',
    },
    disclaimer: {
      en: '*Estimates use standard SEC tariffs and nominal cooling hours. Actual savings vary by thermostat setpoints, building thermal envelope insulation, and ambient dry-bulb temperatures.',
      ar: '*الحسابات هندسية نموذجية تعتمد على التعرفة المختارة وساعات التشغيل. يختلف الوفر المالي الفعلي بحسب العزل الحراري وضبط التيرموستات ودرجات الحرارة المحيطة.',
    },
    bookUpgradeBtn: {
      en: 'Book Energy Efficiency Audit',
      ar: 'احجز فحص كفاءة الطاقة للأجهزة',
    },
  },
  checklist: {
    eyebrow: {
      en: 'Preventative Care',
      ar: 'العناية الوقائية',
    },
    title: {
      en: 'Seasonal HVAC Maintenance Checklist',
      ar: 'دليل الصيانة الدورية حسب المواسم',
    },
    subtitle: {
      en: 'Follow our certified engineers’ checklist to prevent sudden compressor burnouts and maintain crisp indoor air quality year-round.',
      ar: 'خطوات إرشادية معتمدة من مهندسينا لحماية الكمبروسر من التلف وضمان هواء نقي ونظيف على مدار العام.',
    },
    summerTab: {
      en: 'Summer Extreme Heat Preparation',
      ar: 'استعدادات ذروة الصيف الحار',
    },
    winterTab: {
      en: 'Winter Optimization & Off-Peak Care',
      ar: 'صيانة الشتاء والتشغيل الاقتصادي',
    },
  },
  reviews: {
    eyebrow: {
      en: 'Client Satisfaction',
      ar: 'ثقة عملائنا',
    },
    title: {
      en: 'What Our Clients Say in the Eastern Province',
      ar: 'آراء وتقييمات العملاء في المنطقة الشرقية',
    },
    subtitle: {
      en: 'Real feedback from homeowners, compound managers, and commercial business operators.',
      ar: 'تجارب حقيقية لملاك الفلل والقصور ومديري المجمعات والشركات في مدن الشرقية.',
    },
  },
  faq: {
    eyebrow: {
      en: 'Got Questions?',
      ar: 'الأسئلة المتكررة',
    },
    title: {
      en: 'Frequently Asked HVAC Maintenance Questions',
      ar: 'أبرز الأسئلة الشائعة حول صيانة وغسيل التكييف',
    },
    subtitle: {
      en: 'Clear answers on maintenance frequency, refrigerant leaks, warranties, and emergency turnaround.',
      ar: 'إجابات واضحة وموثوقة حول فترات الغسيل، تسريب الفريون، الضمانات، واستجابة الطوارئ.',
    },
  },
  contact: {
    eyebrow: {
      en: 'Get In Touch',
      ar: 'تواصل معنا',
    },
    title: {
      en: 'Book Your Service or Inquire About Maintenance Contracts',
      ar: 'احجز موعد الصيانة أو استفسر عن العقود السنوية',
    },
    subtitle: {
      en: 'Our engineering dispatch team is on standby to assist you immediately.',
      ar: 'فريق الاستقبال والدعم الفني مستعد لخدمتك وتوجيه أقرب فريق صيانة لموقعك.',
    },
    formName: {
      en: 'Your Name',
      ar: 'الاسم الكريم',
    },
    formPhone: {
      en: 'Mobile Number',
      ar: 'رقم الجوال',
    },
    formEmail: {
      en: 'Email Address',
      ar: 'البريد الإلكتروني',
    },
    formService: {
      en: 'Service Needed',
      ar: 'نوع الخدمة',
    },
    formMessage: {
      en: 'Message / Project Requirements',
      ar: 'تفاصيل الطلب والملاحظات',
    },
    formSubmit: {
      en: 'Send Maintenance Message',
      ar: 'إرسال الرسالة',
    },
    formSending: {
      en: 'Transmitting...',
      ar: 'جاري الإرسال...',
    },
    formSuccess: {
      en: 'Message dispatched to info@hardgp.com. We will contact you within minutes!',
      ar: 'تم إرسال رسالتك بنجاح إلى info@hardgp.com. سنتواصل معك خلال دقائق!',
    },
    addressTitle: {
      en: 'Physical Office Location',
      ar: 'موقع المقر الميداني والتشغيلي',
    },
    addressDesc: {
      en: 'King Fahd Road, Al Rakah Al Shamaliya District, Al Khobar 34224, Eastern Province, Kingdom of Saudi Arabia',
      ar: 'طريق الملك فهد، حي الراكة الشمالية، الخبر 34224، المنطقة الشرقية، المملكة العربية السعودية',
    },
    coverageTitle: {
      en: 'Field Service Coverage Area',
      ar: 'نطاق التغطية الميدانية',
    },
    coverageDesc: {
      en: 'On-site emergency maintenance & contract dispatch across Al Khobar, Dammam, Dhahran, Jubail, Qatif, and Riyadh.',
      ar: 'فرق الصيانة الميدانية والطوارئ تغطي: الخبر، الدمام، الظهران، الجبيل، القطيف، والرياض.',
    },
    verificationNotice: {
      en: 'GPS Destination Verified: 26.373784° N, 50.103001° E (Al Khobar). Exact Building/Unit # & National Address Code pending final municipal assignment.',
      ar: 'إحداثيات المقر موثقة: 26.373784° N, 50.103001° E (الخبر). رقم المبنى والرمز البريدي الوطني قيد الاعتماد البلدي النهائي.',
    },
    emailTitle: {
      en: 'Direct Email',
      ar: 'البريد الإلكتروني',
    },
    emailVal: 'info@hardgp.com',
    hoursTitle: {
      en: 'Working Hours',
      ar: 'ساعات العمل',
    },
    hoursRegular: {
      en: 'Sat–Thu: 7:00 AM – 9:00 PM',
      ar: 'السبت إلى الخميس: ٧:٠٠ ص – ٩:٠٠ م',
    },
    hoursFriday: {
      en: 'Friday: Emergency Service Only (24/7)',
      ar: 'الجمعة: خدمة الطوارئ الميدانية فقط (٢٤ ساعة)',
    },
    mapTitle: {
      en: 'HARD HVAC Regional Hub (Al Khobar - 26.373784, 50.103001)',
      ar: 'مقر هارد للتكييف (الخبر - الإحداثيات: 26.373784, 50.103001)',
    },
    getDirections: {
      en: 'Get Driving Directions',
      ar: 'اتجاهات القيادة المباشرة',
    },
  },
  emergencyBanner: {
    badge: {
      en: 'URGENT COOLING BREAKDOWN?',
      ar: 'هل توقف التبريد بشكل مفاجئ؟',
    },
    title: {
      en: 'Our 24/7 Emergency AC Rescue Vans Are Active in Your City',
      ar: 'فرق طوارئ التكييف المتنقلة من هارد جاهزة لمباشرة موقعك فوراً',
    },
    desc: {
      en: 'Immediate emergency response for residential villas, hospitals, server rooms, and commercial facilities.',
      ar: 'استجابة سريعة للفلل السكنية، الخوادم التقنية، المنشآت الطبية، والمطاعم والمكاتب التجارية.',
    },
    callBtn: {
      en: 'Call +966 55 064 1000',
      ar: 'اتصل الآن: 0550641000',
    },
    whatsappBtn: {
      en: 'WhatsApp Emergency Dispatch',
      ar: 'طوارئ واتساب الفورية',
    },
  },
  footer: {
    aboutText: {
      en: 'HARD HVAC Maintenance is a specialized division of HARD Group, delivering premier cooling, heating, ventilation, and air quality engineering across the Kingdom of Saudi Arabia.',
      ar: 'هارد لصيانة وتكييف الهواء هي الذراع التخصصي لمجموعة هارد، تقدم أرقى معايير التبريد والتهوية والتحكم المناخي الذكي في المملكة العربية السعودية.',
    },
    quickLinks: {
      en: 'Quick Navigation',
      ar: 'روابط سريعة',
    },
    servicesLink: {
      en: 'Services',
      ar: 'الخدمات',
    },
    galleryLink: {
      en: 'Work Portfolio',
      ar: 'معرض الأعمال',
    },
    calcLink: {
      en: 'Efficiency Calculator',
      ar: 'حاسبة الكفاءة',
    },
    contactLink: {
      en: 'Contact & Location',
      ar: 'الاتصال والموقع',
    },
    groupLinks: {
      en: 'HARD Group Divisions',
      ar: 'قطاعات مجموعة هارد',
    },
    corporatePortal: {
      en: 'Corporate Group Portal',
      ar: 'بوابة المجموعة القابضة',
    },
    constructionDiv: {
      en: 'HARD Construction & Contracting',
      ar: 'هارد للإنشاءات والمقاولات',
    },
    realEstateDiv: {
      en: 'HARD Real Estate & Brokerage',
      ar: 'هارد للعقارات والتسويق',
    },
    followUs: {
      en: 'Follow HARD Group',
      ar: 'تابع مجموعة هارد',
    },
    rights: {
      en: 'HARD HVAC Maintenance © 2026. All rights reserved.',
      ar: 'هارد لصيانة التكييف © ٢٠٢٦. جميع الحقوق محفوظة.',
    },
    slogan: {
      en: 'Engineered for the Kingdom’s Climate.',
      ar: 'هندسة متطورة مصممة لمناخ المملكة.',
    },
  },
  bookingModal: {
    title: {
      en: 'Request HVAC Maintenance & Inspection',
      ar: 'طلب موعد صيانة وفحص التكييف',
    },
    subtitle: {
      en: 'Select your requested service, preferred date, and time slot. Your request will be reviewed by dispatch to confirm technician slot availability.',
      ar: 'اختر الخدمة والموعد والوقت المفضل. سيقوم فريق العمليات بمراجعة الطلب وتأكيد توافر الفني المعتمد معك.',
    },
    serviceSelect: {
      en: 'Select Service Required',
      ar: 'اختر نوع الخدمة',
    },
    dateLabel: {
      en: 'Preferred Appointment Date',
      ar: 'التاريخ المفضل للزيارة',
    },
    timeSlotLabel: {
      en: 'Preferred Time Slot',
      ar: 'الفترة المفضلة',
    },
    slotMorning: {
      en: 'Morning (8:00 AM – 12:00 PM)',
      ar: 'صباحية (٨:٠٠ ص – ١٢:٠٠ م)',
    },
    slotAfternoon: {
      en: 'Afternoon (1:00 PM – 5:00 PM)',
      ar: 'ظهرية (١:٠٠ م – ٥:٠٠ م)',
    },
    slotEvening: {
      en: 'Evening (6:00 PM – 9:00 PM)',
      ar: 'مسائية (٦:٠٠ م – ٩:٠٠ م)',
    },
    slotEmergency: {
      en: 'Urgent Same-Day Emergency Request',
      ar: 'طلب طوارئ عاجلة في نفس اليوم',
    },
    clientName: {
      en: 'Client Name',
      ar: 'اسم العميل',
    },
    phone: {
      en: 'Phone Number',
      ar: 'رقم الجوال',
    },
    city: {
      en: 'City / District',
      ar: 'المدينة / الحي',
    },
    notes: {
      en: 'AC Units & Fault Notes',
      ar: 'ملاحظات الأعطال وعدد الأجهزة',
    },
    submitBtn: {
      en: 'Submit Booking Request',
      ar: 'إرسال طلب الحجز',
    },
    resultTitle: {
      en: 'Booking Request Received',
      ar: 'تم استلام طلب الحجز بنجاح',
    },
    resultStatusBadge: {
      en: 'Status: Pending Operations Confirmation',
      ar: 'حالة الطلب: بانتظار تأكيد فريق العمليات',
    },
    resultDesc: {
      en: 'Your booking request has been registered in our queue. Our operations supervisor will verify technician slot availability and contact you on your phone number to formally confirm your appointment.',
      ar: 'تم تسجيل طلب الحجز الخاص بك بنجاح. سيقوم مشرف العمليات بالتواصل معك هاتفياً لمراجعة جدول الفنيين وتأكيد الموعد رسمياً.',
    },
  },
  cms: {
    title: {
      en: 'HARD HVAC Maintenance CMS',
      ar: 'لوحة تحكم هارد للتكييف',
    },
    authTitle: {
      en: 'HVAC Management Portal Access',
      ar: 'بوابة إدارة عمليات التكييف',
    },
    pinPrompt: {
      en: 'Enter your 4-digit administrative PIN code (Default: 2026)',
      ar: 'أدخل رمز الأمان الإداري المكون من 4 أرقام (الافتراضي: 2026)',
    },
    unlockBtn: {
      en: 'Unlock Portal',
      ar: 'فتح لوحة التحكم',
    },
    instantUnlock: {
      en: 'Instant Access for Reviewers (PIN: 2026)',
      ar: 'دخول سريع للمراجعة (رمز: 2026)',
    },
    exitBtn: {
      en: 'Return to Website',
      ar: 'العودة للموقع الرئيسي',
    },
    tabLeads: {
      en: 'Inquiries & Leads',
      ar: 'الطلبات والاستفسارات',
    },
    tabServices: {
      en: 'Manage Services',
      ar: 'إدارة الخدمات',
    },
    tabGallery: {
      en: 'Work Gallery',
      ar: 'معرض الأعمال',
    },
    tabReviews: {
      en: 'Testimonials',
      ar: 'آراء العملاء',
    },
  },
  citiesList: [
    { id: 'dammam', en: 'Dammam', ar: 'الدمام' },
    { id: 'khobar', en: 'Al Khobar', ar: 'الخبر' },
    { id: 'dhahran', en: 'Dhahran', ar: 'الظهران' },
    { id: 'qatif', en: 'Qatif', ar: 'القطيف' },
    { id: 'saihat', en: 'Saihat', ar: 'سيهات' },
    { id: 'safwa', en: 'Safwa', ar: 'صفوى' },
    { id: 'tarout', en: 'Tarout Island', ar: 'جزيرة تاروت' },
    { id: 'jubail', en: 'Jubail Industrial & City', ar: 'الجبيل والجبيل الصناعية' },
    { id: 'rastanura', en: 'Ras Tanura', ar: 'رأس تنورة' },
    { id: 'abqaiq', en: 'Abqaiq (Buqayq)', ar: 'بقيق' },
    { id: 'other', en: 'Other City...', ar: 'مدينة أخرى...' },
  ],
};
