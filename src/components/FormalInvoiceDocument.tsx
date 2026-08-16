import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  Printer, 
  CheckCircle2, 
  CreditCard, 
  Calendar, 
  Clock, 
  Layers, 
  Lock, 
  Smartphone, 
  Globe, 
  Headphones, 
  FileText, 
  Check, 
  X,
  Building2,
  Phone,
  Mail,
  AlertCircle,
  MapPin,
  Copy,
  AlertTriangle,
  QrCode,
  BadgeAlert,
  Loader2
} from 'lucide-react';
import { InvoiceData, FeatureModule, DEFAULT_PLATFORM_FEATURES } from '../types/delivery';
import { PaymentSettingsData, InPersonMeetingData } from '../types/payment';
import InPersonMeetingBookingModal from './InPersonMeetingBookingModal';
import InPersonMeetingCard from './InPersonMeetingCard';
import { downloadElementAsPdf } from '../utils/pdfExport';

export type { InvoiceData };

interface FormalInvoiceDocumentProps {
  invoice: InvoiceData;
  isCustomerView?: boolean;
  onPayNow?: (invoice: InvoiceData) => void;
  onClose?: () => void;
}

export default function FormalInvoiceDocument({
  invoice,
  isCustomerView = false,
  onPayNow,
  onClose
}: FormalInvoiceDocumentProps) {
  const [paying, setPaying] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'meeting' | 'card' | 'bank'>('wallet');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(invoice.status === 'paid');
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const documentContainerRef = useRef<HTMLDivElement>(null);

  // Payment settings from server (wallet 01151157100 etc.)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsData>({
    primaryWalletNumber: '01151157100',
    walletLabel: 'فودافون كاش / إتصالات كاش / أورانج / إنستاباي',
    isWalletEnabled: true,
    isInstapayEnabled: true,
    isCashMeetingEnabled: true,
    isCreditCardGatewayEnabled: false,
    creditCardGatewayNotice: 'بوابات الدفع الإلكتروني المباشر (فيزا/ماستركارد) قيد الاعتماد والتعاقد البنكي حالياً - متاح الدفع الفوري عبر المحفظة أو المقابلة المباشرة',
    inPersonLocationsNotice: 'المقابلات المباشرة والدفع اليدوي مع مندوبنا المعتمد متاحة حصرياً في محافظتي (القاهرة والإسكندرية) بكافة مناطقهما.',
    cancellationPenaltyPercent: 20,
    penaltyWarningClause: 'تنبيه وإقرار صارم: في حال إلغاء طلب المنصة أو التخلف غير المبرر عن موعد المقابلة المعتمد، يتحمل العميل 20% مصاريف إدارية وحجز مواعيد (طلب غير جاد / طلب زائف) غير قابلة للتفاوض نهائياً.'
  });

  // In-person meeting state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<InPersonMeetingData | null>(null);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch('/api/payment-settings');
      const data = await res.json();
      if (data && data.primaryWalletNumber) {
        setPaymentSettings(data);
      }
    } catch (err) {
      console.error('Error fetching payment settings:', err);
    }
  };

  const handleCopyWallet = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!documentContainerRef.current || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await downloadElementAsPdf(documentContainerRef.current, {
        filename: `وثيقة_عقد_منصة_${invoice.platformTitle.replace(/\s+/g, '_')}_${invoice.invoiceNumber}.pdf`,
        scale: 2.5,
        orientation: 'portrait',
        format: 'a4',
        margin: 6,
        fitToOnePage: true
      });
    } catch (err) {
      console.error('Error downloading PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleExecutePayment = async () => {
    setIsProcessingPay(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: selectedMethod })
      });
      const data = await res.json();
      if (data.success) {
        setPaidSuccess(true);
        setShowPaymentOptions(false);
        if (onPayNow) onPayNow(invoice);
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setIsProcessingPay(false);
    }
  };

  // Dynamically resolve active/enabled features
  let displayFeatures: { name: string; isCompleted: boolean }[] = [];
  if (invoice.featuresModules && invoice.featuresModules.length > 0) {
    displayFeatures = invoice.featuresModules
      .filter((m: FeatureModule) => m.isEnabled !== false)
      .map(m => ({ name: m.name, isCompleted: m.isCompleted }));
  } else if (invoice.featuresIncluded && invoice.featuresIncluded.length > 0) {
    displayFeatures = invoice.featuresIncluded.map(name => ({ name, isCompleted: false }));
  } else {
    displayFeatures = DEFAULT_PLATFORM_FEATURES.filter(f => f.isEnabled).map(f => ({ name: f.name, isCompleted: f.isCompleted }));
  }

  const isPaid = paidSuccess || invoice.status === 'paid';

  return (
    <div className="bg-slate-900/80 backdrop-blur-md fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none max-h-[92vh] flex flex-col">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs md:text-sm font-bold font-tajawal text-slate-200">
              وثيقة عرض سعر وعقد رسمي معتمد • {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="تحميل الوثيقة الرسمية فوراً كملف PDF إلى جهازك"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري التصدير...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل PDF</span>
                </>
              )}
            </button>

            {/* Quick Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
              title="طباعة الوثيقة الرسمية عبر الطابعة"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">طباعة</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div 
          ref={documentContainerRef}
          id="formal-invoice-printable-container"
          className="p-6 md:p-10 overflow-y-auto space-y-8 print:p-0 print:space-y-6 text-right font-sans bg-white"
        >
          
          {/* 1. DOCUMENT HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b-2 border-slate-900">
            {/* Brand Logo & Authority */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 border-2 border-amber-400/60 flex items-center justify-center text-amber-400 shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-950 font-tajawal tracking-tight">
                  منصات السعيد للأنظمة التعليمية
                </h1>
                <p className="text-xs font-semibold text-amber-600">
                  AL-SAEED SMART EDUCATIONAL PLATFORMS
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  سجل تجاري وترخيص أنظمة سحابية معتمد
                </p>
              </div>
            </div>

            {/* Document Meta Tag */}
            <div className="sm:text-left text-right bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[200px]">
              <div className="flex items-center gap-1.5 sm:justify-end mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">رقم الوثيقة الرسمية:</span>
              </div>
              <div className="text-base font-black text-indigo-950 font-mono tracking-wider">
                {invoice.invoiceNumber}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 sm:justify-end">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>تاريخ التحرير: {new Date(invoice.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* 2. PARTY INFORMATION (CONTRACT PARTIES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Party 1: Provider */}
            <div className="bg-slate-900 text-white p-4.5 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-amber-400 block tracking-wider">الطرف الأول (الجهة المنفذة والمطورة):</span>
              <h3 className="font-bold text-sm text-white font-tajawal">مؤسسة منصات السعيد الذكية</h3>
              <p className="text-xs text-slate-300">قسم هندسة البرمجيات والمنصات التعليمية السحابية</p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>جمهورية مصر العربية</span>
                <span className="dir-ltr font-mono text-amber-400 font-bold">support@alsaeed.com</span>
              </div>
            </div>

            {/* Party 2: Client / Teacher */}
            <div className="bg-amber-500/10 border border-amber-300/60 p-4.5 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-amber-900 block tracking-wider">الطرف الثاني (العميل المستفيد):</span>
              <h3 className="font-bold text-sm text-slate-950 font-tajawal">
                {invoice.customer?.name || invoice.teacherName}
              </h3>
              <p className="text-xs text-slate-700 font-medium">
                معلم مادة: <span className="font-bold text-indigo-950">{invoice.subject}</span>
              </p>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-amber-200 flex items-center justify-between">
                <span>المحافظة: {invoice.customer?.governorate || 'جمهورية مصر العربية'}</span>
                <span className="dir-ltr font-mono font-bold text-slate-900">
                  {invoice.customer?.phone || invoice.customer?.whatsapp || invoice.customer?.email || ''}
                </span>
              </div>
            </div>

          </div>

          {/* 3. PLATFORM SPECIFICATIONS & CORE DETAILS */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              موضوع العقد والمنصة المطلوب تطويرها
            </h3>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-400 block">اسم المنصة المعتمد</span>
                <strong className="text-base font-black text-slate-950 font-tajawal">
                  {invoice.platformTitle}
                </strong>
              </div>
              <div className="sm:text-left">
                <span className="text-[11px] text-slate-400 block">المرحلة والجمهور المستهدف</span>
                <strong className="text-xs font-bold text-indigo-900">
                  {invoice.targetAudience || 'صفوف المرحلة الإعدادية والثانوية'}
                </strong>
              </div>
            </div>

            {invoice.requirements && (
              <div className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">المتطلبات الخاصة المسجلة من العميل:</span>
                <p className="leading-relaxed">{invoice.requirements}</p>
              </div>
            )}
          </div>

          {/* 4. INCLUDED FEATURES CHECKLIST */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              الميزات والخدمات المعتمدة في المنصة ({displayFeatures.length} ميزة معتمدة)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {displayFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    feat.isCompleted ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium leading-snug">{feat.name}</span>
                    {feat.isCompleted && (
                      <span className="inline-block mr-2 text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                        تم الإنجاز
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. FINANCIAL TERMS & PRICING TABLE */}
          <div className="rounded-2xl border-2 border-slate-900 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center text-xs font-bold">
              <span>بيان التكلفة والقيمة الاستثمارية للمنصة</span>
              <span>المبلغ</span>
            </div>
            
            <div className="p-5 bg-white space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-black text-slate-900 font-tajawal">
                    تكلفة ترخيص وتطوير منصة ({invoice.platformTitle})
                  </h4>
                  <p className="text-xs text-slate-500">
                    شاملة الاستضافة السحابية، حماية الفيديوهات، وبوابات الدفع الإلكتروني
                  </p>
                </div>
                <div className="text-left font-tajawal">
                  <span className="text-lg font-black text-slate-900">
                    {Number(invoice.amount).toLocaleString('ar-EG')}
                  </span>
                  <span className="text-xs text-slate-500 mr-1">ج.م</span>
                </div>
              </div>

              {/* Total Row */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">حالة السعر:</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    invoice.isNegotiable 
                      ? 'bg-amber-100 text-amber-900' 
                      : 'bg-indigo-100 text-indigo-950'
                  }`}>
                    {invoice.isNegotiable ? 'سعر قابل للتفاوض مع الإدارة' : 'سعر نهائي معتمد ومخفض'}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-600">الإجمالي المستحق:</span>
                  <span className="text-xl font-black text-emerald-700 font-tajawal">
                    {Number(invoice.amount).toLocaleString('ar-EG')} <span className="text-xs font-bold">جنيه مصري</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. TIMELINE & GUARANTEE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">مدة التجهيز والتسليم:</span>
                <span className="text-slate-600 font-medium">{invoice.deliveryDays || '3 - 5 أيام عمل فقط'}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">صلاحية هذا العرض:</span>
                <span className="text-slate-600 font-medium">{invoice.validUntil || 'صالح لمدة 7 أيام من تاريخ الإصدار'}</span>
              </div>
            </div>
          </div>

          {/* 7. OFFICIAL SIGNATURE & STAMP & REAL QR CODE */}
          <div className="pt-6 border-t-2 border-slate-200 flex flex-wrap justify-between items-center gap-4">
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block mb-1">الختم والاعتماد الرقمي الرسمي:</span>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>معتمد وموثق رسمياً من إدارة منصات السعيد الذكية</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                HASH: VALID-AUTH-{invoice.id.substring(0, 8).toUpperCase()} • SECURE QR VERIFIED
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Real Scannable Verification QR Code */}
              <a
                href={`/verify?code=${encodeURIComponent(invoice.invoiceNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 p-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl transition-all"
                title="اضغط أو امسح للتحقق اللحظي من العقد"
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      typeof window !== 'undefined' ? `${window.location.origin}/verify?code=${invoice.invoiceNumber}` : `https://alsaeed-platforms.com/verify?code=${invoice.invoiceNumber}`
                    )}&color=020617&bgcolor=ffffff&qzone=1`}
                    alt="رمز QR للتحقق من العقد"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[9px] font-black text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded block w-fit mb-0.5">
                    امسح للتحقق
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 block">فحص الـ QR</span>
                  <span className="text-[8px] text-slate-400 font-mono">SCAN TO VERIFY</span>
                </div>
              </a>

              {/* Official Stamp Simulation */}
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-dashed border-amber-600/70 p-1 flex items-center justify-center text-center rotate-[-6deg] shrink-0">
                <div className="w-full h-full rounded-full border border-amber-600/40 flex flex-col items-center justify-center bg-amber-50/60 text-[7px] font-black text-amber-950 leading-tight">
                  <span>منصات السعيد</span>
                  <span className="text-amber-800 font-bold">معتمد رسمياً</span>
                  <span className="font-mono text-[6px] text-slate-500">VERIFIED</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Actions Bar (Customer / Admin) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 print:hidden">
          
          <div className="flex items-center gap-2">
            {isPaid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
                تم سداد وتفعيل المنصة بنجاح
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                بانتظار السداد وبدء التطوير
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isCustomerView && !isPaid && !showPaymentOptions && (
              <button
                onClick={() => setShowPaymentOptions(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>سداد الفاتورة الآن ({Number(invoice.amount).toLocaleString('ar-EG')} ج.م)</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                إغلاق الوثيقة
              </button>
            )}
          </div>

        </div>

        {/* Instant Payment Drawer inside Modal */}
        {showPaymentOptions && !isPaid && (
          <div className="bg-slate-950 text-white p-6 border-t border-slate-800 animate-in slide-in-from-bottom duration-300 print:hidden space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-black font-tajawal text-amber-400">
                  اختر طريقة السداد لتأكيد حجز وبدء تجهيز المنصة:
                </h4>
                <p className="text-xs text-slate-300">
                  المبلغ المستحق سداده: <strong className="text-amber-300 font-tajawal text-sm">{Number(invoice.amount).toLocaleString('ar-EG')} جنيه مصري</strong>
                </p>
              </div>
              <button 
                onClick={() => setShowPaymentOptions(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-3 py-1.5 rounded-lg"
              >
                إغلاق
              </button>
            </div>

            {/* Methods Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Method 1: Wallet */}
              <button
                type="button"
                onClick={() => setSelectedMethod('wallet')}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  selectedMethod === 'wallet'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg ring-2 ring-amber-400/40'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Smartphone className={`w-4 h-4 ${selectedMethod === 'wallet' ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${selectedMethod === 'wallet' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    فوري ومعتمد
                  </span>
                </div>
                <span className="text-xs font-black block">المحفظة الإلكترونية</span>
                <span className={`text-[10px] block truncate ${selectedMethod === 'wallet' ? 'text-slate-900' : 'text-slate-400'}`}>
                  فودافون كاش / إنستاباي
                </span>
              </button>

              {/* Method 2: In-Person Meeting */}
              <button
                type="button"
                onClick={() => setSelectedMethod('meeting')}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  selectedMethod === 'meeting'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg ring-2 ring-amber-400/40'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Building2 className={`w-4 h-4 ${selectedMethod === 'meeting' ? 'text-slate-950' : 'text-indigo-400'}`} />
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${selectedMethod === 'meeting' ? 'bg-slate-950 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                    مقابلة شخصية
                  </span>
                </div>
                <span className="text-xs font-black block">دفع يدوي بالمقابلة</span>
                <span className={`text-[10px] block truncate ${selectedMethod === 'meeting' ? 'text-slate-900' : 'text-slate-400'}`}>
                  القاهرة والإسكندرية فقط
                </span>
              </button>

              {/* Method 3: Cards */}
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  selectedMethod === 'card'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg ring-2 ring-amber-400/40'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <CreditCard className={`w-4 h-4 ${selectedMethod === 'card' ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                    {paymentSettings.isCreditCardGatewayEnabled ? 'متاح' : 'قيد التعاقد'}
                  </span>
                </div>
                <span className="text-xs font-black block">بطاقة بنكية / فيزا</span>
                <span className={`text-[10px] block truncate ${selectedMethod === 'card' ? 'text-slate-900' : 'text-slate-400'}`}>
                  فيزا وماستركارد
                </span>
              </button>

              {/* Method 4: Bank */}
              <button
                type="button"
                onClick={() => setSelectedMethod('bank')}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  selectedMethod === 'bank'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg ring-2 ring-amber-400/40'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Building2 className={`w-4 h-4 ${selectedMethod === 'bank' ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                    تحويل بنكي
                  </span>
                </div>
                <span className="text-xs font-black block">حساب بنكي مباشر</span>
                <span className={`text-[10px] block truncate ${selectedMethod === 'bank' ? 'text-slate-900' : 'text-slate-400'}`}>
                  البنك الأهلي المصري
                </span>
              </button>

            </div>

            {/* Active Method Detailed Screen */}
            
            {/* 1. WALLET DETAILS (01151157100) */}
            {selectedMethod === 'wallet' && (
              <div className="bg-slate-900 border border-amber-400/30 rounded-2xl p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-amber-300 font-black text-xs font-tajawal">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>التحويل الفوري عبر محفظة الهاتف (فودافون كاش / إنستاباي / إتصالات كاش):</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                    نشط ومتاح 24/7
                  </span>
                </div>

                {/* Primary Wallet Box with Copy */}
                <div className="bg-slate-950 border-2 border-amber-400/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div>
                    <span className="text-[11px] text-slate-400 block">رقم المحفظة المعتمد للتحويل:</span>
                    <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-wider">
                      {paymentSettings.primaryWalletNumber || '01151157100'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {paymentSettings.walletLabel || 'فودافون كاش / إنستاباي / إتصالات كاش / أورانج'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyWallet(paymentSettings.primaryWalletNumber || '01151157100')}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm w-full sm:w-auto justify-center"
                  >
                    {copiedWallet ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedWallet ? 'تم نسخ الرقم بنجاح!' : 'نسخ رقم المحفظة'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <p className="font-bold text-slate-200">خطوات السداد:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>قم بفتح تطبيق محفظتك (أو إنستاباي) وتحويل مبلغ <strong className="text-amber-300">{Number(invoice.amount).toLocaleString('ar-EG')} ج.م</strong> للرقم أعلاه.</li>
                    <li>بعد إتمام التحويل، اضغط على زر "تأكيد السداد وبدء المنصة" بالأسفل لإشعار الإدارة فوراً.</li>
                  </ol>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleExecutePayment}
                    disabled={isProcessingPay}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    {isProcessingPay ? (
                      <span>جاري تأكيد السداد...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد سداد {Number(invoice.amount).toLocaleString('ar-EG')} ج.م وبدء المنصة</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 2. IN-PERSON MEETING OPTION (CAIRO & ALEX ONLY) */}
            {selectedMethod === 'meeting' && (
              <div className="bg-slate-900 border border-indigo-400/30 rounded-2xl p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs font-tajawal">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>المقابلة المباشرة والدفع اليدوي مع مندوب الإدارة:</span>
                </div>

                <div className="bg-indigo-950/70 border border-indigo-400/30 rounded-2xl p-4 space-y-2.5">
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    إذا أردت مقابلة شخصية مع أحد ممثلي ومندوبي الإدارة قبل دفع فاتورة المنصة، يمكنك ذلك بالاتفاق على موعد ومكان محدد، علماً بأن المناطق التي نتواجد فيها للمقابلات الميدانية هي:
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-black">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>محافظتي (القاهرة والإسكندرية) فقط بكافة مناطقهما</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    سيتم إخطارك باليوم والموعد المحدد بالساعة، وتزويدك ببيانات المندوب المعتمد (اسمه، هاتفه، صفته) وإصدار بطاقة موعد وتفويض رسمي مشفرة.
                  </p>
                </div>

                {/* Strict 20% Penalty Notice */}
                <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-rose-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>تنبيه وإقرار مالي غير قابل للتفاوض:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    في حال إلغاء طلب المنصة أو التخلف غير المبرر بعد تحديد المقابلة وحجز المندوب، يتحمل العميل <strong>20% مصاريف إدارية وحجز مواعيد (طلب غير جاد / طلب زائف)</strong>.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>حجز موعد المقابلة وإصدار بطاقة التفويض (PDF)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. CREDIT CARDS GATEWAY */}
            {selectedMethod === 'card' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>بوابات الدفع الإلكتروني المباشر (فيزا / ماستركارد):</span>
                </div>

                <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-black text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>تنويه بخصوص بوابات الدفع البنكية:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {paymentSettings.creditCardGatewayNotice || 'بوابات الدفع الإلكتروني المباشر (فيزا/ماستركارد) قيد الاعتماد والتعاقد البنكي حالياً - متاح الدفع الفوري عبر المحفظة الإلكترونية أو المقابلة المباشرة.'}
                  </p>
                  <p className="text-[11px] font-bold text-amber-400">
                    يرجى التبديل لخيار "المحفظة الإلكترونية" للتحويل الفوري على الرقم ({paymentSettings.primaryWalletNumber || '01151157100'}) أو اختيار المقابلة الشخصية.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('wallet')}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl"
                  >
                    التحويل عبر المحفظة الآن ({paymentSettings.primaryWalletNumber || '01151157100'})
                  </button>
                </div>
              </div>
            )}

            {/* 4. BANK TRANSFER */}
            {selectedMethod === 'bank' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>التحويل البنكي المباشر:</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                  <p className="font-bold text-white">بيانات الحساب البنكي المعتمد:</p>
                  <p className="font-mono text-amber-300 text-sm">{paymentSettings.bankAccountDetails || 'البنك الأهلي المصري - حساب رقم: 1048291048194'}</p>
                  <p className="text-[11px] text-slate-400">الاسم: منصات السعيد للأنظمة السحابية والتعليمية</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleExecutePayment}
                    disabled={isProcessingPay}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl"
                  >
                    تأكيد إرسال التحويل البنكي
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Modal: Book In-Person Meeting */}
      {showBookingModal && (
        <InPersonMeetingBookingModal
          invoice={invoice}
          customerId={invoice.customerId}
          customerName={invoice.teacherName}
          onClose={() => setShowBookingModal(false)}
          onMeetingCreated={(meeting) => {
            setShowBookingModal(false);
            setCreatedMeeting(meeting);
          }}
        />
      )}

      {/* Modal: View Chic In-Person Meeting Card */}
      {createdMeeting && (
        <InPersonMeetingCard
          meeting={createdMeeting}
          onClose={() => setCreatedMeeting(null)}
        />
      )}
    </div>
  );
}
