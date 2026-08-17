import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, ShieldCheck, AlertCircle, Mail, CheckCircle, KeyRound, ArrowRight, Lock } from 'lucide-react';

const InputField = ({ label, type = "text", value, onChange, placeholder = "", dir = "rtl", maxLength }: any) => (
  <div className="relative mb-4">
    <input
      type={type} value={value} onChange={onChange} dir={dir} required maxLength={maxLength}
      className="peer w-full px-4 pt-6 pb-2 rounded-xl border-2 border-slate-200 bg-slate-50/50 outline-none transition-all duration-300 focus:border-amber-500 focus:bg-white placeholder-transparent text-slate-800"
      placeholder={placeholder || label}
    />
    <label className={`absolute right-4 top-4 text-slate-400 text-sm transition-all duration-300 pointer-events-none
      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs 
      peer-focus:text-amber-600 ${value ? 'top-1 text-xs text-amber-600' : ''}`}>
      {label}
    </label>
  </div>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.requiresVerification) {
        setRequiresVerification(true);
        if (data.devOtp) {
          setSuccessMsg(`حسابك غير مفعل بعد. (رمز التحقق الخاص بك هو: ${data.devOtp})`);
          setOtpCode(data.devOtp);
        } else {
          setSuccessMsg('حسابك غير مفعل بعد. لقد أرسلنا رمز تحقق سري إلى بريدك الإلكتروني.');
        }
      } else if (data.success) {
        login(data.user);
        if (data.isAdmin || data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني أولاً');
      return;
    }
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        if (data.devOtp) {
          setSuccessMsg(`إذا كان الحساب مسجلاً لدينا، فقد تم إرسال الرمز. (رمز الاستعادة: ${data.devOtp})`);
          setOtpCode(data.devOtp);
        } else {
          setSuccessMsg('إذا كان الحساب مسجلاً لدينا، فقد أرسلنا رمز إعادة التعيين (6 أرقام) إلى بريدك الإلكتروني.');
        }
        setIsForgotPassword(false);
        setIsResetMode(true);
      } else {
        setError(data.error || 'حدث خطأ أثناء إرسال رمز الاستعادة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }
    if (newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف أو أرقام على الأقل');
      return;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('تم تعيين كلمة المرور الجديدة بنجاح! يمكنك الآن تسجيل الدخول.');
        setIsResetMode(false);
        setIsForgotPassword(false);
        setOtpCode('');
        setPassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('رمز التحقق يجب أن يتكون من 6 أرقام');
      return;
    }
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode })
      });
      const data = await res.json();
      if (data.success) {
        login(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'رمز التحقق غير صحيح');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        if (data.devOtp) {
          setSuccessMsg(`تم إنشاء رمز تحقق جديد: ${data.devOtp}`);
          setOtpCode(data.devOtp);
        } else {
          setSuccessMsg('تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.');
        }
      } else {
        setError(data.error || 'حدث خطأ أثناء إعادة الإرسال');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Luxury Left Banner (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay transition-transform duration-1000 hover:scale-105"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 z-10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] z-10 animate-pulse"></div>
        
        <div className="relative z-20 text-center px-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-sm shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <Sparkles className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-tajawal font-black text-white mb-6 leading-tight">
            مرحباً بعودتك إلى <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-200 to-indigo-500">منصتك الفاخرة</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto mb-10">
            سجل دخولك الآن لمتابعة أداء منصتك، وإدارة محتواك، وتقديم أفضل تجربة تعليمية لطلابك.
          </p>
          
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl backdrop-blur-sm text-right">
              <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300 font-medium text-sm">اتصال آمن ومشفر 100% لحماية بياناتك.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 xl:p-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="mb-8 text-center lg:text-right">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                {requiresVerification ? (
                  <Mail className="w-6 h-6 text-amber-500" />
                ) : isResetMode || isForgotPassword ? (
                  <KeyRound className="w-6 h-6 text-amber-600" />
                ) : (
                  <LogIn className="w-6 h-6 text-indigo-950" />
                )}
              </div>
              <h1 className="text-3xl font-black text-slate-900 font-tajawal">
                {requiresVerification 
                  ? 'تأكيد الحساب' 
                  : isResetMode 
                  ? 'تعيين كلمة المرور' 
                  : isForgotPassword 
                  ? 'استعادة كلمة المرور' 
                  : 'تسجيل الدخول'}
              </h1>
            </div>
            <p className="text-slate-500 text-sm">
              {requiresVerification 
                ? 'أدخل الرمز السري المكون من 6 أرقام المرسل إلى بريدك لتفعيل حسابك.' 
                : isResetMode 
                ? 'أدخل رمز الاستعادة المرسل إلى بريدك وكلمة المرور الجديدة.' 
                : isForgotPassword 
                ? 'أدخل بريدك الإلكتروني وسنرسل لك رمزاً لتغيير كلمة المرور.' 
                : 'أدخل بياناتك للوصول إلى لوحة التحكم الخاصة بك.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-2 border border-red-100 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 text-sm flex items-start gap-2 border border-emerald-100 animate-in fade-in">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </div>
          )}

          {/* Regular Login Form */}
          {!requiresVerification && !isForgotPassword && !isResetMode ? (
            <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <InputField 
                label="البريد الإلكتروني" 
                type="email" 
                value={email} 
                onChange={(e: any) => setEmail(e.target.value)} 
                dir="ltr" 
              />
              
              <div>
                <InputField 
                  label="كلمة المرور" 
                  type="password" 
                  value={password} 
                  onChange={(e: any) => setPassword(e.target.value)} 
                  dir="ltr" 
                />
                
                {/* Forgot Password Link - Positioned Clearly Below Password */}
                <div className="flex justify-between items-center -mt-2 mb-6 px-1">
                  <span className="text-xs text-slate-400">تأكد من كتابة كلمة المرور بدقة</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setIsForgotPassword(true);
                    }} 
                    className="text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1"
                  >
                    <KeyRound className="w-4 h-4" />
                    نسيت كلمة المرور؟
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-950 text-white font-bold py-4 rounded-xl hover:bg-indigo-900 transition-all duration-300 shadow-lg hover:shadow-[0_10px_20px_rgba(49,46,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التحقق...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    تسجيل الدخول
                  </>
                )}
              </button>
            </form>
          ) : isForgotPassword ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-amber-50/70 border border-amber-200/60 p-4 rounded-xl mb-5 text-amber-800 text-xs leading-relaxed">
                اكتب بريدك الإلكتروني المسجل لدينا، وسنقوم بإرسال رمز تحقق سري فوري لاستعادة حسابك.
              </div>

              <InputField
                 label="البريد الإلكتروني المسجل"
                 type="email"
                 value={email}
                 onChange={(e: any) => setEmail(e.target.value)}
                 dir="ltr"
               />

               <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black py-4 rounded-xl hover:from-amber-500 hover:to-amber-400 transition-all duration-300 shadow-lg text-lg mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    جاري الإرسال...
                  </span>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    إرسال رمز الاستعادة
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
                <button 
                  type="button" 
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setIsForgotPassword(false);
                  }} 
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4" />
                  العودة لتسجيل الدخول
                </button>

                <button 
                  type="button" 
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setIsForgotPassword(false);
                    setIsResetMode(true);
                  }} 
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  لدي رمز بالفعل
                </button>
              </div>
            </form>
          ) : isResetMode ? (
            /* Reset Password Form with OTP Code & New Password */
            <form onSubmit={handleResetPassword} className="animate-in fade-in zoom-in-95 duration-500">
              <div className="mb-4">
                <label className="block text-right mb-2 text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-amber-500 outline-none text-slate-800"
                  placeholder="name@example.com"
                  dir="ltr"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-right mb-2 text-sm font-bold text-slate-700">رمز الاستعادة (6 أرقام)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode} 
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl font-black tracking-[0.5em] px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 bg-white outline-none transition-all text-slate-900"
                  placeholder="------"
                  dir="ltr"
                  required
                />
              </div>

              <InputField
                 label="كلمة المرور الجديدة (6 أحرف أو أكثر)"
                 type="password"
                 value={newPassword}
                 onChange={(e: any) => setNewPassword(e.target.value)}
                 dir="ltr"
               />

              <InputField
                 label="تأكيد كلمة المرور الجديدة"
                 type="password"
                 value={confirmPassword}
                 onChange={(e: any) => setConfirmPassword(e.target.value)}
                 dir="ltr"
               />

               <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-950 text-white font-bold py-4 rounded-xl hover:bg-indigo-900 transition-all duration-300 shadow-lg text-lg mt-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التعيين...
                  </span>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    تعيين كلمة المرور الجديدة
                  </>
                )}
              </button>

              <div className="mt-5 text-center">
                <button 
                  type="button" 
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setIsResetMode(false); 
                    setIsForgotPassword(false);
                  }} 
                  className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowRight className="w-4 h-4" />
                  إلغاء والعودة لتسجيل الدخول
                </button>
              </div>
            </form>
          ) : (
            /* OTP Verification for unverified accounts */
            <form onSubmit={handleVerifyOtp} className="animate-in fade-in zoom-in-95 duration-500 text-center">
                <div className="relative mb-6 mt-4">
                  <input
                    type="text" 
                    maxLength={6}
                    value={otpCode} 
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl font-black tracking-[1em] px-4 py-4 rounded-xl border-2 border-slate-200 bg-white outline-none transition-all focus:border-amber-500 shadow-inner text-slate-900"
                    placeholder="------"
                    dir="ltr"
                    required
                  />
                </div>

                <div className="flex justify-between items-center mb-6 px-2">
                  <button 
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-amber-600 hover:text-amber-700 font-bold transition-colors text-sm underline underline-offset-4"
                  >
                    لم يصلك الرمز؟ أعد الإرسال
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setRequiresVerification(false);
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-slate-500 hover:text-slate-700 font-bold text-sm"
                  >
                    تغيير البريد
                  </button>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 font-bold py-4 rounded-xl hover:shadow-[0_10px_20px_rgba(251,191,36,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-lg text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                      جاري المعالجة...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      تأكيد وتفعيل الحساب
                    </>
                  )}
                </button>
            </form>
          )}

          {!requiresVerification && !isForgotPassword && !isResetMode && (
            <div className="mt-10 text-center text-slate-500 font-medium border-t border-slate-200 pt-6">
              ليس لديك حساب بعد؟ <Link to="/register" className="text-amber-600 hover:text-amber-700 font-bold border-b-2 border-transparent hover:border-amber-600 pb-1 transition-all">ابدأ بإنشاء حساب فاخر</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
