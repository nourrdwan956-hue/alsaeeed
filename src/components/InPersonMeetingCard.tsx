import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  UserCheck, 
  Phone, 
  AlertTriangle, 
  Printer, 
  Download, 
  X, 
  QrCode, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  Building2, 
  FileText, 
  BadgeAlert,
  Loader2
} from 'lucide-react';
import { InPersonMeetingData } from '../types/payment';
import { downloadElementAsPdf } from '../utils/pdfExport';

interface InPersonMeetingCardProps {
  meeting: InPersonMeetingData;
  onClose?: () => void;
}

export default function InPersonMeetingCard({ meeting, onClose }: InPersonMeetingCardProps) {
  const [printMode, setPrintMode] = useState<'color' | 'bw'>('color');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(meeting.verificationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!cardContainerRef.current || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await downloadElementAsPdf(cardContainerRef.current, {
        filename: `بطاقة_موعد_مقابلة_${meeting.meetingNumber}_${meeting.governorate}.pdf`,
        scale: 2.5,
        orientation: 'portrait',
        format: 'a4',
        margin: 6,
        fitToOnePage: true
      });
    } catch (err) {
      console.error('Error exporting meeting card PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = (mode: 'color' | 'bw') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      
      {/* Container */}
      <div className={`w-full max-w-2xl bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:rounded-none print:border-none ${
        printMode === 'bw' ? 'print:grayscale print:contrast-125' : ''
      }`}>
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-950 text-white px-5 py-3.5 flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-xs sm:text-sm font-bold font-tajawal text-slate-100">
              بطاقة موعد وتفويض مقابلة الدفع اليدوي المعتمدة
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct PDF Download */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="تحميل بطاقة الموعد فوراً كملف PDF"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>تصدير...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل PDF</span>
                </>
              )}
            </button>

            {/* Color Print */}
            <button
              onClick={() => handlePrint('color')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
              title="طباعة البطاقة بالألوان الكاملة"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>طباعة (ألوان)</span>
            </button>

            {/* Black & White Print */}
            <button
              onClick={() => handlePrint('bw')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
              title="طباعة مستند رسمي أبيض وأسود عالي الوضوح"
            >
              <FileText className="w-3.5 h-3.5 text-slate-300" />
              <span>أبيض وأسود</span>
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

        {/* Scrollable Printable Card Content */}
        <div 
          ref={cardContainerRef}
          id="in-person-meeting-card-container"
          className="p-6 md:p-8 overflow-y-auto space-y-6 text-right font-sans print:p-4 print:space-y-4 bg-white"
        >
          
          {/* Card Header with Gold Ribbon & Reference Code */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 border-2 border-amber-400/50 shadow-lg overflow-hidden">
            {/* Decorative background lights */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>وثيقة حجز مقابلة رسمية معتمدة</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-white font-tajawal">
                    بطاقة تفويض استلام وسداد المنصة نقداً
                  </h2>
                  <p className="text-[11px] text-slate-300">
                    منصات السعيد للأنظمة التعليمية الذكية • فرع (القاهرة / الإسكندرية)
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-amber-400/40 rounded-xl px-3.5 py-2 text-center shrink-0 w-full sm:w-auto">
                <span className="text-[10px] text-slate-400 block">رقم حجز المقابلة:</span>
                <span className="font-mono text-xs font-black text-amber-300 tracking-wider">
                  {meeting.meetingNumber}
                </span>
              </div>
            </div>
          </div>

          {/* CRITICAL SECURITY & AUTHENTICATION BADGE */}
          <div className="bg-amber-50/90 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 text-amber-950 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <BadgeAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black font-tajawal text-slate-950 flex items-center gap-2">
                  <span>تنبيه أمني فائق الأهمية (شرط التحقق وإثبات الهوية):</span>
                </h4>
                <p className="text-xs leading-relaxed text-slate-800 mt-1 font-medium">
                  يجب <strong className="text-amber-900 underline font-black">طباعة هذه البطاقة ورقياً أو حفظ نسخة واضحة منها على هاتفك</strong> لإبرازها لموظف الإدارة عند اللقاء للتصديق بأنك صاحب الطلب الفعلي للمنصة. لن يتم تسليم أو تحصيل أي مبالغ دون مطابقة كود الأمان المرفق أدناه.
                </p>
              </div>
            </div>

            {/* Verification Security Token Box */}
            <div className="bg-white border border-amber-300 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold text-slate-700">كود التحقق الأمني المعتمد:</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="font-mono text-sm sm:text-base font-black text-indigo-950 bg-slate-100 px-3 py-1 rounded-lg border border-slate-300 tracking-wider">
                  {meeting.verificationCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-all flex items-center gap-1 print:hidden"
                  title="نسخ كود الأمان"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* MEETING DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Date & Time */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-xs font-tajawal">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>الموعد والتوقيت المعتمد:</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-900 font-bold">
                  التاريخ: <span className="text-indigo-900 font-black">{meeting.scheduledDate}</span>
                </p>
                <p className="text-slate-700 font-medium">
                  الساعة: <span className="text-indigo-900 font-black">{meeting.scheduledTime}</span>
                </p>
              </div>
            </div>

            {/* 2. City & Location */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-xs font-tajawal">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>المحافظة وموقع المقابلة:</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-900 font-bold">
                  المحافظة: <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md font-black">{meeting.governorate}</span> (حصرياً)
                </p>
                <p className="text-slate-700 font-medium truncate">
                  المنطقة: <span className="font-bold text-slate-900">{meeting.region}</span>
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  العنوان: {meeting.specificAddress}
                </p>
              </div>
            </div>

            {/* 3. Authorized Employee Data */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-xs font-tajawal">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>بيانات الموظف / المندوب المفوض:</span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-900 font-bold">
                  الاسم: <span className="text-emerald-950 font-black">{meeting.employeeName}</span>
                </p>
                <p className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>الهاتف:</span>
                  <a href={`tel:${meeting.employeePhone}`} className="text-emerald-700 font-mono font-bold hover:underline" dir="ltr">
                    {meeting.employeePhone}
                  </a>
                </p>
                <p className="text-[11px] text-slate-500">
                  الصفة: {meeting.employeeTitle || 'مندوب التعاقد والتحصيل المعتمد'}
                </p>
              </div>
            </div>

            {/* 4. Amount to Handover */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-xs font-tajawal">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>المبلغ المطلوب تسليمه نقداً:</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-center">
                <span className="text-xl font-black text-emerald-700 font-tajawal">
                  {Number(meeting.amountToCollect).toLocaleString('ar-EG')} <span className="text-xs font-bold">جنيه مصري</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">يسلم مقابل إيصال استلام رسمي وعقد تفعيل</span>
              </div>
            </div>

          </div>

          {/* STRICT CANCELLATION PENALTY CLAUSE */}
          <div className="rounded-2xl bg-rose-50 border-2 border-rose-200 p-4 text-rose-950 space-y-2">
            <div className="flex items-center gap-2 font-black font-tajawal text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>إقرار والتزام مالي صارم (بند حظر الطلبات الزائفة):</span>
            </div>
            <p className="text-[11px] sm:text-xs leading-relaxed text-rose-950/90 font-medium">
              في حال إلغاء طلب المنصة بعد إصدار هذا التفويض وتحديد الموعد أو التخلف غير المبرر عن الحضور، يتحمل العميل <strong className="font-black underline">نسبة 20% مصاريف إدارية وحجز مواعيد وانتقال موظف الإدارة</strong> (ما يُعرف بالطلب غير الجاد أو الزائف)، وهي مصاريف قانونية ملزمة وغير قابلة للتفاوض نهائياً.
            </p>
          </div>

          {/* Official Stamp & Real Verification QR Code at Footer */}
          <div className="pt-4 border-t-2 border-slate-200 flex flex-wrap justify-between items-center gap-4 text-xs">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تم توثيق الموعد واعتماده في سجلات الشركة الرسمية</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                AUTH-SECURITY-TOKEN: {meeting.verificationCode} • {new Date(meeting.createdAt).toLocaleDateString('ar-EG')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Real Scannable QR Code */}
              <a
                href={`/verify?code=${encodeURIComponent(meeting.verificationCode)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl transition-all"
                title="امسح للتحقق اللحظي من تفويض المقابلة"
              >
                <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      typeof window !== 'undefined' ? `${window.location.origin}/verify?code=${meeting.verificationCode}` : `https://alsaeed-platforms.com/verify?code=${meeting.verificationCode}`
                    )}&color=020617&bgcolor=ffffff&qzone=1`}
                    alt="رمز QR لموعد المقابلة"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[8px] font-black text-amber-900 bg-amber-200 px-1 py-0.5 rounded block w-fit mb-0.5">
                    تحقق فوري
                  </span>
                  <span className="text-[9px] font-bold text-slate-700 block">مسح الـ QR</span>
                </div>
              </a>

              {/* Stamp */}
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-amber-600/70 flex items-center justify-center text-center rotate-[-8deg] shrink-0">
                <div className="w-full h-full rounded-full border border-amber-600/40 flex flex-col items-center justify-center bg-amber-50/60 text-[7px] font-black text-amber-950 leading-tight">
                  <span>منصات السعيد</span>
                  <span className="text-amber-800 font-bold">توثيق مقابلة</span>
                  <span className="font-mono text-[6px] text-slate-500">AUTHORIZED</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Modal Actions (Hidden on Print) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center print:hidden">
          <span className="text-xs text-slate-500 font-medium">
            يرجى إبراز هذه البطاقة للمندوب المعتمد عند المقابلة.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التصدير...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تحميل البطاقة كاملة (PDF)</span>
                </>
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
