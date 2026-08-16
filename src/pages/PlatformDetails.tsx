import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Zap, Lock, ArrowLeft } from 'lucide-react';

export default function PlatformDetails() {
  const { id } = useParams();
  const [platform, setPlatform] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/platforms/${id}`)
      .then(res => res.json())
      .then(data => {
        setPlatform(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching platform", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
      </div>
    );
  }

  if (!platform) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-3xl font-bold text-indigo-950 mb-4">المنصة غير موجودة</h2>
        <Link to="/" className="text-amber-600 hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  const features = platform.features && platform.features.length > 0 
    ? platform.features 
    : [
      "تصميم فخم وعصري يتناسب مع جميع الأجهزة",
      "لوحة تحكم كاملة لإدارة الدروس والطلاب",
      "نظام حماية متقدم لملفات الفيديو",
      "دعم فني مجاني لمدة شهر",
      "تسليم الكود المصدري كاملاً (نسخة حصرية)"
    ];

  const copiesLeft = platform.totalCopies - (platform.soldCopies || 0);
  const isSoldOut = platform.isSoldOut || copiesLeft <= 0;
  const fallbackImg = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1200";

  return (
    <div className="bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-950 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          العودة للمنصات
        </Link>
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="h-96 lg:h-auto relative">
              {isSoldOut && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
                  <div className="bg-red-500 text-white font-bold text-3xl px-12 py-4 rounded-full shadow-2xl transform -rotate-12 border-8 border-white">
                    تم البيع بالكامل
                  </div>
                </div>
              )}
              <img 
                src={platform.imageUrl || fallbackImg} 
                alt={platform.title} 
                onError={(e) => { e.currentTarget.src = fallbackImg; }}
                className={`w-full h-full object-cover ${isSoldOut ? 'grayscale opacity-80' : ''}`}
              />
            </div>
            
            {/* Content Section */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col">
              <div className="inline-block bg-amber-100 text-amber-800 font-bold px-4 py-1 rounded-full text-sm mb-6 self-start">
                {platform.category || 'عام'}
              </div>
              <h1 className="text-4xl md:text-5xl font-tajawal font-bold text-indigo-950 mb-6">
                {platform.title}
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                {platform.description}
              </p>
              
              <div className="space-y-4 mb-10">
                {features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto pt-8 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">استثمارك في هذه المنصة</div>
                    <div className="text-4xl font-bold text-indigo-950 flex gap-2 items-baseline">
                      {platform.price}
                      <span className="text-xl text-slate-500 font-normal">ج.م</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    {platform.platformUrl && (
                      <a 
                        href={platform.platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold text-lg px-8 py-4 rounded-xl hover:bg-indigo-100 hover:-translate-y-1 transition-all text-center flex items-center justify-center"
                      >
                        معاينة المنصة
                      </a>
                    )}
                    {isSoldOut ? (
                      <button 
                        disabled
                        className="w-full sm:w-auto bg-slate-200 text-slate-500 font-bold text-lg px-12 py-4 rounded-xl cursor-not-allowed text-center"
                      >
                        المنصة مباعة بالكامل
                      </button>
                    ) : (
                      <Link 
                        to={`/checkout/${platform.id}`}
                        className="w-full sm:w-auto bg-amber-500 text-indigo-950 font-bold text-lg px-12 py-4 rounded-xl shadow-lg hover:bg-amber-400 hover:-translate-y-1 transition-all text-center"
                      >
                        شراء المنصة الآن
                      </Link>
                    )}
                  </div>
                </div>
                
                {!isSoldOut && platform.totalCopies > 1 && (
                  <div className="mt-6 flex items-center justify-center sm:justify-start gap-2 text-sm font-medium text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <Zap className="w-4 h-4 fill-amber-700" />
                    متبقي {copiesLeft} نسخ فقط بهذا السعر!
                  </div>
                )}
                
                <div className="mt-8 flex justify-center sm:justify-start gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    دفع آمن
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    ملكية حصرية
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
