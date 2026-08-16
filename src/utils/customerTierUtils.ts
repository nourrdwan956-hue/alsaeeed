export interface TierInfo {
  code: string;
  badge: string;
  title: string;
  subtitle: string;
  discountPercent: number;
  discountDescription: string;
  perks: string[];
  colorClass: string;
  borderClass: string;
  bgGradient: string;
  iconName: string;
  severity: 'vip' | 'excellent' | 'good' | 'neutral' | 'warning' | 'unrated';
}

export const TIER_DEFINITIONS: Record<string, TierInfo> = {
  UNRATED: {
    code: 'UNRATED',
    badge: 'جديد ⚡',
    title: 'عميل جديد - قيد التقييم الرسمي',
    subtitle: 'سيتم إعلان التصنيف بين الإدارة والعميل بعد إتمام أول عملية شراء',
    discountPercent: 0,
    discountDescription: 'سيتم تحديد وتفعيل التصنيف والامتيازات الخاصة بك فور توثيق أول عملية شراء بنجاح.',
    perks: [
      'استجابة فورية واستشارات تقنية سرية',
      'إمكانية حجز المعاينة والمقابلة الميدانية بالقاهرة والإسكندرية',
      'تحديد تصنيف الامتيازات فور إتمام أول طلب منصة'
    ],
    colorClass: 'bg-slate-800 text-amber-300 border-amber-500/40',
    borderClass: 'border-amber-500/30',
    bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
    iconName: 'Sparkles',
    severity: 'unrated'
  },
  A_PLUS_PLUS: {
    code: 'A_PLUS_PLUS',
    badge: 'A++',
    title: 'عميل استثنائي VIP (A++)',
    subtitle: 'الدرجة السيادية العليا - أقصى امتيارات وتسهيلات خاصة',
    discountPercent: 50,
    discountDescription: 'مؤهل فوراً لخصم يصل لـ 50% على المنصة الثانية دون أي تردد أو شك مع الإدارة.',
    perks: [
      'خصم 50% مؤكد فوراً عند طلب المنصة الثانية بلا تردد',
      'أولوية قصوى والتسليم السريع خلال 24-48 ساعة عمل',
      'دعم فني وتحديثات مخصصة مجانية مدى الحياة',
      'مقابلات ميدانية مجانية دون أي مصاريف حجز'
    ],
    colorClass: 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/30',
    borderClass: 'border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.25)]',
    bgGradient: 'from-slate-950 via-amber-950/40 to-slate-950',
    iconName: 'Crown',
    severity: 'vip'
  },
  A_PLUS: {
    code: 'A_PLUS',
    badge: 'A+',
    title: 'عميل مميز جداً (A+)',
    subtitle: 'درجة النخبة المعتمدة - خصومات وأولويات عالية',
    discountPercent: 30,
    discountDescription: 'خصم 30% على المنصة الثانية مع أولوية تنفيذ فائقة.',
    perks: [
      'خصم 30% على المنصة الثانية',
      'أولوية تنفيذ فائقة وتسليم خلال 3 أيام',
      'دعم فني استثنائي وتدريب شامل لفرق العمل'
    ],
    colorClass: 'bg-amber-400 text-slate-950 font-black',
    borderClass: 'border-amber-400/80',
    bgGradient: 'from-slate-950 via-amber-950/20 to-slate-950',
    iconName: 'Crown',
    severity: 'vip'
  },
  A: {
    code: 'A',
    badge: 'A',
    title: 'عميل ممتاز (A)',
    subtitle: 'درجة التميز والالتزام التام',
    discountPercent: 20,
    discountDescription: 'خصم 20% على أي منصة ثانية.',
    perks: [
      'خصم 20% على المشروع القادم',
      'تسهيلات سداد وتقسيط مرنة',
      'دعم فني وتحديثات مجانية لمدة عام'
    ],
    colorClass: 'bg-emerald-500 text-white font-black',
    borderClass: 'border-emerald-500/80',
    bgGradient: 'from-slate-950 via-emerald-950/20 to-slate-950',
    iconName: 'Award',
    severity: 'excellent'
  },
  B_PLUS_PLUS: {
    code: 'B_PLUS_PLUS',
    badge: 'B++',
    title: 'عميل جيد جداً مرتفع (B++)',
    subtitle: 'التزام عالي ومرونة في التعامل',
    discountPercent: 15,
    discountDescription: 'خصم 15% على المنصة القادمة.',
    perks: [
      'خصم 15% على المنصات أو التطويرات التالية',
      'مرونة جودة في جدول المقابلات الميدانية'
    ],
    colorClass: 'bg-teal-500 text-slate-950 font-bold',
    borderClass: 'border-teal-500/80',
    bgGradient: 'from-slate-950 via-slate-900 to-teal-950/20',
    iconName: 'CheckCircle2',
    severity: 'good'
  },
  B_PLUS: {
    code: 'B_PLUS',
    badge: 'B+',
    title: 'عميل جيد جداً (B+)',
    subtitle: 'علاقة مستقرة والتزام متوازن',
    discountPercent: 10,
    discountDescription: 'خصم 10% على التطويرات والخدمات.',
    perks: [
      'خصم 10% على الخدمات والمنصات التالية',
      'تسليم في المواعيد المحددة مع دعم كامل'
    ],
    colorClass: 'bg-sky-500 text-white font-bold',
    borderClass: 'border-sky-500/80',
    bgGradient: 'from-slate-950 via-slate-900 to-sky-950/20',
    iconName: 'CheckCircle2',
    severity: 'good'
  },
  B: {
    code: 'B',
    badge: 'B',
    title: 'عميل جيد (B)',
    subtitle: 'الشروط القياسية المستقرة',
    discountPercent: 5,
    discountDescription: 'خصم 5% تشجيعي على المنصات التالية.',
    perks: [
      'تطبيق الشروط القياسية مع خصم 5%',
      'متابعة حية مستمرة حتى التسليم'
    ],
    colorClass: 'bg-blue-600 text-white font-bold',
    borderClass: 'border-blue-600/80',
    bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
    iconName: 'Check',
    severity: 'good'
  },
  C_PLUS: {
    code: 'C_PLUS',
    badge: 'C+',
    title: 'عميل متوسط (C+)',
    subtitle: 'علاقة عمل عادية مع الالتزام بالمواعيد',
    discountPercent: 0,
    discountDescription: 'الأسعار الرسمية والشروط القياسية.',
    perks: [
      'تطبيق الشروط والأسعار الرسمية المعتمدة'
    ],
    colorClass: 'bg-slate-700 text-slate-200 font-bold',
    borderClass: 'border-slate-700',
    bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
    iconName: 'Shield',
    severity: 'neutral'
  },
  C: {
    code: 'C',
    badge: 'C',
    title: 'عميل عادي (C)',
    subtitle: 'الشروط المعتمدة القياسية',
    discountPercent: 0,
    discountDescription: 'الأسعار القياسية المعتمدة.',
    perks: [
      'الالتزام بالمواعيد والتحصيل المعتمد'
    ],
    colorClass: 'bg-slate-800 text-slate-300 font-bold',
    borderClass: 'border-slate-800',
    bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
    iconName: 'Shield',
    severity: 'neutral'
  },
  D_MINUS: {
    code: 'D_MINUS',
    badge: 'D-',
    title: 'عميل تحت المراجعة (D-)',
    subtitle: 'تأخيرات سابقة أو تراجع في الجدية',
    discountPercent: 0,
    discountDescription: 'لا توجد خصومات مع اشتراط الدفع الكامل مقدماً.',
    perks: [
      'اشتراط سداد الفواتير كاملة قبل بدء التنفيذ',
      'التزام مشدد بالمواعيد المحددة'
    ],
    colorClass: 'bg-orange-500 text-slate-950 font-bold',
    borderClass: 'border-orange-500/80',
    bgGradient: 'from-slate-950 via-orange-950/20 to-slate-950',
    iconName: 'AlertCircle',
    severity: 'warning'
  },
  D_MINUS_MINUS: {
    code: 'D_MINUS_MINUS',
    badge: 'D--',
    title: 'عميل ضعيف الالتزام (D--)',
    subtitle: 'تنبيه انضباطي بسبب إلغاءات أو تأخيرات غير مبررة',
    discountPercent: 0,
    discountDescription: 'تطبيق شرط الـ 20% والسداد المسبق دون استثناء.',
    perks: [
      'السداد الفوري الكامل المسبق',
      'تطبيق شرط الجدية 20% عند الإلغاء بصرامة'
    ],
    colorClass: 'bg-rose-500 text-white font-bold',
    borderClass: 'border-rose-500/80',
    bgGradient: 'from-slate-950 via-rose-950/30 to-slate-950',
    iconName: 'AlertTriangle',
    severity: 'warning'
  },
  F: {
    code: 'F',
    badge: 'F',
    title: 'عميل غير جاد / محظور (F)',
    subtitle: 'تخلف متكرر أو طلبات زنيقة/إلغاءات',
    discountPercent: 0,
    discountDescription: 'محظور من العروض والتسهيلات.',
    perks: [
      'تطبيق شرط الانضباط الصارم 20% حظر الإلغاء',
      'التحصيل المالي الكامل المباشر قبل أي معالجة'
    ],
    colorClass: 'bg-red-700 text-white font-black',
    borderClass: 'border-red-600',
    bgGradient: 'from-slate-950 via-red-950/40 to-slate-950',
    iconName: 'XCircle',
    severity: 'warning'
  }
};

export function getTierInfo(code?: string): TierInfo {
  if (!code || !TIER_DEFINITIONS[code]) {
    return TIER_DEFINITIONS.UNRATED;
  }
  return TIER_DEFINITIONS[code];
}

export const TIER_ORDER = [
  'A_PLUS_PLUS',
  'A_PLUS',
  'A',
  'B_PLUS_PLUS',
  'B_PLUS',
  'B',
  'C_PLUS',
  'C',
  'D_MINUS',
  'D_MINUS_MINUS',
  'F',
  'UNRATED'
];
