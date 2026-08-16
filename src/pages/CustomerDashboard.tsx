import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  Settings, 
  MonitorPlay, 
  Ticket, 
  CreditCard,
  ChevronLeft,
  Search,
  MessageSquarePlus,
  MessageSquare,
  Activity,
  Clock,
  CheckCircle,
  ExternalLink,
  Crown,
  PlusCircle,
  Rocket,
  Smartphone,
  Building2,
  MapPin,
  Copy,
  Check,
  AlertTriangle,
  FileCheck2,
  Eye,
  Calendar
} from 'lucide-react';
import CustomerChat from '../components/CustomerChat';
import NotificationBell from '../components/NotificationBell';
import PlatformDeliveryTimeline from '../components/PlatformDeliveryTimeline';
import FormalInvoiceDocument, { InvoiceData } from '../components/FormalInvoiceDocument';
import InPersonMeetingBookingModal from '../components/InPersonMeetingBookingModal';
import InPersonMeetingCard from '../components/InPersonMeetingCard';
import { InPersonMeetingData, PaymentSettingsData } from '../types/payment';
import CustomerTierBadgeCard from '../components/CustomerTierBadgeCard';
import { getTierInfo } from '../utils/customerTierUtils';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'platforms';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [customerMeetings, setCustomerMeetings] = useState<InPersonMeetingData[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsData | null>(null);
  const [selectedInvoiceForDoc, setSelectedInvoiceForDoc] = useState<InvoiceData | null>(null);
  const [selectedMeetingForCard, setSelectedMeetingForCard] = useState<InPersonMeetingData | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState<string>('');
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [customRequestData, setCustomRequestData] = useState({
    platformName: '',
    teacherName: '',
    subject: '',
    targetAudience: '',
    additionalRequirements: ''
  });
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrdersAndInvoices = async () => {
      try {
        const [ordersRes, meRes, settingsRes] = await Promise.all([
          fetch(`/api/customer/orders/${encodeURIComponent(user.email)}`),
          fetch(`/api/customer/me/${encodeURIComponent(user.email)}`),
          fetch('/api/payment-settings')
        ]);
        const ordersData = await ordersRes.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);

        const settingsData = await settingsRes.json();
        if (settingsData && settingsData.primaryWalletNumber) {
          setPaymentSettings(settingsData);
        }

        const meData = await meRes.json();
        if (meData && meData.id) {
          setCustomerProfile(meData);
          setCurrentCustomerId(meData.id);
          const [invRes, meetsRes] = await Promise.all([
            fetch(`/api/invoices?customerId=${meData.id}`),
            fetch(`/api/in-person-meetings?customerId=${meData.id}`)
          ]);
          const invData = await invRes.json();
          if (Array.isArray(invData)) {
            setInvoices(invData.map(item => item.invoice));
          }
          const meetsData = await meetsRes.json();
          if (Array.isArray(meetsData)) {
            setCustomerMeetings(meetsData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndInvoices();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleCustomRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestStatus('loading');
    try {
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          ...customRequestData
        })
      });
      const data = await res.json();
      if (data.success) {
        setRequestStatus('success');
      }
    } catch (err) {
      console.error(err);
      setRequestStatus('idle');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Luxury Dark */}
      <aside className="w-full md:w-72 bg-slate-950 text-slate-300 flex flex-col shadow-2xl relative z-20">
        {/* User Profile Area */}
        <div className="p-8 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-1">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xl font-black text-amber-500">
                {user.name.charAt(0)}
              </div>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg font-tajawal truncate">{user.name}</h2>
              <div className="mt-1">
                {(() => {
                  const currentTier = getTierInfo(customerProfile?.tierRating);
                  return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${currentTier.colorClass} ${currentTier.borderClass}`}>
                      <span>{currentTier.badge}</span>
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button 
            onClick={() => handleTabChange('platforms')}
            className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'platforms' 
                ? 'bg-amber-500/10 text-amber-500 shadow-[inset_4px_0_0_0_#f59e0b]' 
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MonitorPlay className="w-5 h-5" />
              <span>منصاتي المشتراة</span>
            </div>
            {activeTab === 'platforms' && <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Dedicated Delivery Timeline Tab */}
          <button 
            onClick={() => handleTabChange('delivery')}
            className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'delivery' 
                ? 'bg-amber-500/10 text-amber-500 shadow-[inset_4px_0_0_0_#f59e0b]' 
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-amber-400" />
              <span>شريط مراحل بناء المنصة</span>
            </div>
            {activeTab === 'delivery' ? <ChevronLeft className="w-4 h-4" /> : (
              invoices.length > 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  {invoices.length} مشروع
                </span>
              )
            )}
          </button>
          
          <button 
            onClick={() => handleTabChange('chat')}
            className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'chat' 
                ? 'bg-amber-500/10 text-amber-500 shadow-[inset_4px_0_0_0_#f59e0b]' 
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span>محادثة الإدارة والتفاوض</span>
            </div>
            {activeTab === 'chat' ? <ChevronLeft className="w-4 h-4" /> : (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">مباشر</span>
            )}
          </button>

          <button 
            onClick={() => handleTabChange('orders')}
            className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'orders' 
                ? 'bg-amber-500/10 text-amber-500 shadow-[inset_4px_0_0_0_#f59e0b]' 
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              <span>المدفوعات والفواتير</span>
            </div>
            {activeTab === 'orders' && <ChevronLeft className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => {handleTabChange('custom_platform'); setRequestStatus('idle');}}
            className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'custom_platform' 
                ? 'bg-amber-500/10 text-amber-500 shadow-[inset_4px_0_0_0_#f59e0b]' 
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5" />
              <span>طلب منصة خاصة</span>
            </div>
            {activeTab === 'custom_platform' && <ChevronLeft className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => handleTabChange('tickets')}
            className={`w-full flex items-center justify-between p-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'tickets' 
                ? 'bg-amber-500/10 text-amber-500 shadow-[inset_4px_0_0_0_#f59e0b]' 
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5" />
              <span>الدعم الفني VIP</span>
            </div>
            {activeTab === 'tickets' && <ChevronLeft className="w-4 h-4" />}
          </button>
        </nav>

        {/* Settings & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button className="w-full flex items-center gap-3 p-4 rounded-xl font-bold hover:bg-slate-900 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            <span>إعدادات الحساب</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white p-6 shadow-sm flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
          <h1 className="text-2xl font-black text-indigo-950 font-tajawal">
            {activeTab === 'platforms' ? 'المنصات التعليمية المشتراة' : 
             activeTab === 'delivery' ? 'متابعة مراحل بناء وتسليم المنصة' :
             activeTab === 'chat' ? 'المحادثة المباشرة مع الإدارة' :
             activeTab === 'orders' ? 'سجل المدفوعات' : 
             activeTab === 'custom_platform' ? 'طلب منصة خاصة' : 'مركز الدعم الفني'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <input 
                type="text" 
                placeholder="ابحث هنا..." 
                className="pl-10 pr-4 py-2 rounded-lg bg-slate-100 border-none outline-none focus:ring-2 focus:ring-amber-500 transition-all w-64 text-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            {/* Notification Bell */}
            <NotificationBell 
              role="customer" 
              email={user.email} 
              onNotificationClick={(link) => {
                if (link && link.includes('tab=')) {
                  const tab = new URLSearchParams(link.split('?')[1]).get('tab');
                  if (tab) handleTabChange(tab);
                } else {
                  handleTabChange('chat');
                }
              }}
            />
          </div>
        </header>

        {/* Content */}
        <div className="p-6 md:p-10 space-y-6">
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Sovereign Rating & Tier Privileges Banner */}
              <CustomerTierBadgeCard 
                tierRating={customerProfile?.tierRating}
                tierNotes={customerProfile?.tierNotes}
                customerName={user.name}
                ordersCount={orders.length}
                totalSpent={orders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0)}
              />

              {/* CHAT TAB */}
              {activeTab === 'chat' && (
                <CustomerChat 
                  customerEmail={user.email}
                  customerName={user.name}
                />
              )}

              {/* DELIVERY TIMELINE TAB */}
              {activeTab === 'delivery' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  {invoices.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4 border border-amber-100">
                        <Rocket className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2 font-tajawal">لا توجد وثائق منصات قيد التجهيز حالياً</h3>
                      <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
                        عندما تطلب منصة خاصة وتقوم الإدارة بإصدار وثيقة عرض سعر معتمدة، ستتمكن هنا من متابعة مراحل البناء لحظة بلحظة وشريط التقدم التلقائي.
                      </p>
                      <button 
                        onClick={() => handleTabChange('custom_platform')} 
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                        طلب منصة تعليمية خاصة
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {invoices.map((inv) => (
                        <div key={inv.id} className="space-y-6">
                          <PlatformDeliveryTimeline 
                            invoice={inv} 
                            onViewInvoice={(invoice) => setSelectedInvoiceForDoc(invoice)} 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PLATFORMS TAB */}
              {activeTab === 'platforms' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                      <MonitorPlay className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-700 mb-2 font-tajawal">لا يوجد لديك منصات حالياً</h3>
                      <p className="text-slate-500 mb-8 max-w-md mx-auto">ابدأ رحلتك الآن في عالم التعليم الإلكتروني وامتلك منصتك الخاصة لتبدأ في تحقيق أرباحك.</p>
                      <Link to="/" className="inline-flex items-center gap-2 bg-indigo-950 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-900 transition-colors shadow-lg shadow-indigo-950/20">
                        تصفح المتجر الآن
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {orders.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                          <div className="flex flex-col sm:flex-row">
                            <div className="w-full sm:w-48 h-48 bg-slate-100 relative overflow-hidden">
                              <img src={item.platform?.imageUrl || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000'} alt="Platform" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute top-3 right-3">
                                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> نشط
                                </span>
                              </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-indigo-950 font-tajawal mb-2">{item.platform?.title || 'منصة مخصصة'}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4">كود الوصول: <strong className="text-slate-700 tracking-wider font-mono">{item.order.accessCode}</strong></p>
                              </div>
                              <div className="flex gap-3">
                                <button className="flex-1 bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                  دخول للوحة التحكم
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ORDERS & PAYMENTS TAB */}
              {activeTab === 'orders' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                  
                  {/* 1. Payment Methods Banner (Wallet 01151157100 & Direct In-Person) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Wallet Box */}
                    <div className="bg-gradient-to-br from-slate-950 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-white font-tajawal">سداد فوري عبر المحفظة</h3>
                            <p className="text-[11px] text-amber-400 font-medium">فودافون كاش / إنستاباي / إتصالات كاش</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          معتمد 24/7
                        </span>
                      </div>

                      <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">رقم المحفظة المعتمد:</span>
                          <span className="font-mono text-xl font-black text-amber-300 tracking-wider">
                            {paymentSettings?.primaryWalletNumber || '01151157100'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentSettings?.primaryWalletNumber || '01151157100');
                            setCopiedWallet(true);
                            setTimeout(() => setCopiedWallet(false), 2000);
                          }}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs transition-all flex items-center gap-1 shadow-sm"
                        >
                          {copiedWallet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedWallet ? 'تم النسخ!' : 'نسخ الرقم'}</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        قم بالتحويل على الرقم أعلاه ثم تواصل عبر المحادثة أو اضغط على سداد الفاتورة لتفعيل المنصة فوراً.
                      </p>
                    </div>

                    {/* In-Person Meeting Box */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-indigo-800/60 space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-white font-tajawal">مقابلة شخصية ودفع يدوي</h3>
                              <p className="text-[11px] text-amber-300 font-medium">مقابلة مندوب الإدارة يداً بيد</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-indigo-950/60 border border-indigo-700/50 rounded-2xl p-3 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>متاحة حصرياً في: (محافظتي القاهرة والإسكندرية فقط)</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            يمكنك طلب مقابلة مندوبنا المعتمد وتسليمه الدفعة نقدياً واستلام إيصال وبطاقة موعد مشفرة.
                          </p>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-rose-300 font-bold">تطبق غرامة 20% في حال الإلغاء</span>
                        <button
                          type="button"
                          onClick={() => setShowBookingModal(true)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl font-black text-xs transition-all shadow-md flex items-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>حجز موعد مقابلة (PDF)</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* 2. Scheduled In-Person Meetings (If any) */}
                  {customerMeetings.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-indigo-900" />
                          <h3 className="font-bold text-slate-900 text-sm font-tajawal">مواعيد المقابلات الشخصية المسجلة لك</h3>
                        </div>
                        <span className="text-xs text-slate-500 font-bold">{customerMeetings.length} موعد</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {customerMeetings.map((meet) => (
                          <div key={meet.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-mono text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">
                                  {meet.meetingNumber}
                                </span>
                                <h4 className="font-bold text-xs text-slate-900 mt-1">
                                  مقابلة في محافظة {meet.governorate} ({meet.region})
                                </h4>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                meet.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                meet.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {meet.status === 'completed' ? 'تم التحصيل ✓' :
                                 meet.status === 'cancelled' ? 'ملغاة' : 'موعد معتمد ⏳'}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-slate-100">
                              <p><strong>الموعد:</strong> {meet.scheduledDate} ({meet.scheduledTime})</p>
                              <p><strong>المندوب:</strong> {meet.employeeName} ({meet.employeePhone})</p>
                              <p><strong>كود التحقق:</strong> <span className="font-mono font-bold text-indigo-950">{meet.verificationCode}</span></p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedMeetingForCard(meet)}
                              className="w-full py-2 bg-indigo-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>عرض وطباعة بطاقة الموعد الأنيقة (PDF)</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Invoices List for Custom Platforms */}
                  {invoices.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-5 h-5 text-amber-600" />
                          <h3 className="font-bold text-slate-900 text-sm font-tajawal">عقود وفواتير المنصات المخصصة</h3>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {invoices.map((inv) => (
                          <div key={inv.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                                  {inv.invoiceNumber}
                                </span>
                                <h4 className="font-bold text-sm text-slate-900 font-tajawal">{inv.platformTitle}</h4>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                القيمة: <strong className="text-indigo-950 font-tajawal">{Number(inv.amount).toLocaleString('ar-EG')} ج.م</strong> • المتبقي: {inv.status === 'paid' ? '0 ج.م' : `${inv.amount} ج.م`}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {inv.status === 'paid' ? 'مدفوعة ومفعلة ✓' : 'بانتظار السداد'}
                              </span>

                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceForDoc(inv)}
                                className="px-4 py-2 bg-indigo-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-400" />
                                <span>عرض وثيقة العقد والسداد</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Instant Orders Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <h4 className="font-bold text-xs text-slate-700">سجل الطلبات الفورية</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                          <tr>
                            <th className="p-4 font-bold text-sm">رقم الطلب</th>
                            <th className="p-4 font-bold text-sm">المنصة</th>
                            <th className="p-4 font-bold text-sm">التاريخ</th>
                            <th className="p-4 font-bold text-sm">المبلغ</th>
                            <th className="p-4 font-bold text-sm">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 font-mono text-sm text-slate-600">#{item.order.id.substring(0, 8)}</td>
                              <td className="p-4 font-bold text-indigo-950">{item.platform?.title || 'منصة'}</td>
                              <td className="p-4 text-slate-500 text-sm">
                                {new Date(item.order.deliveredAt).toLocaleDateString('ar-EG')}
                              </td>
                              <td className="p-4 font-bold text-slate-700">{item.order.amount} ج.م</td>
                              <td className="p-4">
                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> مدفوع
                                </span>
                              </td>
                            </tr>
                          ))}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-500">لا توجد عمليات دفع مسجلة.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* CUSTOM PLATFORM REQUEST TAB */}
              {activeTab === 'custom_platform' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
                  {requestStatus === 'success' ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-emerald-100">
                      <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-900 mb-4 font-tajawal">تم إرسال طلبك بنجاح!</h3>
                      <p className="text-slate-500 text-lg leading-relaxed max-w-md mx-auto mb-8">
                        سيتم مراجعة المطلوب وإخبارك بالسعر المبدئي للمنصة المطلوبة. يرجى ملاحظة أن السعر قابل للتغيير والتفاوض بناءً على التفاصيل النهائية. يمكنك متابعة النقاش مباشرة مع الإدارة عبر المحادثة المباشرة.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                          onClick={() => handleTabChange('chat')}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-8 py-3.5 rounded-xl font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-5 h-5" />
                          فتح المحادثة المباشرة مع الإدارة
                        </button>
                        <button 
                          onClick={() => handleTabChange('platforms')}
                          className="bg-indigo-950 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-900 transition-colors shadow-lg shadow-indigo-950/20"
                        >
                          العودة للمنصات
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-8">
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-indigo-950 mb-2 font-tajawal">أنشئ منصتك التعليمية المخصصة</h2>
                        <p className="text-slate-500">أدخل البيانات الأساسية لطلب إنشاء منصتك، وسنقوم بدراسة الطلب وتقديم عرض سعر مبدئي لك.</p>
                      </div>
                      <form onSubmit={handleCustomRequestSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">اسم المنصة المقترح</label>
                            <input type="text" required value={customRequestData.platformName} onChange={e => setCustomRequestData({...customRequestData, platformName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="مثال: أكاديمية التفوق" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">اسم المعلم / صاحب المنصة</label>
                            <input type="text" required value={customRequestData.teacherName} onChange={e => setCustomRequestData({...customRequestData, teacherName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">المادة العلمية التخصصية</label>
                            <input type="text" required value={customRequestData.subject} onChange={e => setCustomRequestData({...customRequestData, subject: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="مثال: الفيزياء، الكيمياء، إلخ" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">الجمهور المستهدف (الصفوف)</label>
                            <input type="text" value={customRequestData.targetAudience} onChange={e => setCustomRequestData({...customRequestData, targetAudience: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="مثال: المرحلة الثانوية" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">متطلبات إضافية وميزات ترغب بها</label>
                            <textarea rows={4} value={customRequestData.additionalRequirements} onChange={e => setCustomRequestData({...customRequestData, additionalRequirements: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="حدثنا أكثر عن الميزات التي تحلم بها في منصتك..."></textarea>
                          </div>
                        </div>
                        <div className="pt-6 border-t border-slate-100">
                          <button 
                            type="submit" 
                            disabled={requestStatus === 'loading'}
                            className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-[0_10_20px_rgba(251,191,36,0.3)] hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2"
                          >
                            {requestStatus === 'loading' ? (
                              <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                جاري الإرسال...
                              </span>
                            ) : (
                              <>
                                <PlusCircle className="w-5 h-5" />
                                إرسال طلب الإنشاء
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* TICKETS TAB (MOCK FOR MVP) */}
              {activeTab === 'tickets' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">تذاكر الدعم الفني الخاصة بك</h2>
                    <button onClick={() => handleTabChange('chat')} className="bg-indigo-950 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-900 transition-colors shadow-lg flex items-center gap-2">
                      <MessageSquarePlus className="w-4 h-4" />
                      محادثة الدعم الفني
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-12 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Activity className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700 mb-2 font-tajawal">محادثة الدعم الفني جاهزة</h3>
                      <p className="text-slate-500 mb-6">يمكنك التحدث مباشرة مع فريق العمل عبر قسم المحادثات المباشرة.</p>
                      <button onClick={() => handleTabChange('chat')} className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-6 py-2.5 rounded-xl font-bold">
                        الانتقال إلى المحادثة المباشرة
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </main>

      {/* Modal: View Official Formal Document in Customer Dashboard */}
      {selectedInvoiceForDoc && (
        <FormalInvoiceDocument
          invoice={selectedInvoiceForDoc}
          isCustomerView={true}
          onPayNow={() => {
            // refresh data
            const fetchOrdersAndInvoices = async () => {
              try {
                const meRes = await fetch(`/api/customer/me/${encodeURIComponent(user.email)}`);
                const meData = await meRes.json();
                if (meData && meData.id) {
                  const invRes = await fetch(`/api/invoices?customerId=${meData.id}`);
                  const invData = await invRes.json();
                  if (Array.isArray(invData)) {
                    setInvoices(invData.map(item => item.invoice));
                  }
                }
              } catch (e) {
                console.error(e);
              }
            };
            fetchOrdersAndInvoices();
          }}
          onClose={() => setSelectedInvoiceForDoc(null)}
        />
      )}

      {/* Modal: Book In-Person Meeting */}
      {showBookingModal && (
        <InPersonMeetingBookingModal
          customerId={currentCustomerId || user.id || 'cust_temp'}
          customerName={user.name}
          customerPhone={user.phone || ''}
          invoice={invoices[0] || null}
          onClose={() => setShowBookingModal(false)}
          onMeetingCreated={(meeting) => {
            setShowBookingModal(false);
            setCustomerMeetings(prev => [meeting, ...prev]);
            setSelectedMeetingForCard(meeting);
          }}
        />
      )}

      {/* Modal: View Chic In-Person Meeting Card */}
      {selectedMeetingForCard && (
        <InPersonMeetingCard
          meeting={selectedMeetingForCard}
          onClose={() => setSelectedMeetingForCard(null)}
        />
      )}
    </div>
  );
}
