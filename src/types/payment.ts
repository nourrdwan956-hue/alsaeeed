export interface PaymentSettingsData {
  id?: string;
  primaryWalletNumber: string; // e.g. "01151157100"
  walletLabel: string; // e.g. "فودافون كاش / إتصالات كاش / أورانج كاش / إنستاباي"
  secondaryWalletNumber?: string | null;
  bankAccountDetails?: string | null;
  isWalletEnabled: boolean;
  isInstapayEnabled: boolean;
  isCashMeetingEnabled: boolean;
  isCreditCardGatewayEnabled: boolean;
  creditCardGatewayNotice: string;
  inPersonLocationsNotice: string;
  cancellationPenaltyPercent: number;
  penaltyWarningClause: string;
  updatedAt?: string;
}

export interface InPersonMeetingData {
  id: string;
  meetingNumber: string;
  invoiceId?: string | null;
  customerId: string;
  customerName: string;
  customerPhone: string;
  governorate: 'القاهرة' | 'الإسكندرية' | string;
  region: string;
  specificAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  employeeName: string;
  employeePhone: string;
  employeeTitle: string;
  amountToCollect: string;
  verificationCode: string;
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled';
  penaltyWarningAcknowledged: boolean;
  customerNotes?: string | null;
  adminNotes?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export const EGYPT_SUPPORTED_CITIES = [
  {
    name: 'القاهرة',
    regions: [
      'مدينة نصر (Nasr City)',
      'التجمع الخامس والقاهرة الجديدة (New Cairo)',
      'المعادي (Maadi)',
      'الدقي والمهندسين (Dokki & Mohandessin)',
      'مصر الجديدة (Heliopolis)',
      'وسط البلد والزمالك (Downtown & Zamalek)',
      'مدينة 6 أكتوبر والشيخ زايد (6th of October)',
      'شبرا وروض الفرج (Shubra)',
      'المقطم والهضبة الوسطى (Mokattam)',
      'حلوان والمعصرة (Helwan)'
    ]
  },
  {
    name: 'الإسكندرية',
    regions: [
      'سموحة وسيدي جابر (Smouha & Sidi Gaber)',
      'لوران وجليم وزيزينيا (Laurent & Glim)',
      'محرم بك والشاطبي (Moharam Bek & Chatby)',
      'ميامي وسيدي بشر (Miami & Sidi Bishr)',
      'محطة الرمل والمنشية (Raml Station & Mansheya)',
      'العجمي والهانوفيل (Agami & Hanoville)',
      'العصافرة والمندرة (Asafra & Mandara)',
      'كفر عبده ورشدي (Kafr Abdo & Roushdy)'
    ]
  }
];
