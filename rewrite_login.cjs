const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Just doing simple string replacements without complex template literals

code = code.replace(
  "const [error, setError] = useState('');",
  "const [error, setError] = useState('');\n  const [isForgotPassword, setIsForgotPassword] = useState(false);\n  const [isResetMode, setIsResetMode] = useState(false);\n  const [newPassword, setNewPassword] = useState('');"
);

const newFuncs = `
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
        setSuccessMsg('إذا كان الحساب موجوداً، فقد تم إرسال رمز استعادة إلى بريدك الإلكتروني.');
        setIsForgotPassword(false);
        setIsResetMode(true);
      } else {
        setError(data.error || 'حدث خطأ أثناء إرسال الرابط');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6 || newPassword.length < 6) {
      setError('يرجى التأكد من إدخال الرمز المكون من 6 أرقام وكلمة مرور من 6 أحرف على الأقل');
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
        setSuccessMsg('تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.');
        setIsResetMode(false);
        setOtpCode('');
        setPassword('');
        setNewPassword('');
      } else {
        setError(data.error || 'حدث خطأ أثناء تغيير كلمة المرور');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };
`;

code = code.replace("const handleVerifyOtp = async", newFuncs + "\n  const handleVerifyOtp = async");

code = code.replace(
  "{requiresVerification ? 'تأكيد الحساب' : 'تسجيل الدخول'}",
  "{requiresVerification ? 'تأكيد الحساب' : isResetMode ? 'تعيين كلمة مرور جديدة' : isForgotPassword ? 'نسيت كلمة المرور' : 'تسجيل الدخول'}"
);

code = code.replace(
  "{requiresVerification ? 'أدخل الرمز السري المرسل إلى بريدك لتفعيل حسابك.' : 'أدخل بياناتك للوصول إلى لوحة التحكم الخاصة بك'}",
  "{requiresVerification ? 'أدخل الرمز السري المرسل إلى بريدك لتفعيل حسابك.' : isResetMode ? 'أدخل الرمز المرسل إلى بريدك وكلمة المرور الجديدة' : isForgotPassword ? 'أدخل بريدك الإلكتروني وسنرسل لك رمزاً لاستعادة حسابك' : 'أدخل بياناتك للوصول إلى لوحة التحكم الخاصة بك'}"
);

code = code.replace(
  "{!requiresVerification ? (",
  "{!requiresVerification && !isForgotPassword && !isResetMode ? ("
);

const forgotLink = `
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">نسيت كلمة المرور؟</button>
              </div>
            </form>
          ) : isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <InputField
                 label="البريد الإلكتروني"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 dir="ltr"
               />
               <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-950 text-white font-bold py-4 rounded-xl hover:bg-indigo-900 transition-all duration-300 shadow-lg text-lg mt-4"
              >
                {loading ? "جاري الإرسال..." : "إرسال رمز الاستعادة"}
              </button>
              <div className="mt-4 text-center">
                <button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">العودة لتسجيل الدخول</button>
              </div>
            </form>
          ) : isResetMode ? (
            <form onSubmit={handleResetPassword} className="animate-in fade-in zoom-in-95 duration-500 text-center">
              <div className="relative mb-4 mt-4">
                <label className="block text-right mb-2 text-sm font-bold text-slate-700">رمز الاستعادة المرسل للإيميل</label>
                <input
                  type="text"
                   maxLength={6}
                  value={otpCode} 
                  onChange={e => setOtpCode(e.target.value.replace(/\\D/g, ''))}
                  className="w-full text-center text-2xl font-black tracking-[0.5em] px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none transition-all"
                  placeholder="------"
                  dir="ltr"
                  required
                />
              </div>
              <InputField
                 label="كلمة المرور الجديدة"
                 type="password"
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 dir="ltr"
               />
               <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-lg text-lg mt-4"
              >
                {loading ? "جاري التغيير..." : "تعيين كلمة المرور الجديدة"}
              </button>
              <div className="mt-4 text-center">
                <button type="button" onClick={() => {setIsResetMode(false); setIsForgotPassword(false);}} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">العودة لتسجيل الدخول</button>
              </div>
            </form>
          ) : (
`;

code = code.replace(
  "              </button>\n            </form>\n          ) : (",
  "              </button>" + forgotLink
);

code = code.replace(
  "{!requiresVerification && (",
  "{!requiresVerification && !isForgotPassword && !isResetMode && ("
);

fs.writeFileSync('src/pages/Login.tsx', code);
console.log("Rewrite done!");
