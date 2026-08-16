import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Smartphone, 
  Headphones, 
  CheckCircle, 
  Gem, 
  ArrowLeft, 
  ArrowUp,
  FileCheck2,
  Lock,
  Building2,
  MapPin,
  Search,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Crown,
  FileText,
  BadgeAlert,
  Loader2,
  ExternalLink,
  ChevronLeft,
  Scan,
  ShieldCheck,
  Award,
  Sparkles,
  Layers,
  Server,
  FileBadge
} from 'lucide-react';

const FadeInSection = ({ children, className = '', delay = 0 }: any) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      });
    }, { threshold: 0.1 });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Live Contract & Document Verification State
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/platforms')
      .then(res => res.json())
      .then(data => {
        setPlatforms(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching platforms", err);
        setLoading(false);
      });

    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerifyDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCodeInput.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);
    setVerificationError(null);

    try {
      const res = await fetch(`/api/public/verify-document?code=${encodeURIComponent(verifyCodeInput.trim())}`);
      const data = await res.json();
      if (res.ok && data.found) {
        setVerificationResult(data.data);
      } else {
        setVerificationError(data.message || 'لم يتم العثور على وثيقة مسجلة بهذا الرقم في سجلات التوثيق المركزية. يرجى مراجعة الرقم والمحاولة مجدداً.');
      }
    } catch (err) {
      setVerificationError('تعذر الاتصال بقاعدة بيانات التوثيق المركزية. يرجى المحاولة لاحقاً.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-slate-50 relative font-sans text-right" dir="rtl">
      
      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-8 left-8 z-50 bg-amber-500 text-slate-950 p-4 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all duration-500 hover:scale-110 hover:bg-amber-400 ${
          showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'
        }`}
        title="الصعود للأعلى"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      {/* 1. Sovereign Security Banner / Top Authority Ticker */}
      <div className="bg-slate-950 text-slate-300 py-3 px-4 border-b border-amber-500/30 text-xs font-tajawal">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-amber-400 font-black">المنظومة المؤسسية المركزية:</span>
            <span className="text-white font-bold">سجل توثيق المنصات التعليمية وحماية الملكية الفكرية والسيادة البرمجية</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>تشفير سيادي 256-Bit</span>
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Building2 className="w-4 h-4" />
              <span>مقابلات ميدانية رسمية: القاهرة والإسكندرية</span>
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-slate-300 font-mono font-bold bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">EGY-SAEED-GOV-2026</span>
          </div>
        </div>
      </div>

      {/* 2. Institutional Sovereign Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white min-h-[95vh] flex items-center justify-center overflow-hidden border-b-2 border-amber-500/40 py-24">
        {/* Background Grid and Security Watermark */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[650px] h-[650px] bg-indigo-600/20 rounded-full blur-[200px] pointer-events-none"></div>
        
        {/* Background Sovereign Emblem watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Crown className="w-[700px] h-[700px] text-white stroke-[0.4]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center">
          
          <FadeInSection delay={0}>
            <div className="inline-flex items-center gap-3 bg-slate-900/90 border-2 border-amber-400/50 px-6 py-2.5 rounded-full mb-8 backdrop-blur-md shadow-2xl shadow-amber-500/15">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-amber-200 text-xs sm:text-sm font-black tracking-wide font-tajawal">
                الهيئة الإدارية والتقنية لتأسيس وتمليك المنصات التعليمية الرسمية
              </span>
            </div>
          </FadeInSection>
          
          <FadeInSection delay={200}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-tajawal font-black mb-8 leading-tight drop-shadow-2xl">
              تأسيس وتمليك المنصات التعليمية <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-amber-400 to-amber-500">
                بأعلى درجات الحزم والسيادة البرمجية
              </span>
            </h1>
          </FadeInSection>
          
          <FadeInSection delay={400}>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light drop-shadow-md">
              منظومة رسمية مشددة لا تقبل التهاون: عقود قانونية ملزمة موثقة برقم مسلسل وباركود QR، تقنيات DRM لمنع تسريب وسرقة الفيديوهات، خوادم سحابية معزولة بالكامل، ومقابلات ميدانية رسمية وتسليم يدوي بمحافظتي القاهرة والإسكندرية.
            </p>
          </FadeInSection>

          {/* Quick Metrics of Sovereign Authority */}
          <FadeInSection delay={500}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-12 max-w-5xl w-full">
              <div className="bg-slate-900/95 border-2 border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 text-center transition-all shadow-xl">
                <span className="text-2xl sm:text-4xl font-black text-amber-400 font-tajawal block mb-1">100%</span>
                <span className="text-xs sm:text-sm text-slate-300 font-bold">حماية مشفرة ضد التسجيل والقرصنة</span>
              </div>
              <div className="bg-slate-900/95 border-2 border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 text-center transition-all shadow-xl">
                <span className="text-2xl sm:text-4xl font-black text-white font-tajawal block mb-1">عقد رسمـي</span>
                <span className="text-xs sm:text-sm text-slate-300 font-bold">موثق إلكترونياً برقم وحساب سيادي</span>
              </div>
              <div className="bg-slate-900/95 border-2 border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 text-center transition-all shadow-xl">
                <span className="text-2xl sm:text-4xl font-black text-emerald-400 font-tajawal block mb-1">محافظة 2</span>
                <span className="text-xs sm:text-sm text-slate-300 font-bold">تسليم ميداني بالقاهرة والإسكندرية</span>
              </div>
              <div className="bg-slate-900/95 border-2 border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 text-center transition-all shadow-xl">
                <span className="text-2xl sm:text-4xl font-black text-amber-300 font-tajawal block mb-1">سيرفر معزول</span>
                <span className="text-xs sm:text-sm text-slate-300 font-bold">قواعد بيانات مستقلة لكل معلم</span>
              </div>
            </div>
          </FadeInSection>
          
          <FadeInSection delay={600}>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md sm:max-w-none">
              
              <button
                onClick={() => navigate('/verify')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-base sm:text-lg px-8 py-4.5 rounded-2xl shadow-xl shadow-amber-500/25 hover:scale-105 transition-all cursor-pointer"
              >
                <Scan className="w-6 h-6 text-slate-950" />
                <span>التحقق عبر مسح الـ QR (الكاميرا)</span>
              </button>

              <a 
                href="#verify-portal" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border-2 border-amber-500/40 font-bold text-base sm:text-lg px-8 py-4.5 rounded-2xl shadow-xl hover:scale-105 transition-all"
              >
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <span>فحص كود الوثيقة يدوياً</span>
              </a>

              <a 
                href="#platforms" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 font-bold text-base sm:text-lg px-8 py-4.5 rounded-2xl transition-all"
              >
                <span>المنصات المتاحة للتمليك</span>
                <ArrowLeft className="w-5 h-5 text-amber-400" />
              </a>

            </div>
          </FadeInSection>

        </div>
      </section>

      {/* 3. Central Document & Contract Verification Portal (بوابة التحقق من الوثائق الرسمية) */}
      <section id="verify-portal" className="py-24 bg-slate-950 text-white relative border-b border-slate-800 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInSection>
            <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-12 border-2 border-amber-500/50 shadow-2xl space-y-8 relative overflow-hidden">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xl shadow-amber-500/20">
                    <FileBadge className="w-9 h-9" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-3xl font-black text-white font-tajawal">
                      بوابة التوثيق والتحقق الفوري من العقود والمواعيد
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      أدخل كود الوثيقة (مثل <code className="text-amber-300 font-mono font-bold">SA-2026-0001</code>) أو كود المقابلة الميدانية للتحقق اللحظي من الاعتماد.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/verify')}
                    className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>فتح الكاميرا</span>
                  </button>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    تشفير سيادي
                  </span>
                </div>
              </div>

              {/* Search Form */}
              <form onSubmit={handleVerifyDocument} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={verifyCodeInput}
                    onChange={(e) => setVerifyCodeInput(e.target.value)}
                    placeholder="اكتب رقم الوثيقة أو كود الموعد (مثال: SA-2026-0001 أو SEC-...)"
                    className="w-full px-5 py-4 bg-slate-900 border-2 border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm md:text-base font-mono transition-colors"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  disabled={isVerifying || !verifyCodeInput.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl text-base transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري الاستعلام في السجلات...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-5 h-5" />
                      <span>فحص الوثيقة الآن</span>
                    </>
                  )}
                </button>
              </form>

              {/* Result Box */}
              {verificationResult && (
                <div className="bg-slate-900/95 border-2 border-emerald-500/70 rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-white font-tajawal">
                          وثيقة معتمدة ومسجلة بالسجل المركزي
                        </h3>
                        <p className="text-xs text-emerald-400 font-bold">تم المطابقة والتأكيد الفوري من قاعدة البيانات السيادية</p>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-4 py-1.5 rounded-full text-xs font-black">
                      سارية المفعول ✓
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-xs mb-1 font-bold">نوع المستند:</span>
                      <strong className="text-amber-400 font-bold text-base">{verificationResult.documentType}</strong>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-xs mb-1 font-bold">رقم المستند / المرجع:</span>
                      <strong className="text-white font-mono font-bold text-base">{verificationResult.documentNumber}</strong>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-xs mb-1 font-bold">المنصة أو المشروع:</span>
                      <strong className="text-white font-bold text-base">{verificationResult.platformTitle}</strong>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-xs mb-1 font-bold">صادر باسم العميل:</span>
                      <strong className="text-slate-200 font-bold text-base">{verificationResult.customerName}</strong>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-xs mb-1 font-bold">حالة الاعتماد والسداد:</span>
                      <strong className="text-emerald-400 font-bold text-base">
                        {verificationResult.status === 'paid' || verificationResult.status === 'completed' ? 'معتمد ومسدد بالكامل' : 'قيد التنفيذ / جاري العمل'}
                      </strong>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-xs mb-1 font-bold">كود التوثيق المشفر:</span>
                      <strong className="text-amber-300 font-mono text-xs block truncate">{verificationResult.securityStamp}</strong>
                    </div>
                  </div>

                  <div className="pt-3 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800">
                    <span>جهة التوثيق: {verificationResult.sealAuthority}</span>
                    <span className="text-emerald-400 font-bold">ختم الاعتماد الفوري متوفر</span>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {verificationError && (
                <div className="bg-rose-950/50 border-2 border-rose-500/70 rounded-2xl p-6 text-rose-200 space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5 font-bold text-rose-400 text-base">
                    <AlertTriangle className="w-6 h-6" />
                    <span>تنبيه عدم المطابقة الرسمية</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-rose-200 font-medium">{verificationError}</p>
                </div>
              )}

            </div>
          </FadeInSection>
        </div>
      </section>

      {/* 4. Institutional Strict Discipline Charter (ميثاق الجدية والانضباط الصارم - لا مجال للهزار) */}
      <section className="py-24 bg-white relative border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 bg-slate-900 text-amber-400 border border-slate-800 px-4 py-1.5 rounded-full text-xs font-black">
                <BadgeAlert className="w-4 h-4 text-amber-400" />
                <span>ميثاق الانضباط والحزم التنفيذي</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-tajawal font-black text-slate-950">
                منظومة عمل مشددة تضمن حق الطرفين بكامل الجدية
              </h2>
              <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
                لا نعتمد الأساليب العشوائية؛ كل خطوة مدروسة وموثقة بعقود رسمية لضمان الملكية الفكرية للمعلم والاستثمار البرمجي للمنصة.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Pillar 1: Non-negotiable 20% Administrative Clause */}
            <FadeInSection delay={100}>
              <div className="bg-slate-900 text-white rounded-3xl p-8 border-2 border-amber-500/50 shadow-xl space-y-4 h-full flex flex-col justify-between hover:border-amber-400 transition-all">
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-amber-400 font-tajawal">شرط الجدية 20%</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    فور تأكيد طلب التمليك وحجز الخوادم وتكليف المندوبين، <strong>تُحسب نسبة 20% غير قابلة للرد</strong> كرسوم إدارية وحجز بنية تحتية في حال الإلغاء لضمان الجدية التامة.
                  </p>
                </div>
                <div className="bg-slate-950 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>بند ملزم قانونياً بعقد التمليك</span>
                </div>
              </div>
            </FadeInSection>

            {/* Pillar 2: DRM Screen Anti-Piracy Protection */}
            <FadeInSection delay={200}>
              <div className="bg-slate-900 text-white rounded-3xl p-8 border-2 border-slate-800 shadow-xl space-y-4 h-full flex flex-col justify-between hover:border-amber-500/50 transition-all">
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-950 text-amber-400 flex items-center justify-center font-black shadow-lg">
                    <Shield className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-white font-tajawal">حظر التسريب والقرصنة</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    تطبيق تقنيات DRM المتطورة لحظر مسجلات الشاشة (OBS وChrome Extensions) فوراً، مع إظهار <strong>علامة مائية متحركة برقم هاتف وتفاصيل الطالب</strong> لمنع التصوير الخارجي.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حماية 100% للمحتوى التعليمي</span>
                </div>
              </div>
            </FadeInSection>

            {/* Pillar 3: Official Field Handover Cairo & Alex */}
            <FadeInSection delay={300}>
              <div className="bg-slate-900 text-white rounded-3xl p-8 border-2 border-slate-800 shadow-xl space-y-4 h-full flex flex-col justify-between hover:border-amber-500/50 transition-all">
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-950 text-amber-400 flex items-center justify-center font-black shadow-lg">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-white font-tajawal">مقابلات وتسليم يدوي</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    إتاحة المقابلة الشخصية المباشرة مع مندوب الإدارة الرسمي بمحافظتي <strong>القاهرة والإسكندرية</strong> لاستلام العقد ورقية وإيصال السداد المالي المختوم.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-amber-300 font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>تنسيق رسمي بمواعيد وأكواد أمان</span>
                </div>
              </div>
            </FadeInSection>

            {/* Pillar 4: Isolated Server Infrastructure */}
            <FadeInSection delay={400}>
              <div className="bg-slate-900 text-white rounded-3xl p-8 border-2 border-slate-800 shadow-xl space-y-4 h-full flex flex-col justify-between hover:border-amber-500/50 transition-all">
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-950 text-amber-400 flex items-center justify-center font-black shadow-lg">
                    <Server className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-white font-tajawal">خوادم سحابية معزولة</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    تجهيز بيئة سحابية خاصة وقاعدة بيانات مستقلة تماماً لكل منصة، دون مشاركة الموارد مع أي جهة أخرى لضمان السرعة المطلقة والسيادة البرمجية.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>استضافة مستقرة فائقة الأداء</span>
                </div>
              </div>
            </FadeInSection>

          </div>
        </div>
      </section>

      {/* 5. Official State-Grade Digital Clearance Hub (01151157100 Wallet) */}
      <section className="py-20 bg-slate-950 text-white relative border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInSection>
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-2 border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
              
              <div className="space-y-4 max-w-xl text-right">
                <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>منظومة المقاصة والتحويل المالي المعتمد</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black font-tajawal text-white">
                  الرقم الرسمي المعتمد للمحافظ الإلكترونية وإنستاباي
                </h2>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-light">
                  يتم سداد دفعة الجدية أو الفواتير الرسمية عبر المحفظة المركزية المعتمدة للمنظومة، وتصدر الفاتورة الإلكترونية الموثقة فور تحويل المبلغ.
                </p>
              </div>

              <div className="bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 w-full md:w-auto text-center space-y-4 shadow-2xl">
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-widest">رقم التحويل المالي المعتمد:</span>
                <div className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-widest bg-slate-950 py-3.5 px-6 rounded-2xl border border-slate-800">
                  01151157100
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('01151157100');
                    setCopiedWallet(true);
                    setTimeout(() => setCopiedWallet(false), 2000);
                  }}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedWallet ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedWallet ? 'تم نسخ الرقم بنجاح!' : 'نسخ رقم المحفظة الرسمي'}</span>
                </button>
                <span className="text-[11px] text-emerald-400 block font-bold">
                  فودافون كاش • إنستاباي • إتصالات كاش • أورنج كاش
                </span>
              </div>

            </div>
          </FadeInSection>
        </div>
      </section>

      {/* 6. Platforms Catalog (قائمة المنصات الرسمية المعتمدة) */}
      <section id="platforms" className="py-32 bg-slate-950 relative overflow-hidden scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInSection>
            <div className="text-center mb-24">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-300 text-xs font-bold mb-4">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>النماذج والأنظمة المتاحة للتمليك الفوري</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-tajawal font-black text-white mb-6">المنصات التعليمية المعتمدة</h2>
              <div className="w-32 h-1.5 bg-gradient-to-r from-amber-600 to-amber-400 mx-auto rounded-full mb-8 shadow-[0_0_15px_rgba(251,191,36,0.6)]"></div>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light">
                أنظمة تعليمية مكتملة ومجهزة بسيرفرات معزولة وتقنيات حماية DRM ضد التسجيل
              </p>
            </div>
          </FadeInSection>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.5)]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {platforms.length > 0 ? platforms.map((platform, i) => {
                const isSoldOut = platform.isSoldOut || (platform.soldCopies || 0) >= platform.totalCopies;
                const fallbackImg = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800";
                
                return (
                  <FadeInSection key={platform.id} delay={i * 150}>
                    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(251,191,36,0.2)] transition-all duration-500 group flex flex-col relative h-full">
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex items-center justify-center">
                          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white font-black text-3xl px-12 py-5 rounded-full shadow-2xl transform -rotate-12 border-4 border-red-400/50 tracking-wider">
                            تم الحجز بالكامل
                          </div>
                        </div>
                      )}
                      
                      <div className="h-72 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity"></div>
                        <img 
                          src={platform.imageUrl || fallbackImg} 
                          alt={platform.title}
                          onError={(e) => { e.currentTarget.src = fallbackImg; }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute top-6 right-6 bg-slate-950/90 backdrop-blur-md px-5 py-2 rounded-full text-xs font-bold text-amber-400 border border-amber-500/30 shadow-xl z-20">
                          {platform.category || 'نظام معتمد'}
                        </div>
                      </div>
                      
                      <div className="p-8 sm:p-10 flex-grow flex flex-col relative z-20 -mt-10">
                        <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 font-tajawal group-hover:text-amber-400 transition-colors drop-shadow-lg">{platform.title}</h3>
                        <p className="text-slate-400 mb-8 flex-grow line-clamp-3 leading-relaxed text-sm sm:text-base font-light">
                          {platform.description}
                        </p>
                        
                        <div className="flex justify-between items-center mt-auto pt-6 border-t border-slate-800">
                          <div className="flex flex-col">
                            <span className="text-[11px] text-slate-500 font-bold mb-1 uppercase tracking-widest">سعر التمليك الرسمي</span>
                            <div className="text-2xl sm:text-3xl font-black text-white flex gap-1 items-baseline font-tajawal">
                              {platform.price}
                              <span className="text-xs text-amber-500 font-normal">ج.م</span>
                            </div>
                          </div>
                          
                          <Link 
                            to={`/platform/${platform.id}`}
                            className="bg-slate-800 text-white border border-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400 transition-all shadow-lg flex items-center gap-2 group/btn text-sm"
                          >
                            <span>تفاصيل العقد</span>
                            <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </FadeInSection>
                );
              }) : (
                <div className="col-span-full text-center py-24 bg-slate-900/50 rounded-[3rem] border border-slate-800 backdrop-blur-sm relative overflow-hidden">
                  <Gem className="w-16 h-16 text-slate-700 mx-auto mb-4 relative z-10" />
                  <h3 className="text-2xl font-bold text-white mb-2 relative z-10">قريباً في المنظومة</h3>
                  <p className="text-slate-400 text-sm relative z-10">يتم إعداد دفعة جديدة من المنصات المصرح بها.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 7. Institutional Video & Content Security Pillars */}
      <section className="py-28 bg-white relative border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInSection>
            <div className="text-center mb-20">
              <h2 className="text-3xl sm:text-5xl font-tajawal font-black text-slate-950 mb-4">
                المعايير الأمنية المشددة لمنع سرقة المحتوى
              </h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-amber-600 to-amber-400 mx-auto rounded-full mb-6"></div>
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                لا نتهاون مطلقاً في حماية الملكية الفكرية للمعلم، بنيتنا البرمجية تضمن منع تسريب الفيديوهات.
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Shield, 
                title: 'علامة مائية ديناميكية', 
                desc: 'ظهور كود ورقم هاتف الطالب متحركاً على الفيديو لمنع أي محاولة تصوير بكاميرا خارجية.' 
              },
              { 
                icon: Lock, 
                title: 'حظر برامج الالتقاط', 
                desc: 'تعطيل كامل لتطبيقات ومسجلات الشاشات (OBS, Chrome extensions) وإظهار شاشة سوداء فوراً.' 
              },
              { 
                icon: Smartphone, 
                title: 'تقييد الجهاز الفردي', 
                desc: 'منع مشاركة الحسابات وقفل الحساب على جهاز واحد محدد لمنع تسريب اشتراكات الدروس.' 
              },
              { 
                icon: Zap, 
                title: 'سيرفرات سحابية معزولة', 
                desc: 'بنية تحتية مشفرة بضمان سرعة فائقة وجودة بث تلقائية 1080p تناسب كافة سرعات الإنترنت.' 
              }
            ].map((feature, i) => (
              <FadeInSection key={i} delay={i * 150}>
                <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="w-14 h-14 bg-indigo-950 text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mb-3 font-tajawal">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Final Institutional Direct Contact Section */}
      <section className="py-24 relative overflow-hidden bg-slate-950 text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <FadeInSection>
            <div className="w-16 h-16 rounded-3xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-2xl font-black">
              <Crown className="w-8 h-8" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-tajawal font-black text-white">
              ترغب في تأسيس منصة خاصة بمواصفات معقدة؟
            </h2>

            <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-light">
              تواصل مباشرة مع الإدارة العليا لمناقشة متطلبات منصتك الخاصة، وإصدار مسودة العقد الرسمي المعتمد فوراً.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <a 
                href="https://wa.me/201151157100" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-lg px-10 py-5 rounded-2xl shadow-xl hover:scale-105 transition-all"
              >
                <span>محادثة الإدارة المباشرة (واتساب)</span>
                <ExternalLink className="w-5 h-5" />
              </a>

              <Link 
                to="/register" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-lg px-8 py-5 rounded-2xl transition-all"
              >
                <span>إنشاء حساب والبدء الفوري</span>
                <ChevronLeft className="w-5 h-5 text-amber-400" />
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

    </div>
  );
}
