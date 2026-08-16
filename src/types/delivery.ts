export interface FeatureModule {
  id: string;
  name: string;
  category: 'core' | 'mobile' | 'security' | 'payment' | 'storage' | 'extra';
  description?: string;
  isEnabled: boolean; // Managed by Admin (if disabled, removed from document & progress bar)
  isCompleted: boolean; // Checked off by Admin when built
  additionalCost?: number;
  completedAt?: string;
}

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  phase: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customRequestId?: string;
  platformTitle: string;
  teacherName: string;
  subject: string;
  targetAudience?: string;
  requirements?: string;
  amount: string | number;
  isNegotiable: boolean;
  featuresIncluded?: string[];
  featuresModules?: FeatureModule[];
  milestones?: MilestoneItem[];
  domainUrl?: string;
  adminPortalUrl?: string;
  appDownloadUrl?: string;
  accessCredentials?: string;
  deliveryDays?: string;
  validUntil?: string;
  adminNotes?: string;
  status: 'issued' | 'accepted' | 'building' | 'delivered' | 'paid' | 'cancelled';
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  customer?: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
    governorate?: string;
    region?: string;
  };
}

export const DEFAULT_PLATFORM_FEATURES: FeatureModule[] = [
  {
    id: 'domain_hosting',
    name: 'حجز دومين خاص باسم المعلم (e.g. yourname.com) وسيرفر سحابي سنة كاملة',
    category: 'core',
    description: 'نطاق رسمي مخصص فائق السرعة مع شهادة SSL مجانية',
    isEnabled: true,
    isCompleted: false
  },
  {
    id: 'web_portal',
    name: 'منصة ويب متكاملة للطلاب ولإدارة المحتوى والمذكرات والامتحانات',
    category: 'core',
    description: 'واجهة عصرية بتصميم فاخر تدعم جميع الأجهزة الذكية',
    isEnabled: true,
    isCompleted: false
  },
  {
    id: 'video_security',
    name: 'نظام حماية الفيديوهات ضد التصوير وسرقة المحتوى (Dynamic Watermarking)',
    category: 'security',
    description: 'طباعة بيانات الطالب المتحركة على الشاشة ومنع برامج التسجيل والـ Screen Recording',
    isEnabled: true,
    isCompleted: false
  },
  {
    id: 'payment_gateway',
    name: 'بوابات الدفع الإلكتروني المباشر (فودافون كاش، إنستاباي، فيزا، بطاقات بنكية)',
    category: 'payment',
    description: 'استلام مستحقات الطلاب وشحن الأكواد وتفعيل الكورسات آلياً',
    isEnabled: true,
    isCompleted: false
  },
  {
    id: 'mobile_app',
    name: 'تطبيق هاتف ذكي مخصص (Android APK & iOS Web-App)',
    category: 'mobile',
    description: 'تطبيق للموبايل باسم وصورة المعلم على متجر التطبيقات مع إشعارات Push لحظية',
    isEnabled: true, // Admin can disable or lock/unlock with extra cost
    isCompleted: false,
    additionalCost: 1500
  },
  {
    id: 'admin_dashboard',
    name: 'لوحة تحكم إدارية ذكية وتقارير فورية لأولياء الأمور ومتابعة غياب وحضور الطلاب',
    category: 'core',
    description: 'متابعة شاملة لدرجات الامتحانات، نسب المشاهدة، وإرسال رسائل SMS وواتساب',
    isEnabled: true,
    isCompleted: false
  },
  {
    id: 'support_warranty',
    name: 'دعم فني مخصص وضمان استقرار ونسخ احتياطي يومي مجاناً',
    category: 'extra',
    description: 'فريق صيانة وتحديثات مستمرة طوال فترة الاشتراك',
    isEnabled: true,
    isCompleted: false
  }
];

export const DEFAULT_PLATFORM_MILESTONES: MilestoneItem[] = [
  {
    id: 'm1_specs',
    title: 'اعتماد المواصفات والوثيقة الرسمية',
    description: 'مراجعة متطلبات المعلم والمادة وتأكيد حجز النظام',
    phase: 1,
    isCompleted: true
  },
  {
    id: 'm2_domain',
    title: 'حجز النطاق الخاص وإعداد السيرفر السحابي',
    description: 'ربط دومين المعلم وتثبيت شهادات الأمان السحابية SSL',
    phase: 2,
    isCompleted: false
  },
  {
    id: 'm3_branding',
    title: 'رفع هوية وشعار المعلم وتخصيص الواجهات',
    description: 'تطبيق الألوان وتجهيز أقسام المراحل التعليمية والكورسات',
    phase: 3,
    isCompleted: false
  },
  {
    id: 'm4_security_mobile',
    title: 'تفعيل نظام حماية الفيديوهات وبناء تطبيق الهاتف',
    description: 'دمج العلامة المائية الذكية وبناء حزم الأندرويد وبوابات الدفع',
    phase: 4,
    isCompleted: false
  },
  {
    id: 'm5_handover',
    title: 'التسليم النهائي، تسليم لوحة الإدارة والتدريب',
    description: 'إطلاق المنصة الحية للطلاب وتسليم بيانات الدخول الخاصة بالمعلم',
    phase: 5,
    isCompleted: false
  }
];

/**
 * Calculates smart progress percentage based ONLY on enabled features and milestones
 */
export function calculateProjectProgress(
  milestones?: MilestoneItem[],
  featuresModules?: FeatureModule[]
): {
  percentage: number;
  completedCount: number;
  totalActiveCount: number;
  milestonesProgress: number;
  featuresProgress: number;
} {
  const activeMilestones = milestones && milestones.length > 0 ? milestones : DEFAULT_PLATFORM_MILESTONES;
  const activeFeatures = (featuresModules && featuresModules.length > 0 ? featuresModules : DEFAULT_PLATFORM_FEATURES).filter(f => f.isEnabled);

  const completedMilestones = activeMilestones.filter(m => m.isCompleted).length;
  const totalMilestones = activeMilestones.length;

  const completedFeatures = activeFeatures.filter(f => f.isCompleted).length;
  const totalFeatures = activeFeatures.length;

  const milestonesPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const featuresPct = totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0;

  // Weighted 50% milestones + 50% features
  const overallPercentage = Math.round((milestonesPct * 0.5) + (featuresPct * 0.5));

  return {
    percentage: Math.min(100, overallPercentage),
    completedCount: completedMilestones + completedFeatures,
    totalActiveCount: totalMilestones + totalFeatures,
    milestonesProgress: milestonesPct,
    featuresProgress: featuresPct
  };
}
