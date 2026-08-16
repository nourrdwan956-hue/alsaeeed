import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Globe, 
  Smartphone, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Lock, 
  Headphones, 
  Calendar, 
  FileText, 
  AlertCircle,
  Copy,
  Check,
  Zap,
  CheckSquare,
  Square,
  Eye,
  Rocket
} from 'lucide-react';
import { InvoiceData, MilestoneItem, FeatureModule, calculateProjectProgress } from '../types/delivery';

interface PlatformDeliveryTimelineProps {
  invoice: InvoiceData;
  onViewInvoice?: (invoice: InvoiceData) => void;
}

export default function PlatformDeliveryTimeline({
  invoice,
  onViewInvoice
}: PlatformDeliveryTimelineProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const progress = calculateProjectProgress(invoice.milestones, invoice.featuresModules);
  const isDelivered = invoice.status === 'delivered' || progress.percentage === 100;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activeMilestones = invoice.milestones && invoice.milestones.length > 0
    ? invoice.milestones
    : [];

  const enabledFeatures = (invoice.featuresModules || []).filter(f => f.isEnabled !== false);

  return (
    <div className="space-y-6 text-right font-sans">
      
      {/* 1. TOP HERO PROGRESS CARD */}
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-500/30 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold font-mono">
                رقم الوثيقة: {invoice.invoiceNumber}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isDelivered 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              }`}>
                {isDelivered ? '🚀 تم التسليم بنجاح وجاهز' : '⚙️ قيد التجهيز والتطوير السحابي'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-tajawal">
              {invoice.platformTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              الأستاذ: <strong className="text-amber-300">{invoice.teacherName}</strong> • مادة: <strong className="text-white">{invoice.subject}</strong>
            </p>
          </div>

          {/* Big Progress Dial / Counter */}
          <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 flex items-center gap-5 min-w-[240px]">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${progress.percentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-black text-white font-tajawal">
                {progress.percentage}%
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">نسبة إنجاز المنصة</span>
              <strong className="text-base font-bold text-amber-400 block font-tajawal">
                {progress.completedCount} من {progress.totalActiveCount} مهمة مكتملة
              </strong>
              <span className="text-[10px] text-slate-400 block">
                {invoice.deliveryDays || '3 - 5 أيام عمل'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-300 font-medium">مؤشر التقدم العام للمنصة والميزات المعتمدة</span>
            <span className="text-amber-400 font-bold font-mono">{progress.percentage}%</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>

        {onViewInvoice && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onViewInvoice(invoice)}
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>معاينة الوثيقة والعقد الرسمي المعتمد</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. HANDOVER DELIVERY CREDENTIALS (Appears when ready or has urls) */}
      {(invoice.domainUrl || invoice.adminPortalUrl || invoice.appDownloadUrl || isDelivered) && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-emerald-500/40 space-y-5 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 font-tajawal">
                  بيانات تسليم المنصة وروابط الوصول المباشر
                </h3>
                <p className="text-xs text-slate-500">تم تجهيز وتشغيل الخدمات السحابية لمنصتك التعليمية</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              جاهز للاستخدام
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Live Domain */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  رابط موقع الطلاب (الدومين)
                </span>
              </div>
              <p className="font-mono text-xs text-slate-900 font-bold break-all bg-white p-2.5 rounded-xl border border-slate-200">
                {invoice.domainUrl || `https://${invoice.teacherName.toLowerCase().replace(/\s+/g, '')}-edu.com`}
              </p>
              <a
                href={invoice.domainUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-indigo-950 hover:bg-indigo-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span>زيارة الموقع</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Admin Control Portal */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  رابط لوحة تحكم المعلم (الأدمن)
                </span>
              </div>
              <p className="font-mono text-xs text-slate-900 font-bold break-all bg-white p-2.5 rounded-xl border border-slate-200">
                {invoice.adminPortalUrl || `${invoice.domainUrl || 'https://domain.com'}/admin-portal`}
              </p>
              <a
                href={invoice.adminPortalUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <span>دخول لوحة التحكم</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Mobile App Download */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  تطبيق الهاتف الذكي
                </span>
              </div>
              <p className="font-mono text-xs text-slate-900 font-bold break-all bg-white p-2.5 rounded-xl border border-slate-200">
                {invoice.appDownloadUrl || 'Android APK & Web-App Ready'}
              </p>
              <button
                onClick={() => handleCopy(invoice.appDownloadUrl || 'https://play.google.com/store/apps', 'app')}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedKey === 'app' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'app' ? 'تم نسخ الرابط' : 'نسخ رابط التحميل'}</span>
              </button>
            </div>

          </div>

          {invoice.accessCredentials && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-slate-800">
              <span className="font-bold text-amber-950 block mb-1">بيانات تسجيل الدخول المبدئية:</span>
              <p className="font-mono bg-white p-2.5 rounded-xl border border-amber-200 text-slate-900 leading-relaxed">
                {invoice.accessCredentials}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. STEP-BY-STEP MILESTONES ROADMAP */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-900 flex items-center justify-center font-black">
              1
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-tajawal">
                مراحل إطلاق المنصة وتجهيز السيرفرات (المسار الزمني)
              </h3>
              <p className="text-xs text-slate-500">يتم تحديث كل مرحلة لحظياً فور إتمامها من الفريق التقني</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {progress.milestonesProgress}% مكتمل
          </span>
        </div>

        {/* Milestone Steps Timeline */}
        <div className="relative space-y-4 before:absolute before:right-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
          {activeMilestones.map((m: MilestoneItem, idx: number) => {
            const isDone = m.isCompleted;

            return (
              <div key={m.id || idx} className="relative flex items-start gap-4 pr-1">
                
                {/* Step Circle Indicator */}
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all shadow-xs ${
                  isDone 
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50' 
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}>
                  {isDone ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <span className="text-xs font-black font-tajawal">{idx + 1}</span>
                  )}
                </div>

                {/* Step Content Card */}
                <div className={`flex-1 p-4 rounded-2xl border transition-all ${
                  isDone 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : 'bg-slate-50/60 border-slate-200 text-slate-600'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h4 className={`text-sm font-bold font-tajawal ${isDone ? 'text-slate-950' : 'text-slate-700'}`}>
                      {m.title}
                    </h4>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block w-fit ${
                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isDone ? 'تم الانتهاء بنجاح' : 'جاري العمل'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {m.description}
                  </p>

                  {isDone && m.completedAt && (
                    <div className="text-[10px] text-emerald-700 mt-2 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>تاريخ الإنجاز: {new Date(m.completedAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. APPROVED FEATURES CHECKLIST (EXCLUDES DISABLED FEATURES) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center font-black">
              2
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-tajawal">
                الميزات والخدمات المعتمدة في عقد المنصة ({enabledFeatures.length} ميزة)
              </h3>
              <p className="text-xs text-slate-500">
                الميزات المعتمدة رسمياً في وثيقتك مع حالة إتمام كل ميزة
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {progress.featuresProgress}% مكتمل
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {enabledFeatures.map((feat: FeatureModule) => (
            <div 
              key={feat.id} 
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                feat.isCompleted 
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-900' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                feat.isCompleted ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-400'
              }`}>
                {feat.isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs leading-snug">{feat.name}</h5>
                </div>
                {feat.description && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">{feat.description}</p>
                )}
                <div className="pt-1 flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    feat.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {feat.isCompleted ? 'مكتملة ومدمجة' : 'قيد التطوير والبرمجة'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
