import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lock, PlusCircle, LayoutDashboard, Trash2, Edit, MessageSquare, Phone, MessagesSquare, CheckCircle, Sparkles, Users, CreditCard, Building2, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminChatCenter from '../components/AdminChatCenter';
import NotificationBell from '../components/NotificationBell';
import AdminCustomersCRM from '../components/AdminCustomersCRM';
import AdminPaymentSettingsModal from '../components/AdminPaymentSettingsModal';
import AdminMeetingManagerModal from '../components/AdminMeetingManagerModal';

export default function AdminDashboard() {
  const { user, login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);
  const [showMeetingManager, setShowMeetingManager] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsAuthenticated(true);
    }
  }, [user]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  
  const [customRequests, setCustomRequests] = useState<any[]>([]);
  const [loadingCustomRequests, setLoadingCustomRequests] = useState(false);

  const initialTab = (searchParams.get('tab') as any) || 'list';
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'requests' | 'chat' | 'customers'>(initialTab);
  const [targetCustomerId, setTargetCustomerId] = useState<string | null>(searchParams.get('customerId') || null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['list', 'add', 'requests', 'chat', 'customers'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
    const custParam = searchParams.get('customerId');
    if (custParam) {
      setTargetCustomerId(custParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'list' | 'add' | 'requests' | 'chat' | 'customers', customerId?: string) => {
    setActiveTab(tab);
    if (customerId) {
      setTargetCustomerId(customerId);
      setSearchParams({ tab, customerId });
    } else {
      setSearchParams({ tab });
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    platformUrl: '',
    totalCopies: 1,
    features: '',
    isSoldOut: false
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً. أقصى حجم هو 5 ميجابايت.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const fetchPlatforms = async () => {
    setLoadingPlatforms(true);
    try {
      const res = await fetch('/api/admin/platforms');
      const data = await res.json();
      if (Array.isArray(data)) setPlatforms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlatforms(false);
    }
  };

  const fetchCustomRequests = async () => {
    setLoadingCustomRequests(true);
    try {
      const res = await fetch('/api/admin/custom-requests');
      const data = await res.json();
      if (Array.isArray(data)) setCustomRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCustomRequests(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlatforms();
      fetchCustomRequests();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use the global login endpoint so the user object matches perfectly
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success && data.isAdmin) {
        setIsAuthenticated(true);
        login(data.user);
      } else if (data.success && !data.isAdmin) {
        alert("هذا الحساب ليس لديه صلاحيات الإدارة");
      } else {
        alert(data.error || "كلمة المرور غير صحيحة");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const featuresList = formData.features.split(',').map(f => f.trim()).filter(f => f);
    
    try {
      const res = await fetch('/api/admin/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: featuresList
        })
      });
      
      if (res.ok) {
        alert('تم إضافة المنصة بنجاح');
        setFormData({
          title: '', description: '', price: '', category: '', imageUrl: '', platformUrl: '', totalCopies: 1, features: '', isSoldOut: false
        });
        setActiveTab('list');
        fetchPlatforms();
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ');
    }
  };

  const executeDelete = async (id: string) => {
    setDeleteConfirmId(null);
    try {
      const res = await fetch(`/api/admin/platforms/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchPlatforms();
      } else {
        alert('حدث خطأ أثناء الحذف');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full mx-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-indigo-900" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-indigo-950 mb-2 font-tajawal">لوحة إدارة السعيد</h1>
          <p className="text-center text-slate-500 mb-6">مرحباً بك يا نور السعيد، المسئول الوحيد عن المنصة</p>
          
          <input 
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 mb-4 text-left"
            dir="ltr"
            required
          />
          <input 
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 mb-6 text-left"
            dir="ltr"
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-950 text-white font-bold py-3 rounded-xl hover:bg-indigo-900 transition-colors"
          >
            {loading ? 'جاري التحقق...' : 'دخول للوحة التحكم'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-amber-500 shadow-md">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-indigo-950 font-tajawal">
              لوحة الإدارة والتحكم
            </h1>
            <p className="text-xs text-slate-500">إدارة المنصات، تتبع طلبات العملاء والمحادثات المباشرة</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Quick Management Tools (Payment & In-person meetings) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPaymentSettings(true)}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-950 text-amber-400 border border-slate-800 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              title="تعديل أرقام المحافظ وبوابات الدفع"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>أرقام وطرق الدفع</span>
            </button>

            <button
              onClick={() => setShowMeetingManager(true)}
              className="px-3.5 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              title="إدارة مواعيد المقابلات والدفع اليدوي (القاهرة والإسكندرية)"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>مواعيد المقابلات</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => handleTabChange('list')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
                activeTab === 'list' 
                  ? 'bg-indigo-950 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              منصاتي
            </button>
            <button 
              onClick={() => handleTabChange('add')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
                activeTab === 'add' 
                  ? 'bg-indigo-950 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              إضافة منصة
            </button>
            <button 
              onClick={() => handleTabChange('requests')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
                activeTab === 'requests' 
                  ? 'bg-indigo-950 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              طلبات المنصات
            </button>
            <button 
              onClick={() => handleTabChange('customers')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'customers' 
                  ? 'bg-indigo-950 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>دليل العملاء (CRM)</span>
            </button>
            <button 
              onClick={() => handleTabChange('chat')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'chat' 
                  ? 'bg-amber-500 text-slate-950 shadow-sm' 
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>محادثات العملاء</span>
            </button>
          </div>

          {/* Admin Notification Bell */}
          <NotificationBell 
            role="admin" 
            onNotificationClick={(link) => {
              if (link && link.includes('tab=')) {
                const urlParams = new URLSearchParams(link.split('?')[1]);
                const tab = urlParams.get('tab') as any;
                const custId = urlParams.get('customerId') || undefined;
                if (tab) handleTabChange(tab, custId);
              } else {
                handleTabChange('chat');
              }
            }}
          />
        </div>
      </div>

      {/* CRM TAB */}
      {activeTab === 'customers' && (
        <AdminCustomersCRM 
          onOpenChat={(customerId) => handleTabChange('chat', customerId)} 
        />
      )}

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="animate-in fade-in duration-300">
          <AdminChatCenter initialCustomerId={targetCustomerId} />
        </div>
      )}
      
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loadingPlatforms ? (
            <div className="p-12 text-center text-slate-500">جاري تحميل المنصات...</div>
          ) : platforms.length === 0 ? (
            <div className="p-12 text-center text-slate-500">لا توجد منصات حالياً. ابدأ بإضافة منصة جديدة.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">المنصة</th>
                    <th className="px-6 py-4 font-bold">السعر</th>
                    <th className="px-6 py-4 font-bold">المبيعات</th>
                    <th className="px-6 py-4 font-bold">النسخ المتبقية</th>
                    <th className="px-6 py-4 font-bold text-center">الحالة</th>
                    <th className="px-6 py-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {platforms.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.imageUrl || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=100"} 
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=100"; }}
                            className="w-12 h-12 rounded object-cover border border-slate-200" 
                            alt="" 
                          />
                          <div>
                            <div className="font-bold text-indigo-950">{p.title}</div>
                            <div className="text-sm text-slate-500">{p.category || 'عام'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{p.price} ج.م</td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-sm font-bold">{p.soldCopies || 0}</span>
                      </td>
                      <td className="px-6 py-4 font-medium">{p.totalCopies - (p.soldCopies || 0)} / {p.totalCopies}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {p.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="حذف المنصة"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-indigo-950 font-tajawal">طلبات إنشاء المنصات الخاصة</h2>
              <p className="text-xs text-slate-500">متابعة طلبات المعلمين والعملاء والتفاوض معهم مباشرة داخل المنصة أو واتساب</p>
            </div>
            <button 
              onClick={() => fetchCustomRequests()} 
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition-colors"
            >
              تحديث الطلبات
            </button>
          </div>

          {loadingCustomRequests ? (
            <div className="p-12 text-center text-slate-500">جاري تحميل الطلبات...</div>
          ) : customRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-500">لا توجد طلبات جديدة حالياً.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customRequests.map((req, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-indigo-950 font-tajawal">{req.request.platformName}</h3>
                        <span className="text-xs text-amber-700 font-bold block mt-0.5">طلب مخصص</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.request.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                        req.request.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {req.request.status === 'pending' ? 'قيد المراجعة' : req.request.status}
                      </span>
                    </div>

                    <div className="space-y-2.5 mb-6 bg-white p-4 rounded-xl border border-slate-200/80">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">العميل:</span> 
                        <span className="font-bold text-slate-800">{req.customer?.name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">هاتف العميل:</span> 
                        <span className="font-bold text-slate-800 dir-ltr font-mono">{req.customer?.phone}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">واتساب:</span> 
                        <span className="font-bold text-slate-800 dir-ltr font-mono">{req.customer?.whatsapp || req.customer?.phone}</span>
                      </div>
                      <hr className="border-slate-100" />
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">صاحب المنصة:</span> 
                        <span className="font-bold text-slate-800">{req.request.teacherName}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">المادة:</span> 
                        <span className="font-bold text-indigo-950">{req.request.subject}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">الصفوف المستهدفة:</span> 
                        <span className="font-bold text-slate-800">{req.request.targetAudience || 'غير محدد'}</span>
                      </div>
                    </div>

                    <div className="text-xs mb-4">
                      <span className="text-slate-500 font-bold block mb-1">المتطلبات الإضافية:</span>
                      <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-100 text-xs leading-relaxed whitespace-pre-wrap">
                        {req.request.additionalRequirements || 'لا توجد تفاصيل إضافية.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-slate-200">
                    <button 
                      onClick={() => handleTabChange('chat', req.customer?.id)}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>محادثة العميل بالمنصة</span>
                    </button>
                    <button 
                      onClick={() => window.open(`https://wa.me/2${req.customer?.whatsapp || req.customer?.phone}`, '_blank')} 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      title="محادثة واتساب"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'add' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleAddPlatform} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">اسم المنصة</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">القسم</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500" placeholder="مثال: الرياضيات، العربية" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">السعر (ج.م)</label>
                <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">عدد النسخ المتاحة</label>
                <input type="number" required min="1" value={formData.totalCopies} onChange={e => setFormData({...formData, totalCopies: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">صورة المنصة (أقصى حجم 5 ميجابايت)</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 text-left" dir="ltr" />
                {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="mt-4 h-32 object-cover rounded-xl border border-slate-200" />}
              </div>
              <div className="md:col-span-2 flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200">
                <input type="checkbox" id="isSoldOut" checked={formData.isSoldOut} onChange={e => setFormData({...formData, isSoldOut: e.target.checked})} className="w-5 h-5 text-amber-500 rounded border-slate-300 focus:ring-amber-500" />
                <label htmlFor="isSoldOut" className="text-sm font-bold text-amber-900 cursor-pointer">هذه المنصة للعرض فقط (تم بيعها / الإعلان عنها فقط)</label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">رابط المنصة التعليمية (URL)</label>
                <input type="url" value={formData.platformUrl} onChange={e => setFormData({...formData, platformUrl: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 text-left" dir="ltr" placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">وصف قصير</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">المميزات (افصل بينها بفاصلة)</label>
                <textarea rows={3} value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500" placeholder="ميزة 1, ميزة 2, ميزة 3..."></textarea>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button type="submit" className="bg-amber-500 text-indigo-950 font-bold px-8 py-3 rounded-xl hover:bg-amber-400 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                حفظ المنصة
              </button>
            </div>
          </form>
        </div>
      )}
      
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-tajawal">تأكيد الحذف</h3>
            <p className="text-slate-600 mb-6">
              هل أنت متأكد من رغبتك في حذف هذه المنصة نهائياً؟ سيتم حذف جميع الطلبات المرتبطة بها ولن يمكنك التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-6 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={() => executeDelete(deleteConfirmId)}
                className="px-6 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md transition-colors"
              >
                نعم، احذف المنصة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings Modal */}
      {showPaymentSettings && (
        <AdminPaymentSettingsModal
          onClose={() => setShowPaymentSettings(false)}
        />
      )}

      {/* In-Person Meeting Manager Modal */}
      {showMeetingManager && (
        <AdminMeetingManagerModal
          onClose={() => setShowMeetingManager(false)}
        />
      )}
    </div>
  );
}
