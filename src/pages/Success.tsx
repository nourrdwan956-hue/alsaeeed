import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Copy, MessageCircle } from 'lucide-react';

export default function Success() {
  const location = useLocation();
  const order = location.state?.order;
  const platform = location.state?.platform;

  if (!order) {
    return <Navigate to="/" />;
  }

  const copyCode = () => {
    navigator.clipboard.writeText(order.accessCode);
    alert('تم نسخ كود التفعيل!');
  };

  return (
    <div className="bg-slate-50 py-16 min-h-[70vh] flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-8 md:p-12 text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-tajawal font-bold text-indigo-950 mb-4">
            تهانينا! اكتمل طلبك بنجاح
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            شكراً لثقتك بمنصة السعيد. أصبحت منصة "{platform?.title}" ملكاً لك الآن.
          </p>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500 rounded-bl-full opacity-10"></div>
            
            <h2 className="text-indigo-900 font-bold mb-2">كود التفعيل الخاص بك:</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
              <code className="text-2xl md:text-3xl font-mono font-bold text-indigo-950 bg-white px-6 py-3 rounded-xl border border-indigo-200" dir="ltr">
                {order.accessCode}
              </code>
              <button 
                onClick={copyCode}
                className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 p-3 rounded-xl transition-colors"
                title="نسخ الكود"
              >
                <Copy className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-indigo-700 mt-4">يرجى الاحتفاظ بهذا الكود، فهو مفتاح دخولك لنسختك الحصرية.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href={`https://wa.me/201151157100?text=${encodeURIComponent(`مرحباً، لقد قمت بشراء منصة ${platform?.title} وكود التفعيل الخاص بي هو: ${order.accessCode}. أرجو تزويدي برابط التحميل.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-green-600 transition-colors"
            >
              استلام المنصة (واتساب)
              <MessageCircle className="w-5 h-5" />
            </a>
            <Link 
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold text-lg px-8 py-4 rounded-xl hover:bg-slate-200 transition-colors"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
