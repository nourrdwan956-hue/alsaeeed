import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  Globe, 
  Smartphone, 
  ShieldCheck, 
  Save, 
  X, 
  Sparkles, 
  Layers, 
  Check, 
  Clock, 
  ExternalLink,
  Plus,
  Trash2,
  Rocket
} from 'lucide-react';
import { 
  InvoiceData, 
  MilestoneItem, 
  FeatureModule, 
  calculateProjectProgress,
  DEFAULT_PLATFORM_FEATURES,
  DEFAULT_PLATFORM_MILESTONES
} from '../types/delivery';

interface AdminDeliveryManagerModalProps {
  invoice: InvoiceData;
  onClose: () => void;
  onUpdated: (updatedInvoice: InvoiceData) => void;
}

export default function AdminDeliveryManagerModal({
  invoice,
  onClose,
  onUpdated
}: AdminDeliveryManagerModalProps) {
  // Ensure default structures if empty
  const initialMilestones: MilestoneItem[] = invoice.milestones && invoice.milestones.length > 0
    ? invoice.milestones
    : DEFAULT_PLATFORM_MILESTONES;

  const initialFeatures: FeatureModule[] = invoice.featuresModules && invoice.featuresModules.length > 0
    ? invoice.featuresModules
    : DEFAULT_PLATFORM_FEATURES;

  const [milestones, setMilestones] = useState<MilestoneItem[]>(initialMilestones);
  const [features, setFeatures] = useState<FeatureModule[]>(initialFeatures);
  const [status, setStatus] = useState(invoice.status || 'building');
  const [domainUrl, setDomainUrl] = useState(invoice.domainUrl || '');
  const [adminPortalUrl, setAdminPortalUrl] = useState(invoice.adminPortalUrl || '');
  const [appDownloadUrl, setAppDownloadUrl] = useState(invoice.appDownloadUrl || '');
  const [accessCredentials, setAccessCredentials] = useState(invoice.accessCredentials || '');
  const [adminNotes, setAdminNotes] = useState(invoice.adminNotes || '');
  const [amount, setAmount] = useState(String(invoice.amount || ''));

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-calculated progress in real-time
  const progress = calculateProjectProgress(milestones, features);

  // Toggle Milestone Completion
  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.isCompleted;
        return {
          ...m,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined
        };
      }
      return m;
    }));
  };

  // Toggle Feature Completion (Checkmark)
  const toggleFeatureCompletion = (id: string) => {
    setFeatures(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, isCompleted: !f.isCompleted };
      }
      return f;
    }));
  };

  // Toggle Feature Lock / Enable State (If disabled, it drops from progress & document)
  const toggleFeatureLock = (id: string) => {
    setFeatures(prev => prev.map(f => {
      if (f.id === id) {
        const nextEnabled = !f.isEnabled;
        return {
          ...f,
          isEnabled: nextEnabled,
          // if disabled, reset completion
          isCompleted: nextEnabled ? f.isCompleted : false
        };
      }
      return f;
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}/delivery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestones,
          featuresModules: features,
          status,
          domainUrl: domainUrl.trim(),
          adminPortalUrl: adminPortalUrl.trim(),
          appDownloadUrl: appDownloadUrl.trim(),
          accessCredentials: accessCredentials.trim(),
          adminNotes: adminNotes.trim(),
          amount: amount.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.invoice) {
        setSuccessMsg('تم حفظ التعديلات وتحديث مراحل المنصة وإشعار العميل بنجاح!');
        onUpdated(data.invoice);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || 'فشل حفظ التعديلات');
      }
    } catch (err) {
      console.error('Error saving delivery updates:', err);
      setErrorMsg('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 text-right font-sans max-h-[92vh] overflow-y-auto flex flex-col space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-amber-400 flex items-center justify-center shadow-md">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 font-tajawal">
                  إدارة مراحل تسليم المنصة والتحكم في الميزات
                </h3>
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                منصة: <strong className="text-slate-800">{invoice.platformTitle}</strong> • المعلم: <strong className="text-slate-800">{invoice.teacherName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live calculated progress badge */}
            <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex items-center gap-2.5">
              <span className="text-xs text-slate-300 font-medium">التقدم المحسوب:</span>
              <span className="text-base font-black text-amber-400 font-tajawal">{progress.percentage}%</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. MILESTONES CHECKLIST (Check off completed phases) */}
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h4 className="font-bold text-sm text-slate-900 font-tajawal">
                1. مراحل الإطلاق والتسليم (المسار الزمني)
              </h4>
            </div>
            <span className="text-xs font-bold text-slate-500">
              ضع علامة صح أمام المرحلة المنتهية لحساب النسبة تلقائياً
            </span>
          </div>

          <div className="space-y-2.5">
            {milestones.map((m) => (
              <div 
                key={m.id}
                onClick={() => toggleMilestone(m.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  m.isCompleted 
                    ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    m.isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {m.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${m.isCompleted ? 'text-slate-900 font-tajawal' : 'text-slate-700'}`}>
                      {m.title}
                    </span>
                    <span className="text-[11px] text-slate-500">{m.description}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  m.isCompleted ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                }`}>
                  {m.isCompleted ? 'مكتملة ✅' : 'قيد التنفيذ ⏳'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. DYNAMIC SMART FEATURES CONTROL (LOCK / UNLOCK / REMOVE FROM INVOICE & PROGRESS) */}
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 font-tajawal">
                  2. ميزات وخدمات المنصة (القفل / الإلغاء / التفعيل)
                </h4>
                <p className="text-[11px] text-slate-500">
                  إذا تم إلغاء أو قفل ميزة (مثل التطبيق)، تُحذف تلقائياً من الوثيقة وشريط التقدم، ويمكن إعادة فتحها في أي وقت.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feat) => {
              const isEnabled = feat.isEnabled !== false;

              return (
                <div
                  key={feat.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                    !isEnabled 
                      ? 'bg-slate-200/60 border-dashed border-slate-300 opacity-60' 
                      : feat.isCompleted 
                        ? 'bg-emerald-50/70 border-emerald-300' 
                        : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className={`text-xs font-bold block leading-snug ${
                        !isEnabled ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}>
                        {feat.name}
                      </span>
                      {feat.additionalCost && (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded mt-1 inline-block">
                          ميزة إضافية: +{feat.additionalCost} ج.م
                        </span>
                      )}
                    </div>

                    {/* Lock / Unlock Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleFeatureLock(feat.id)}
                      className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                        isEnabled 
                          ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border-slate-200' 
                          : 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      }`}
                      title={isEnabled ? 'إلغاء وقفل الميزة من الوثيقة والتقدم' : 'تفعيل وإعادة إدراج الميزة'}
                    >
                      {isEnabled ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span className="text-[10px]">قفل / استبعاد</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span className="text-[10px]">فك القفل وإدراج</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Completion Status (Only active if enabled) */}
                  {isEnabled && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleFeatureCompletion(feat.id)}
                        className={`text-xs font-bold flex items-center gap-2 px-3 py-1 rounded-xl transition-all ${
                          feat.isCompleted 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{feat.isCompleted ? 'تم إنجاز وبرمجة الميزة ✅' : 'وضع علامة كـ منجزة'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. PLATFORM DELIVERY & HANDOVER DETAILS */}
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h4 className="font-bold text-sm text-slate-900 font-tajawal">
              3. بيانات التسليم وروابط الوصول المباشر للمعلم
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رابط الدومين المباشر (الموقع)</label>
              <input
                type="text"
                value={domainUrl}
                onChange={(e) => setDomainUrl(e.target.value)}
                placeholder="https://mr-teacher.com"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رابط لوحة تحكم المعلم (Portal)</label>
              <input
                type="text"
                value={adminPortalUrl}
                onChange={(e) => setAdminPortalUrl(e.target.value)}
                placeholder="https://mr-teacher.com/admin"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رابط تحميل تطبيق الموبايل</label>
              <input
                type="text"
                value={appDownloadUrl}
                onChange={(e) => setAppDownloadUrl(e.target.value)}
                placeholder="https://play.google.com/..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">بيانات الدخول والاعتماد المبدئية</label>
            <textarea
              rows={2}
              value={accessCredentials}
              onChange={(e) => setAccessCredentials(e.target.value)}
              placeholder="اسم المستخدم: admin@teacher.com | كلمة المرور المؤقتة: Teacher2026!#"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">حالة المنصة العامة</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 font-bold"
              >
                <option value="building">⚙️ قيد التجهيز والتطوير (Building)</option>
                <option value="delivered">🚀 تم التسليم النهائي والتشغيل (Delivered)</option>
                <option value="paid">💰 مسددة وبانتظار بدء التطوير (Paid)</option>
                <option value="issued">📄 وثيقة صادرة (Issued)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تعديل السعر المعتمد (ج.م)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold font-tajawal"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            سيتم تحديث شريط التقدم للعميل فوراً وتعديل الوثيقة الرسمية.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2"
            >
              {saving ? (
                <span>جاري حفظ التحديثات...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>حفظ واعتماد التقدم للعميل</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
