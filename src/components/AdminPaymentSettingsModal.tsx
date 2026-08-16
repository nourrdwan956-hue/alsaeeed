import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Save, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Ban, 
  ToggleLeft, 
  ToggleRight, 
  Info,
  DollarSign
} from 'lucide-react';
import { PaymentSettingsData } from '../types/payment';

interface AdminPaymentSettingsModalProps {
  onClose: () => void;
  onSaved?: (settings: PaymentSettingsData) => void;
}

export default function AdminPaymentSettingsModal({ onClose, onSaved }: AdminPaymentSettingsModalProps) {
  const [settings, setSettings] = useState<PaymentSettingsData>({
    primaryWalletNumber: '01151157100',
    walletLabel: 'فودافون كاش / إتصالات كاش / أورانج كاش / إنستاباي',
    secondaryWalletNumber: '',
    bankAccountDetails: 'البنك الأهلي المصري - حساب رقم: 1048291048194',
    isWalletEnabled: true,
    isInstapayEnabled: true,
    isCashMeetingEnabled: true,
    isCreditCardGatewayEnabled: false,
    creditCardGatewayNotice: 'بوابات الدفع الإلكتروني المباشر (فيزا/ماستركارد) قيد الاعتماد والتعاقد البنكي حالياً - متاح الدفع الفوري عبر المحفظة أو المقابلة المباشرة',
    inPersonLocationsNotice: 'المقابلات المباشرة والدفع اليدوي مع مندوبنا المعتمد متاحة حصرياً في محافظتي (القاهرة والإسكندرية) بكافة مناطقهما.',
    cancellationPenaltyPercent: 20,
    penaltyWarningClause: 'تنبيه وإقرار صارم: في حال إلغاء طلب المنصة أو التخلف غير المبرر عن موعد المقابلة المعتمد، يتحمل العميل 20% مصاريف إدارية وحجز مواعيد (طلب غير جاد / طلب زائف) غير قابلة للتفاوض نهائياً.'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment-settings');
      const data = await res.json();
      if (data && data.primaryWalletNumber) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل حفظ الإعدادات');
      }
      setSuccessMsg(true);
      if (onSaved) onSaved(data.settings);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-right font-sans">
        
        {/* Modal Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-tajawal">
                إدارة أرقام وطرق وبوابات الدفع الإلكتروني
              </h3>
              <p className="text-[11px] text-amber-400 font-semibold">
                التحكم المالي، أرقام المحافظ، بوابات الفيزا، وسياسة المقابلات
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

        {/* Modal Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <span>جاري تحميل إعدادات الدفع...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
            
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم حفظ وتحديث إعدادات وبوابات الدفع بنجاح وتفعيلها للعملاء فوراً!</span>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. PRIMARY WALLET NUMBER & LABEL */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-xs font-tajawal">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span>رقم المحفظة الأساسي المعتمد للتحويل الفوري:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">رقم المحفظة (فودافون كاش / إنستاباي):</label>
                  <input
                    type="text"
                    required
                    value={settings.primaryWalletNumber}
                    onChange={(e) => setSettings({ ...settings, primaryWalletNumber: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-black text-indigo-950 font-mono text-left focus:border-amber-500 focus:outline-hidden"
                    dir="ltr"
                    placeholder="01151157100"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">الرقم الافتراضي المعتمد الحالي: 01151157100</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تسمية وتصنيف المحفظة:</label>
                  <input
                    type="text"
                    value={settings.walletLabel}
                    onChange={(e) => setSettings({ ...settings, walletLabel: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden"
                    placeholder="فودافون كاش / إتصالات كاش / إنستاباي"
                  />
                </div>
              </div>

              {/* Secondary Wallet or Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">رقم محفظة إضافي (اختياري):</label>
                  <input
                    type="text"
                    value={settings.secondaryWalletNumber || ''}
                    onChange={(e) => setSettings({ ...settings, secondaryWalletNumber: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-left focus:border-amber-500 focus:outline-hidden"
                    dir="ltr"
                    placeholder="010xxxxxxx"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">بيانات الحساب البنكي (إن وجد):</label>
                  <input
                    type="text"
                    value={settings.bankAccountDetails || ''}
                    onChange={(e) => setSettings({ ...settings, bankAccountDetails: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden"
                    placeholder="البنك الأهلي المصري - حساب رقم..."
                  />
                </div>
              </div>
            </div>

            {/* 2. PAYMENT METHODS TOGGLES */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-xs font-tajawal">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>التحكم في تفعيل أو إيقاف بوابات وطرق الدفع المعروضة للعميل:</span>
              </div>

              <div className="space-y-3 text-xs">
                
                {/* Wallet Toggle */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 block">المحافظ الإلكترونية (فودافون كاش / إنستاباي)</span>
                    <span className="text-[11px] text-slate-500">عرض رقم المحفظة وتعليمات التحويل للعملاء</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, isWalletEnabled: !settings.isWalletEnabled })}
                    className={`px-3 py-1 rounded-full font-black text-xs transition-all ${
                      settings.isWalletEnabled
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {settings.isWalletEnabled ? 'مفعلة بالكامل ✓' : 'معطلة ✕'}
                  </button>
                </div>

                {/* In-Person Meeting Toggle */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 block">المقابلة المباشرة والدفع اليدوي (القاهرة والإسكندرية)</span>
                    <span className="text-[11px] text-slate-500">إتاحة حجز موعد مع المندوب وطباعة بطاقة التفويض</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, isCashMeetingEnabled: !settings.isCashMeetingEnabled })}
                    className={`px-3 py-1 rounded-full font-black text-xs transition-all ${
                      settings.isCashMeetingEnabled
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {settings.isCashMeetingEnabled ? 'مفعلة بالكامل ✓' : 'معطلة ✕'}
                  </button>
                </div>

                {/* Credit Card Gateways Toggle (Notice until contracted) */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">بوابات الدفع الإلكتروني المباشر (فيزا وماستركارد / ميزة)</span>
                      <span className="text-[11px] text-slate-500">الربط مع بوابات الدفع البنكية (فواتير، فوري، بايموب)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, isCreditCardGatewayEnabled: !settings.isCreditCardGatewayEnabled })}
                      className={`px-3 py-1 rounded-full font-black text-xs transition-all ${
                        settings.isCreditCardGatewayEnabled
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {settings.isCreditCardGatewayEnabled ? 'مفعلة (جاهزة) ✓' : 'معطلة (قيد التعاقد) ⏳'}
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">الرسالة التوضيحية للعميل عند اختيار البطاقات:</label>
                    <input
                      type="text"
                      value={settings.creditCardGatewayNotice}
                      onChange={(e) => setSettings({ ...settings, creditCardGatewayNotice: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] text-slate-800"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* 3. CANCELLATION PENALTY & LOCATIONS POLICY */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-xs font-tajawal">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>سياسة المواقع وبند الـ 20% مصاريف إدارية للطلبات الملغاة:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">نسبة المصاريف الإدارية (%):</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={settings.cancellationPenaltyPercent}
                      onChange={(e) => setSettings({ ...settings, cancellationPenaltyPercent: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-black text-slate-900"
                      min={0}
                      max={100}
                    />
                    <span className="font-bold text-slate-600">%</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">نص إشعار المواقع الجغرافية (القاهرة والإسكندرية):</label>
                  <input
                    type="text"
                    value={settings.inPersonLocationsNotice}
                    onChange={(e) => setSettings({ ...settings, inPersonLocationsNotice: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">صيغة البند القانوني في بطاقة الموعد:</label>
                <textarea
                  rows={2}
                  value={settings.penaltyWarningClause}
                  onChange={(e) => setSettings({ ...settings, penaltyWarningClause: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                إغلاق
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ ونشر التعديلات'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
