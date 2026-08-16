import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [platform, setPlatform] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isSoldOut, setIsSoldOut] = useState(false);
  
  const fallbackImg = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=200";

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        buyerName: user.name,
        buyerEmail: user.email,
        buyerPhone: user.phone || ''
      });
    }
  }, [user]);

  useEffect(() => {
    fetch(`/api/platforms/${id}`)
      .then(res => res.json())
      .then(data => {
        setPlatform(data);
        if (data.isSoldOut || (data.totalCopies - (data.soldCopies || 0) <= 0)) {
          setIsSoldOut(true);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching platform", err);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSoldOut) return;
    setProcessing(true);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: id,
          amount: platform.price,
          ...formData
        })
      });
      const data = await res.json();
      
      if (data.success) {
        navigate('/success', { state: { order: data.order, platform } });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("حدث خطأ أثناء معالجة الطلب");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-950 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          العودة للمنصة
        </button>
        
        <h1 className="text-3xl font-tajawal font-bold text-indigo-950 mb-8">إتمام الشراء</h1>
        
        {isSoldOut ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-red-500 font-bold text-3xl mb-4">تم البيع بالكامل</div>
            <p className="text-slate-600 mb-8">نعتذر، لقد تم بيع جميع النسخ المتاحة من هذه المنصة.</p>
            <button onClick={() => navigate('/')} className="bg-indigo-950 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-md hover:bg-indigo-800 transition-colors">
              العودة للصفحة الرئيسية
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-indigo-950">بيانات المشتري</h2>
                {user && (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium">
                    <UserCircle className="w-4 h-4" />
                    تم التعرف عليك تلقائياً
                  </div>
                )}
              </div>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الثلاثي</label>
                  <input 
                    type="text" 
                    required
                    value={formData.buyerName}
                    onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
                    readOnly={!!user}
                    className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all ${user ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                    placeholder="اكتب اسمك بالكامل"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    required
                    value={formData.buyerEmail}
                    onChange={(e) => setFormData({...formData, buyerEmail: e.target.value})}
                    readOnly={!!user}
                    className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-left ${user ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">رقم الواتساب للتواصل</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.buyerPhone}
                    onChange={(e) => setFormData({...formData, buyerPhone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-left"
                    placeholder="+201..."
                    dir="ltr"
                  />
                </div>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sticky top-28">
              <h2 className="text-xl font-bold text-indigo-950 mb-6 border-b border-slate-100 pb-4">ملخص الطلب</h2>
              
              <div className="flex gap-4 mb-6">
                <img 
                  src={platform.imageUrl || fallbackImg} 
                  onError={(e) => { e.currentTarget.src = fallbackImg; }}
                  className="w-20 h-20 object-cover rounded-lg" 
                  alt={platform.title} 
                />
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-2">{platform.title}</h3>
                  <div className="text-amber-600 font-medium mt-1">{platform.category || 'عام'}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4 text-slate-600">
                <span>السعر الأصلي</span>
                <span>{platform.price} ج.م</span>
              </div>
              
              <div className="border-t border-slate-100 pt-4 mb-8 flex justify-between items-center font-bold text-lg">
                <span className="text-indigo-950">الإجمالي</span>
                <span className="text-amber-600">{platform.price} ج.م</span>
              </div>
              
              <button 
                type="submit" 
                form="checkout-form"
                disabled={processing || isSoldOut}
                className="w-full bg-indigo-950 text-white font-bold text-lg px-6 py-4 rounded-xl shadow-md hover:bg-indigo-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
              >
                {processing ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    تأكيد والدفع
                    <Lock className="w-4 h-4" />
                  </>
                )}
              </button>
              
              <div className="mt-4 flex justify-center text-sm text-slate-500 gap-1 items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                دفع مشفر وآمن 100%
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
