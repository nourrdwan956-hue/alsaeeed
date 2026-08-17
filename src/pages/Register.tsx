import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, ChevronLeft, ChevronRight, CheckCircle, 
  AlertCircle, Phone, MapPin, Monitor, Check, Sparkles, ShieldCheck, Mail, ShieldQuestion
} from 'lucide-react';
import { governorates, citiesByGovernorate } from '../data/egypt-locations';

const InputField = ({ label, type = "text", value, onChange, error, placeholder = "", dir = "rtl" }: any) => (
  <div className="relative mb-6">
    <input
      type={type} value={value} onChange={onChange} dir={dir}
      className={`peer w-full px-4 pt-6 pb-2 rounded-xl border-2 bg-slate-50/50 outline-none transition-all duration-300 placeholder-transparent
        ${error ? 'border-red-400 focus:border-red-500 focus:bg-white' : 'border-slate-200 focus:border-amber-500 focus:bg-white'}`}
      placeholder={placeholder || label}
    />
    <label className={`absolute right-4 top-4 text-slate-400 text-sm transition-all duration-300 pointer-events-none
      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs 
      peer-focus:text-amber-600 ${value ? 'top-1 text-xs text-amber-600' : ''}`}>
      {label}
    </label>
    {error && <span className="absolute -bottom-5 right-1 text-red-500 text-xs font-bold">{error}</span>}
  </div>
);

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', phone: '', whatsapp: '',
    useSamePhone: false, governorate: '', region: '', platformIdea: '', additionalInfo: ''
  });
  const [otpCode, setOtpCode] = useState('');
  
  // Captcha State
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Generate initial captcha
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setCaptcha({ 
      num1: Math.floor(Math.random() * 10) + 1, 
      num2: Math.floor(Math.random() * 10) + 1, 
      answer: '' 
    });
  };

  useEffect(() => {
    if (formData.useSamePhone) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [formData.useSamePhone, formData.phone]);

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'الاسم مطلوب'; isValid = false;
      } else {
        const nameParts = formData.name.trim().split(/\s+/);
        if (nameParts.length < 4) {
          newErrors.name = 'يرجى إدخال الاسم رباعي (4 مقاطع على الأقل)'; isValid = false;
        }
      }
      if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = 'بريد إلكتروني غير صالح'; isValid = false;
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'; isValid = false;
      }
    }

    if (currentStep === 2) {
      const phoneRegex = /^(010|011|012|015)\d{8}$/;
      if (!formData.phone || !phoneRegex.test(formData.phone)) {
        newErrors.phone = 'رقم هاتف مصري غير صالح (يجب أن يكون 11 رقم ويبدأ بـ 010, 011, 012, 015)'; isValid = false;
      }
      if (!formData.whatsapp || !phoneRegex.test(formData.whatsapp)) {
        newErrors.whatsapp = 'رقم واتساب مصري غير صالح'; isValid = false;
      }
    }

    if (currentStep === 3) {
      if (!formData.governorate) { newErrors.governorate = 'يرجى اختيار المحافظة'; isValid = false; }
      if (!formData.region) { newErrors.region = 'يرجى اختيار المنطقة / المدينة'; isValid = false; }
    }

    if (currentStep === 4) {
      if (!formData.platformIdea.trim()) { newErrors.platformIdea = 'يرجى كتابة فكرة المنصة أو اسمها'; isValid = false; }
      
      // Captcha Validation
      const expectedAnswer = captcha.num1 + captcha.num2;
      if (parseInt(captcha.answer) !== expectedAnswer) {
        newErrors.captcha = 'إجابة التحقق البشري غير صحيحة'; 
        isValid = false;
        generateCaptcha(); // Reset if wrong
        setCaptcha(prev => ({...prev, answer: ''}));
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setLoading(true); setServerError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.requiresVerification) {
        setStep(5); // Go to OTP Step
        if (data.devOtp) {
          setSuccessMsg(`تم إنشاء حسابك بنجاح! (رمز التحقق الخاص بك هو: ${data.devOtp})`);
          setOtpCode(data.devOtp);
        } else {
          setSuccessMsg('تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح!');
        }
      } else if (data.success) {
        login(data.user);
        navigate('/dashboard');
      } else {
        setServerError(data.error || 'حدث خطأ أثناء التسجيل');
      }
    } catch (err) {
      setServerError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setServerError('رمز التحقق يجب أن يتكون من 6 أرقام');
      return;
    }
    setLoading(true); setServerError(''); setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otpCode })
      });
      const data = await res.json();
      if (data.success) {
        login(data.user);
        navigate('/dashboard');
      } else {
        setServerError(data.error || 'رمز التحقق غير صحيح');
      }
    } catch (err) {
      setServerError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true); setServerError(''); setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (data.success) {
        if (data.devOtp) {
          setSuccessMsg(`تم إنشاء رمز تحقق جديد: ${data.devOtp}`);
          setOtpCode(data.devOtp);
        } else {
          setSuccessMsg('تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني.');
        }
      } else {
        setServerError(data.error || 'حدث خطأ أثناء إعادة الإرسال');
      }
    } catch (err) {
      setServerError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Luxury Left Banner */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-1000 hover:scale-105"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 z-10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] z-10 animate-pulse"></div>
        
        <div className="relative z-20 text-center px-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-8 backdrop-blur-sm shadow-[0_0_30px_rgba(251,191,36,0.15)]">
            <Sparkles className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-tajawal font-black text-white mb-6 leading-tight">
            بوابتك نحو <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-200 to-amber-600">التميز التعليمي</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto mb-10">
            انضم إلى النخبة وابدأ رحلتك في امتلاك منصة تعليمية فاخرة تليق بحجم طموحاتك وبجودة محتواك.
          </p>
          
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm text-right">
              <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300 font-medium text-sm">بياناتك مشفرة ومحفوظة بأعلى معايير الأمان العالمية.</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm text-right">
              <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <span className="text-slate-300 font-medium text-sm">نحن نراعي أدق التفاصيل لضمان تجربة مستخدم لا تُنسى.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-20 overflow-y-auto bg-slate-50 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="mb-10 text-center lg:text-right">
            <h1 className="text-3xl font-black text-slate-900 mb-2 font-tajawal">إنشاء حساب فاخر</h1>
            <p className="text-slate-500">أكمل الخطوات التالية للبدء في تجهيز منصتك</p>
          </div>

          {/* Stepper */}
          {step < 5 && (
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-200 -z-10 rounded-full"></div>
              <div className="absolute right-0 top-1/2 h-1 bg-gradient-to-r from-amber-400 to-amber-600 -z-10 rounded-full transition-all duration-700 ease-in-out" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-4 border-slate-50 ${
                  step > num 
                    ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.4)]' 
                    : step === num 
                      ? 'bg-indigo-950 text-white scale-110 shadow-lg' 
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
              ))}
            </div>
          )}

          {serverError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-2 border border-red-100 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{serverError}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-2 border border-emerald-100 animate-in fade-in">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={step === 4 ? handleSubmit : step === 5 ? handleVerifyOtp : (e) => { e.preventDefault(); handleNext(); }}>
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-forwards">
                <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-indigo-950 font-tajawal">البيانات الأساسية</h3>
                    <p className="text-xs text-slate-500">خطوة 1 من 4</p>
                  </div>
                </div>
                <InputField label="الاسم رباعي *" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} error={errors.name} />
                <InputField label="البريد الإلكتروني *" type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} error={errors.email} dir="ltr" />
                <InputField label="كلمة المرور *" type="password" value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} error={errors.password} dir="ltr" />
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-forwards">
                <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-indigo-950 font-tajawal">أرقام التواصل</h3>
                    <p className="text-xs text-slate-500">خطوة 2 من 4</p>
                  </div>
                </div>
                <InputField label="رقم الهاتف (مصري) *" type="tel" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} error={errors.phone} dir="ltr" />
                
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-slate-100 mb-6 hover:border-amber-200 transition-colors cursor-pointer group" onClick={() => setFormData({...formData, useSamePhone: !formData.useSamePhone})}>
                  <div className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-300 ${formData.useSamePhone ? 'bg-amber-500 scale-110 shadow-sm' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                    {formData.useSamePhone && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-sm font-bold text-slate-700">رقم الواتساب هو نفس رقم الاتصال</span>
                </div>

                {!formData.useSamePhone && (
                  <InputField label="رقم الواتساب *" type="tel" value={formData.whatsapp} onChange={(e: any) => setFormData({...formData, whatsapp: e.target.value})} error={errors.whatsapp} dir="ltr" />
                )}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-forwards">
                <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-indigo-950 font-tajawal">الموقع الجغرافي</h3>
                    <p className="text-xs text-slate-500">خطوة 3 من 4</p>
                  </div>
                </div>
                
                <div className="relative mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">المحافظة *</label>
                  <select 
                    value={formData.governorate}
                    onChange={e => setFormData({...formData, governorate: e.target.value, region: ''})}
                    className={`w-full px-4 py-4 rounded-xl border-2 bg-slate-50/50 outline-none transition-all ${errors.governorate ? 'border-red-400 focus:bg-white' : 'border-slate-200 focus:border-amber-500 focus:bg-white'}`}
                  >
                    <option value="">اختر المحافظة...</option>
                    {governorates.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                  </select>
                  {errors.governorate && <span className="absolute -bottom-5 right-1 text-red-500 text-xs font-bold">{errors.governorate}</span>}
                </div>

                <div className="relative mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">المدينة / المنطقة *</label>
                  <select 
                    value={formData.region}
                    onChange={e => setFormData({...formData, region: e.target.value})}
                    disabled={!formData.governorate}
                    className={`w-full px-4 py-4 rounded-xl border-2 outline-none transition-all ${errors.region ? 'border-red-400 focus:bg-white bg-slate-50/50' : 'border-slate-200 focus:border-amber-500 focus:bg-white'} ${!formData.governorate ? 'bg-slate-100 cursor-not-allowed opacity-60' : 'bg-slate-50/50'}`}
                  >
                    <option value="">اختر المنطقة...</option>
                    {formData.governorate && citiesByGovernorate[formData.governorate]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.region && <span className="absolute -bottom-5 right-1 text-red-500 text-xs font-bold">{errors.region}</span>}
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-forwards">
                <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-indigo-950 font-tajawal">تفاصيل المنصة والتحقق</h3>
                    <p className="text-xs text-slate-500">الخطوة الأخيرة</p>
                  </div>
                </div>
                
                <div className="relative mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">اسم المنصة أو فكرتها *</label>
                  <input
                    type="text" value={formData.platformIdea} onChange={e => setFormData({...formData, platformIdea: e.target.value})}
                    className={`w-full px-4 py-4 rounded-xl border-2 bg-slate-50/50 outline-none transition-all ${errors.platformIdea ? 'border-red-400 focus:border-red-500 focus:bg-white' : 'border-slate-200 focus:border-amber-500 focus:bg-white'}`}
                    placeholder="مثال: منصة النور التعليمية للغة العربية"
                  />
                  {errors.platformIdea && <span className="absolute -bottom-5 right-1 text-red-500 text-xs font-bold">{errors.platformIdea}</span>}
                </div>

                <div className="relative mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">متطلبات إضافية (اختياري)</label>
                  <textarea 
                    value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} rows={3}
                    className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 outline-none transition-all focus:border-amber-500 focus:bg-white resize-none"
                    placeholder="اكتب هنا أي تفاصيل أخرى..."
                  ></textarea>
                </div>

                {/* Human Verification (Math Captcha) */}
                <div className={`relative p-5 rounded-xl border-2 transition-all duration-300 ${errors.captcha ? 'bg-red-50 border-red-200' : 'bg-slate-100 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <ShieldQuestion className="w-5 h-5 text-indigo-500" />
                      التحقق البشري
                    </div>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold">مطلوب</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-grow flex items-center justify-center bg-white p-3 rounded-lg border border-slate-200 font-black text-xl text-indigo-950 tracking-wider shadow-inner" dir="ltr">
                      {captcha.num1} + {captcha.num2} = ?
                    </div>
                    <div className="w-1/3">
                      <input 
                        type="number" 
                        value={captcha.answer}
                        onChange={(e) => setCaptcha({...captcha, answer: e.target.value})}
                        className={`w-full text-center px-2 py-3 rounded-lg border-2 outline-none font-bold text-lg transition-all ${errors.captcha ? 'border-red-400 focus:border-red-500 bg-white' : 'border-slate-300 focus:border-indigo-500 bg-white'}`}
                        placeholder="الناتج"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  {errors.captcha && <p className="text-red-500 text-xs font-bold mt-2 text-center">{errors.captcha}</p>}
                </div>
              </div>
            )}

            {/* STEP 5 - OTP Verification */}
            {step === 5 && (
              <div className="animate-in fade-in zoom-in-95 duration-500 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 text-amber-500 rounded-full mb-6 relative">
                  <div className="absolute inset-0 border-4 border-amber-200 rounded-full animate-ping opacity-20"></div>
                  <Mail className="w-10 h-10 relative z-10" />
                </div>
                <h3 className="text-2xl font-black text-indigo-950 font-tajawal mb-2">تأكيد البريد الإلكتروني</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  لقد أرسلنا رمز تحقق سري من 6 أرقام إلى بريدك <strong className="text-indigo-950 block mt-1" dir="ltr">{formData.email}</strong>
                  <br />
                  <span className="text-sm font-bold text-amber-600">تأكد من مراجعة صندوق الرسائل الأساسية (Inbox).</span>
                </p>

                <div className="relative mb-8 max-w-xs mx-auto">
                  <input
                    type="text" 
                    maxLength={6}
                    value={otpCode} 
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl font-black tracking-[1em] px-4 py-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 outline-none transition-all focus:border-amber-500 focus:bg-white shadow-inner"
                    placeholder="------"
                    dir="ltr"
                  />
                </div>

                <button 
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-slate-500 hover:text-amber-600 font-bold transition-colors text-sm underline underline-offset-4 mb-4"
                >
                  لم يصلك الرمز؟ أعد الإرسال
                </button>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 mt-10">
              {step > 1 && step < 5 && (
                <button 
                  type="button" onClick={handlePrev}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-slate-600 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              
              <button 
                type={step >= 4 ? 'submit' : 'button'}
                onClick={step < 4 ? handleNext : undefined}
                disabled={loading}
                className={`flex-grow flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg text-lg hover:-translate-y-1 active:translate-y-0 ${
                  step >= 4 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 hover:shadow-[0_10_20px_rgba(251,191,36,0.4)]' 
                    : 'bg-indigo-950 text-white hover:bg-indigo-900 hover:shadow-[0_10_20px_rgba(49,46,129,0.3)]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    جاري المعالجة...
                  </span>
                ) : step === 4 ? (
                  <>
                    <CheckCircle className="w-5 h-5" /> تأكيد وإنشاء الحساب
                  </>
                ) : step === 5 ? (
                  <>
                    <ShieldCheck className="w-5 h-5" /> تحقق واكتمل
                  </>
                ) : (
                  <>
                    متابعة <ChevronLeft className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {step < 5 && (
            <div className="mt-10 text-center text-slate-500 font-medium">
              لديك حساب بالفعل؟ <Link to="/login" className="text-amber-600 hover:text-amber-700 font-bold border-b-2 border-transparent hover:border-amber-600 pb-1 transition-all">تسجيل الدخول</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
