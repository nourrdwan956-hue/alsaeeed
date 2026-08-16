import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  X, 
  Send, 
  ShieldCheck,
  Calendar,
  Layers,
  HelpCircle,
  Clock
} from 'lucide-react';

interface CreateInvoiceModalProps {
  customerId: string;
  customerName: string;
  customerPhone?: string;
  defaultPlatformName?: string;
  defaultSubject?: string;
  onClose: () => void;
  onCreated: (invoice: any) => void;
}

export default function CreateInvoiceModal({
  customerId,
  customerName,
  customerPhone,
  defaultPlatformName = '',
  defaultSubject = '',
  onClose,
  onCreated
}: CreateInvoiceModalProps) {
  const [platformTitle, setPlatformTitle] = useState(defaultPlatformName || `منصة ${customerName} التعليمية`);
  const [teacherName, setTeacherName] = useState(customerName || '');
  const [subject, setSubject] = useState(defaultSubject || 'المادة التعليمية');
  const [amount, setAmount] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [deliveryDays, setDeliveryDays] = useState('3 - 5 أيام عمل');
  const [targetAudience, setTargetAudience] = useState('المرحلة الإعدادية والثانوية');
  const [requirements, setRequirements] = useState('تطوير منصة تعليمية وتطبيق ذكي مع حماية الفيديوهات وبوابة الدفع الإلكتروني');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !platformTitle.trim()) {
      setErrorMsg('الرجاء إدخال السعر المطلوب واسم المنصة');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          platformTitle: platformTitle.trim(),
          teacherName: teacherName.trim(),
          subject: subject.trim(),
          targetAudience: targetAudience.trim(),
          requirements: requirements.trim(),
          amount: String(amount).replace(/,/g, ''),
          isNegotiable,
          deliveryDays,
          adminNotes: adminNotes.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.invoice) {
        onCreated(data.invoice);
        onClose();
      } else {
        setErrorMsg(data.error || 'فشل إنشاء الوثيقة الرسمية');
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      setErrorMsg('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 text-right font-sans max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-amber-400 flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-tajawal">
                إنشاء وثيقة عرض سعر وفاتورة رسمية
              </h3>
              <p className="text-xs text-slate-500">
                للأستاذ: <strong className="text-slate-800">{customerName}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold mb-4 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Quick Notice */}
          <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-slate-700 leading-relaxed">
              سيقوم النظام آلياً بتوليد وثيقة وعقد رسمي معتمد برقم تسلسلي، وعرض بطاقة سداد إلكترونية داخل الشات تمكن العميل من الدفع المباشر أو التفاوض.
            </p>
          </div>

          {/* Platform Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">اسم المنصة المقترحة</label>
            <input
              type="text"
              value={platformTitle}
              onChange={(e) => setPlatformTitle(e.target.value)}
              placeholder="مثال: منصة الأستاذ أحمد في الفيزياء"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
              required
            />
          </div>

          {/* Teacher & Subject Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المعلم المعتمد</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">المادة التعليمية</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: الكيمياء / اللغة العربية"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Amount & Price Condition (THE CORE FEATURE) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <label className="block font-black text-slate-900 text-sm mb-1">
                قيمة الاستثمار / السعر المطلوب (بالجنيه المصري) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="مثال: 5500"
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-lg font-black text-emerald-700 font-tajawal focus:border-amber-500 focus:outline-none transition-all"
                  required
                />
                <span className="absolute left-3.5 top-3.5 font-bold text-slate-400 text-xs">ج.م</span>
              </div>
            </div>

            {/* Negotiable Toggle */}
            <div className="pt-2">
              <label className="block font-bold text-slate-700 mb-2">شرط السعر في الوثيقة الرسمية:</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNegotiable(false)}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2 ${
                    !isNegotiable
                      ? 'bg-indigo-950 text-white border-indigo-950 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${!isNegotiable ? 'text-amber-400' : 'text-slate-400'}`} />
                  <div>
                    <span className="block font-bold">سعر نهائي معتمد</span>
                    <span className="text-[10px] opacity-75">غير قابل للتفاوض</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNegotiable(true)}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2 ${
                    isNegotiable
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-900" />
                  <div>
                    <span className="block font-bold">سعر قابل للتفاوض</span>
                    <span className="text-[10px] opacity-75">عرض مبدئي للمناقشة</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Timeline & Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">مدة التسليم والتجهيز</label>
              <input
                type="text"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">المرحلة والجمهور</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Requirements & Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات العقد ومواصفات المنصة</label>
            <textarea
              rows={2}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white leading-relaxed"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
            >
              {submitting ? (
                <span>جاري إنشاء الوثيقة...</span>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>اعتماد وإصدار الوثيقة للشات فوراً</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
