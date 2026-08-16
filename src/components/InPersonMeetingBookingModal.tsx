import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Building2, 
  Phone, 
  User, 
  CheckCircle2, 
  ChevronRight,
  Info
} from 'lucide-react';
import { EGYPT_SUPPORTED_CITIES, InPersonMeetingData } from '../types/payment';
import { InvoiceData } from '../types/delivery';

interface InPersonMeetingBookingModalProps {
  invoice?: InvoiceData | null;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  onClose: () => void;
  onMeetingCreated: (meeting: InPersonMeetingData) => void;
}

export default function InPersonMeetingBookingModal({
  invoice,
  customerId,
  customerName,
  customerPhone = '',
  onClose,
  onMeetingCreated
}: InPersonMeetingBookingModalProps) {
  const [governorate, setGovernorate] = useState<'القاهرة' | 'الإسكندرية'>('القاهرة');
  const [region, setRegion] = useState(EGYPT_SUPPORTED_CITIES[0].regions[0]);
  const [specificAddress, setSpecificAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('04:00 عصراً');
  const [phone, setPhone] = useState(customerPhone || '');
  const [teacherName, setTeacherName] = useState(customerName || '');
  const [notes, setNotes] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available regions for chosen governorate
  const currentCityObj = EGYPT_SUPPORTED_CITIES.find(c => c.name === governorate) || EGYPT_SUPPORTED_CITIES[0];

  const handleGovernorateChange = (city: 'القاهرة' | 'الإسكندرية') => {
    setGovernorate(city);
    const newCityObj = EGYPT_SUPPORTED_CITIES.find(c => c.name === city);
    if (newCityObj && newCityObj.regions.length > 0) {
      setRegion(newCityObj.regions[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError('يرجى الموافقة على شروط وبند حجز المواعيد والمصاريف الإدارية للاستمرار.');
      return;
    }

    if (!phone || phone.trim().length < 10) {
      setError('يرجى إدخال رقم هاتف صحيح للتواصل وتأكيد المقابلة.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/in-person-meetings/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice?.id || null,
          customerId,
          customerName: teacherName || customerName,
          customerPhone: phone,
          governorate,
          region,
          specificAddress: specificAddress || `منطقة ${region} - بمحافظة ${governorate}`,
          preferredDate: preferredDate || 'أقرب موعد متاح بتنسيق الإدارة',
          preferredTime,
          amountToCollect: invoice?.amount || '6500',
          customerNotes: notes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل تسجيل طلب المقابلة');
      }

      onMeetingCreated(data.meeting);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حجز الموعد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-right font-sans">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-tajawal">
                طلب مقابلة شخصية وسداد نقدي مع مندوب الإدارة
              </h3>
              <p className="text-[11px] text-amber-400 font-semibold">
                حجز موعد رسمي للتعاقد وتسليم الدفعة يداً بيد
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Important Notice on Supported Locations */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs font-tajawal">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>نطاق المقابلات الجغرافي الحصري:</span>
            </div>
            <p className="text-xs text-indigo-900/90 leading-relaxed font-medium">
              نحيط سيادتكم علماً بأن ممثلي ومندوبي إدارة <strong>منصات السعيد</strong> يتواجدون للمقابلات الشخصية حصرياً في محافظتي <strong className="text-indigo-950 font-black underline">القاهرة والإسكندرية</strong> فقط بكافة مناطقهما.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Teacher & Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">اسم المعلم / طالب المنصة:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-amber-500 font-medium pr-8"
                  placeholder="الاسم الثلاثي"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">رقم الهاتف للتواصل المباشر:</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-amber-500 font-medium pr-8 text-left"
                  dir="ltr"
                  placeholder="01xxxxxxxxx"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Governorate Selection (Cairo or Alexandria Only) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">اختر المحافظة (المتاحة حالياً):</label>
            <div className="grid grid-cols-2 gap-3">
              {(['القاهرة', 'الإسكندرية'] as const).map((city) => (
                <button
                  type="button"
                  key={city}
                  onClick={() => handleGovernorateChange(city)}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    governorate === city
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/30 font-black'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>محافظة {city}</span>
                </button>
              ))}
            </div>
          </div>

          {/* District / Region Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">اختر المنطقة / الحي الأقرب لك:</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-amber-500 font-medium"
            >
              {currentCityObj.regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Location / Address */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">العنوان أو المكان المقترح للقاء (مقهى / مركز تعليمي / مقر):</label>
            <input
              type="text"
              value={specificAddress}
              onChange={(e) => setSpecificAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-amber-500 font-medium"
              placeholder="مثال: كافيه محدد بشارع عباس العقاد / مقر السنتر الخاص بي"
            />
          </div>

          {/* Preferred Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">التاريخ المفضل للمقابلة:</label>
              <div className="relative">
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-amber-500 font-medium pr-8"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الساعة المفضلة:</label>
              <div className="relative">
                <input
                  type="text"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-amber-500 font-medium pr-8"
                  placeholder="مثال: 05:00 مساءً"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Amount Summary */}
          {invoice && (
            <div className="bg-slate-100 p-3.5 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-600 font-bold">المبلغ المتفق على سداده نقداً:</span>
              <span className="text-base font-black text-emerald-700 font-tajawal">
                {Number(invoice.amount).toLocaleString('ar-EG')} ج.م
              </span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات إضافية للمندوب (اختياري):</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-amber-500 font-medium resize-none"
              placeholder="أي تفاصيل خاصة بالموقع أو الموعد..."
            />
          </div>

          {/* STRICT 20% CANCELLATION PENALTY CHECKBOX */}
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 space-y-2 text-rose-950">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-amber-600 rounded border-rose-300 focus:ring-rose-500 cursor-pointer"
              />
              <span className="text-xs leading-relaxed font-bold">
                أقر وألتزم رسمياً بأنه في حال إلغاء طلب المنصة بعد إصدار بطاقة الموعد أو التخلف غير المبرر عن المقابلة، أتحمل <span className="underline font-black text-rose-900">نسبة 20% مصاريف إدارية وحجز مواعيد (طلب غير جاد / طلب زائف)</span> غير قابلة للتفاوض نهائياً.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {loading ? (
                <span>جاري إصدار البطاقة...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>تأكيد الحجز وإصدار بطاقة المقابلة</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
