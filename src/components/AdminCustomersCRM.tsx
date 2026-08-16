import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  DollarSign, 
  Layers, 
  RefreshCw,
  ExternalLink,
  Save,
  X,
  FileText,
  UserCheck,
  UserX,
  Crown,
  Award,
  Star
} from 'lucide-react';
import CustomerTierBadgeCard from './CustomerTierBadgeCard';
import { getTierInfo, TIER_DEFINITIONS, TIER_ORDER } from '../utils/customerTierUtils';

export interface CustomerCRMItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  governorate: string;
  region: string;
  platformIdea: string;
  additionalInfo: string;
  isVerified: boolean;
  status: 'active' | 'suspended';
  tierRating?: string;
  tierNotes?: string;
  tierDiscountPercent?: number;
  adminNotes: string;
  lastLoginAt?: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  customRequestsCount: number;
  messagesCount: number;
  unreadMessagesCount: number;
  purchasedPlatforms: Array<{
    id: string;
    title: string;
    price: string | number;
    imageUrl?: string;
    category?: string;
  }>;
}

interface AdminCustomersCRMProps {
  onOpenChat: (customerId: string) => void;
}

export default function AdminCustomersCRM({ onOpenChat }: AdminCustomersCRMProps) {
  const [customers, setCustomers] = useState<CustomerCRMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'tier_rank' | 'date_desc' | 'spend_desc' | 'orders_desc' | 'name_asc'>('tier_rank');
  
  // Selected customer modal for full view
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerModalData, setCustomerModalData] = useState<any>(null);
  const [loadingModal, setLoadingModal] = useState(false);

  // Edit / Notes Modal
  const [editingCustomer, setEditingCustomer] = useState<CustomerCRMItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    governorate: '',
    region: '',
    status: 'active' as 'active' | 'suspended',
    tierRating: 'UNRATED',
    tierNotes: '',
    tierDiscountPercent: 0,
    adminNotes: '',
    isVerified: true
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCustomers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(false);
  }, []);

  // Fetch full details for modal
  const openCustomerModal = async (id: string) => {
    setSelectedCustomerId(id);
    setLoadingModal(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      const data = await res.json();
      setCustomerModalData(data);
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeCustomerModal = () => {
    setSelectedCustomerId(null);
    setCustomerModalData(null);
  };

  // Open Edit Form
  const openEditModal = (cust: CustomerCRMItem) => {
    setEditingCustomer(cust);
    const rating = cust.tierRating || 'UNRATED';
    const tierDef = getTierInfo(rating);

    setEditForm({
      name: cust.name || '',
      phone: cust.phone || '',
      whatsapp: cust.whatsapp || cust.phone || '',
      governorate: cust.governorate || '',
      region: cust.region || '',
      status: cust.status || 'active',
      tierRating: rating,
      tierNotes: cust.tierNotes || '',
      tierDiscountPercent: cust.tierDiscountPercent !== undefined ? cust.tierDiscountPercent : tierDef.discountPercent,
      adminNotes: cust.adminNotes || '',
      isVerified: cust.isVerified
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...editForm } : c));
        setEditingCustomer(null);
      }
    } catch (err) {
      console.error('Failed to update customer:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Quick toggle status
  const handleToggleStatus = async (cust: CustomerCRMItem) => {
    const newStatus = cust.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/customers/${cust.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(prev => prev.map(c => c.id === cust.id ? { ...c, status: newStatus } : c));
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        setDeletingId(null);
        if (selectedCustomerId === id) closeCustomerModal();
      }
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = [
      "الاسم",
      "البريد الإلكتروني",
      "الهاتف",
      "الواتساب",
      "المحافظة",
      "المنطقة",
      "الحالة",
      "التوثيق",
      "إجمالي الطلبات",
      "إجمالي المدفوعات (ج.م)",
      "طلبات المنصات الخاصة",
      "فكرة المنصة المطلوبة",
      "تاريخ التسجيل",
      "ملاحظات الإدارة"
    ];

    const rows = filteredCustomers.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.whatsapp || '').replace(/"/g, '""')}"`,
      `"${(c.governorate || '').replace(/"/g, '""')}"`,
      `"${(c.region || '').replace(/"/g, '""')}"`,
      `"${c.status === 'active' ? 'نشط' : 'موقوف'}"`,
      `"${c.isVerified ? 'موثق' : 'غير موثق'}"`,
      c.ordersCount,
      c.totalSpent,
      c.customRequestsCount,
      `"${(c.platformIdea || '').replace(/"/g, '""')}"`,
      `"${new Date(c.createdAt).toLocaleDateString('ar-EG')}"`,
      `"${(c.adminNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `alsaeed-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort Logic
  const filteredCustomers = customers
    .filter(c => {
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.whatsapp && c.whatsapp.includes(q)) ||
        (c.governorate && c.governorate.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchVerified = 
        verifiedFilter === 'all' || 
        (verifiedFilter === 'verified' && c.isVerified) || 
        (verifiedFilter === 'unverified' && !c.isVerified);

      const matchTier = 
        tierFilter === 'all' || 
        (c.tierRating || 'UNRATED') === tierFilter;

      return matchSearch && matchStatus && matchVerified && matchTier;
    })
    .sort((a, b) => {
      if (sortBy === 'tier_rank') {
        const rankA = TIER_ORDER.indexOf(a.tierRating || 'UNRATED');
        const rankB = TIER_ORDER.indexOf(b.tierRating || 'UNRATED');
        if (rankA !== rankB) return rankA - rankB;
        return b.totalSpent - a.totalSpent;
      }
      if (sortBy === 'spend_desc') return b.totalSpent - a.totalSpent;
      if (sortBy === 'orders_desc') return b.ordersCount - a.ordersCount;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'ar');
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Calculate Metrics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalCustomInquiries = customers.reduce((sum, c) => sum + c.customRequestsCount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي العملاء والأساتذة</span>
            <span className="text-2xl font-black text-slate-900 font-tajawal">{totalCustomers}</span>
            <span className="text-[11px] text-emerald-600 block mt-1 font-medium">مسجلين بالمنصة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-900 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">الحسابات النشطة</span>
            <span className="text-2xl font-black text-emerald-600 font-tajawal">{activeCustomers}</span>
            <span className="text-[11px] text-slate-400 block mt-1">حساب فعال وموثق</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي مبيعات العملاء</span>
            <span className="text-2xl font-black text-amber-600 font-tajawal">
              {totalRevenue.toLocaleString('ar-EG')} <span className="text-xs font-normal text-slate-600">ج.م</span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">عبر منصات السعيد</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">طلبات المنصات الخاصة</span>
            <span className="text-2xl font-black text-indigo-950 font-tajawal">{totalCustomInquiries}</span>
            <span className="text-[11px] text-amber-600 block mt-1 font-medium">قيد المتابعة والتفاوض</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. FILTER & CONTROLS BAR */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المعلم، البريد الإلكتروني، رقم الهاتف، أو المحافظة..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          </div>

          {/* Action Buttons & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tier Rating Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">تصنيف العملاء (الكل)</option>
              <option value="A_PLUS_PLUS">👑 A++ | عميل استثنائي (خصم 50%)</option>
              <option value="A_PLUS">⭐ A+ | عميل مميز جداً (خصم 30%)</option>
              <option value="A">🏅 A | عميل ممتاز (خصم 20%)</option>
              <option value="B_PLUS_PLUS">B++ | عميل جيد جداً مرتفع</option>
              <option value="B_PLUS">B+ | عميل جيد جداً</option>
              <option value="B">B | عميل جيد</option>
              <option value="C_PLUS">C+ | عميل متوسط</option>
              <option value="D_MINUS">D- | تحت المراجعة</option>
              <option value="F">F | محظور / غير جاد</option>
              <option value="UNRATED">⚡ جديد (قيد التقييم)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">الحسابات النشطة فقط</option>
              <option value="suspended">الحسابات الموقوفة</option>
            </select>

            {/* Verified Filter */}
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">حالة التوثيق (الكل)</option>
              <option value="verified">موثق بالبريد</option>
              <option value="unverified">غير موثق</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="tier_rank">أولويات التصنيف (A++ في المقدمة)</option>
              <option value="spend_desc">الأعلى إنفاقاً</option>
              <option value="orders_desc">الأكثر طلباً</option>
              <option value="date_desc">الأحدث تسجيلاً</option>
              <option value="name_asc">الترتيب الأبجدي</option>
            </select>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              title="تصدير بيانات العملاء إلى ملف Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>تصدير Excel</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchCustomers(false)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results summary count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            عرض <strong className="text-slate-800 font-bold">{filteredCustomers.length}</strong> من أصل {customers.length} عميل ومعلم
          </span>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-amber-600 hover:underline font-medium"
            >
              مسح البحث
            </button>
          )}
        </div>
      </div>

      {/* 3. MAIN CUSTOMERS TABLE */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">جاري تحميل دليل العملاء...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3 opacity-60" />
            <h4 className="text-base font-bold text-slate-700 font-tajawal mb-1">لا يوجد عملاء مطابقين للبحث</h4>
            <p className="text-xs">جرب تغيير معايير البحث أو تصفية الحالة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600">
                  <th className="py-4 px-5">العميل / المعلم</th>
                  <th className="py-4 px-4">تصنيف العميل والامتيازات</th>
                  <th className="py-4 px-4">بيانات التواصل</th>
                  <th className="py-4 px-4">الموقع الجغرافي</th>
                  <th className="py-4 px-4">حالة الحساب</th>
                  <th className="py-4 px-4">المشتريات والطلبات</th>
                  <th className="py-4 px-4">الطلبات المخصصة</th>
                  <th className="py-4 px-4">تاريخ الانضمام</th>
                  <th className="py-4 px-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCustomers.map((cust) => {
                  const isSuspended = cust.status === 'suspended';
                  return (
                    <tr 
                      key={cust.id} 
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSuspended ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 to-indigo-950 text-amber-400 flex items-center justify-center font-bold text-sm shadow-xs">
                              {cust.name.charAt(0)}
                            </div>
                            {cust.unreadMessagesCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                {cust.unreadMessagesCount}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 font-tajawal hover:text-amber-600 cursor-pointer" onClick={() => openCustomerModal(cust.id)}>
                                {cust.name}
                              </span>
                              {cust.isVerified ? (
                                <span title="موثق بالبريد الإلكتروني">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
                                </span>
                              ) : (
                                <span title="غير موثق">
                                  <ShieldAlert className="w-4 h-4 text-slate-400 inline" />
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 block truncate max-w-[180px]">
                              {cust.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer Tier Classification */}
                      <td className="py-4 px-4">
                        <CustomerTierBadgeCard tierRating={cust.tierRating} compact />
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-xs">
                          {cust.phone ? (
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span className="dir-ltr font-mono">{cust.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">بدون هاتف</span>
                          )}
                          {cust.whatsapp && cust.whatsapp !== cust.phone && (
                            <div className="flex items-center gap-1.5 text-emerald-700">
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">واتساب:</span>
                              <span className="dir-ltr font-mono">{cust.whatsapp}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <div className="text-xs">
                          {cust.governorate ? (
                            <div className="flex items-center gap-1 text-slate-700 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" />
                              <span>{cust.governorate}</span>
                              {cust.region && <span className="text-slate-400">({cust.region})</span>}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">غير محدد</span>
                          )}
                        </div>
                      </td>

                      {/* Account Status Toggle */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(cust)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            cust.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title="اضغط للتغيير بين نشط وموقوف"
                        >
                          {cust.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>نشط</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>موقوف</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Orders & Total Spent */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            {cust.ordersCount} طلبات
                          </span>
                          <span className="text-xs font-bold text-emerald-700 font-tajawal">
                            {cust.totalSpent.toLocaleString('ar-EG')} ج.م
                          </span>
                        </div>
                      </td>

                      {/* Custom Platform Requests */}
                      <td className="py-4 px-4">
                        {cust.customRequestsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md text-xs font-bold">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            {cust.customRequestsCount} طلب مخصص
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {new Date(cust.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* 1. Open Chat */}
                          <button
                            onClick={() => onOpenChat(cust.id)}
                            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-800 hover:text-slate-950 transition-colors"
                            title="فتح المحادثة المباشرة مع العميل"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* 2. Direct WhatsApp */}
                          {(cust.whatsapp || cust.phone) && (
                            <button
                              onClick={() => window.open(`https://wa.me/2${cust.whatsapp || cust.phone}`, '_blank')}
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white transition-colors"
                              title="محادثة واتساب"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          )}

                          {/* 3. View Full Profile */}
                          <button
                            onClick={() => openCustomerModal(cust.id)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="عرض الملف الكامل والمشتريات"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* 4. Edit / Admin Notes */}
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-900 text-indigo-800 hover:text-white transition-colors"
                            title="تعديل البيانات وإضافة ملاحظات"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* 5. Delete Customer */}
                          <button
                            onClick={() => setDeletingId(cust.id)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors"
                            title="حذف العميل"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. FULL CUSTOMER PROFILE MODAL */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-amber-400 flex items-center justify-center font-bold text-xl">
                  {customerModalData?.customer?.name?.charAt(0) || 'ع'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-tajawal">
                    {customerModalData?.customer?.name}
                  </h3>
                  <p className="text-xs text-slate-500">{customerModalData?.customer?.email}</p>
                </div>
              </div>
              <button 
                onClick={closeCustomerModal}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingModal ? (
              <div className="py-12 text-center text-slate-500">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span>جاري تحميل بيانات العميل...</span>
              </div>
            ) : customerModalData ? (
              <div className="space-y-6">
                {/* Customer Sovereign Tier & Privileges Card */}
                <CustomerTierBadgeCard 
                  tierRating={customerModalData.customer.tierRating} 
                  tierNotes={customerModalData.customer.tierNotes}
                  customerName={customerModalData.customer.name}
                  ordersCount={customerModalData.customer.ordersCount}
                  totalSpent={customerModalData.customer.totalSpent}
                />

                {/* Contact & Location Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">الهاتف الأساسي</span>
                    <span className="text-xs font-bold text-slate-800 dir-ltr block font-mono">
                      {customerModalData.customer.phone || 'غير مسجل'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">الواتساب</span>
                    <span className="text-xs font-bold text-slate-800 dir-ltr block font-mono">
                      {customerModalData.customer.whatsapp || customerModalData.customer.phone || 'غير مسجل'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">المحافظة والمنطقة</span>
                    <span className="text-xs font-bold text-slate-800 block">
                      {customerModalData.customer.governorate || 'غير محدد'} {customerModalData.customer.region ? `(${customerModalData.customer.region})` : ''}
                    </span>
                  </div>
                </div>

                {/* Admin Notes */}
                {customerModalData.customer.adminNotes && (
                  <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-amber-900 block mb-1">ملاحظات الإدارة المسجلة:</span>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {customerModalData.customer.adminNotes}
                    </p>
                  </div>
                )}

                {/* Registered Platform Idea */}
                {customerModalData.customer.platformIdea && (
                  <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-indigo-950 block mb-1">فكرة المنصة عند التسجيل:</span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {customerModalData.customer.platformIdea}
                    </p>
                  </div>
                )}

                {/* Orders History */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-tajawal mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                    سجل المشتريات والمدفوعات ({customerModalData.orders?.length || 0})
                  </h4>
                  {customerModalData.orders?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl">لا توجد عمليات شراء مكتملة بعد</p>
                  ) : (
                    <div className="space-y-2">
                      {customerModalData.orders.map((ord: any) => (
                        <div key={ord.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{ord.buyerName}</span>
                            <span className="text-slate-400 font-mono text-[11px]">كود الدخول: {ord.accessCode || 'N/A'}</span>
                          </div>
                          <div className="text-left">
                            <span className="font-bold text-emerald-700 text-sm font-tajawal block">{ord.amount} ج.م</span>
                            <span className="text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString('ar-EG')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Platform Requests */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-tajawal mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    طلبات المنصات الخاصة ({customerModalData.customRequests?.length || 0})
                  </h4>
                  {customerModalData.customRequests?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl">لم يقم بتقديم طلبات منصات خاصة</p>
                  ) : (
                    <div className="space-y-3">
                      {customerModalData.customRequests.map((req: any) => (
                        <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-indigo-950 text-sm">{req.platformName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {req.status === 'pending' ? 'قيد المراجعة' : req.status}
                            </span>
                          </div>
                          <div className="text-slate-600 space-y-1">
                            <div><strong className="text-slate-700">المعلم / المادة:</strong> {req.teacherName} - {req.subject}</div>
                            {req.additionalRequirements && (
                              <p className="text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100 mt-1">
                                {req.additionalRequirements}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={() => {
                      closeCustomerModal();
                      onOpenChat(customerModalData.customer.id);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>محادثة العميل بالمنصة</span>
                  </button>
                  <button
                    onClick={closeCustomerModal}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* 5. EDIT & NOTES MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900 font-tajawal flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                تعديل بيانات العميل وملاحظات الإدارة
              </h3>
              <button 
                onClick={() => setEditingCustomer(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم العميل / المعلم</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الهاتف</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs dir-ltr focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الواتساب</label>
                  <input
                    type="text"
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs dir-ltr focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة</label>
                  <input
                    type="text"
                    value={editForm.governorate}
                    onChange={(e) => setEditForm({ ...editForm, governorate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة</label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة الحساب</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white font-bold"
                  >
                    <option value="active">نشط</option>
                    <option value="suspended">موقوف</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التوثيق</label>
                  <select
                    value={editForm.isVerified ? 'yes' : 'no'}
                    onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.value === 'yes' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white font-bold"
                  >
                    <option value="yes">موثق</option>
                    <option value="no">غير موثق</option>
                  </select>
                </div>
              </div>

              {/* Customer Rating & Tier Classification Section */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>تصنيف وتقييم العميل السيادي (الدرجة والامتيازات)</span>
                  </label>
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    خصم {editForm.tierDiscountPercent}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">فئة التقييم الرسمية</label>
                    <select
                      value={editForm.tierRating}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        const info = getTierInfo(newCode);
                        setEditForm({
                          ...editForm,
                          tierRating: newCode,
                          tierDiscountPercent: info.discountPercent
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="A_PLUS_PLUS">👑 A++ | عميل استثنائي VIP (خصم 50% مؤكد منصة ثانية)</option>
                      <option value="A_PLUS">⭐ A+ | عميل مميز جداً (خصم 30%)</option>
                      <option value="A">🏅 A | عميل ممتاز (خصم 20%)</option>
                      <option value="B_PLUS_PLUS">B++ | عميل جيد جداً مرتفع (خصم 15%)</option>
                      <option value="B_PLUS">B+ | عميل جيد جداً (خصم 10%)</option>
                      <option value="B">B | عميل جيد (خصم 5%)</option>
                      <option value="C_PLUS">C+ | عميل متوسط</option>
                      <option value="C">C | عميل قياسي</option>
                      <option value="D_MINUS">D- | تحت المراجعة الانضباطية (سداد كامل مقدماً)</option>
                      <option value="D_MINUS_MINUS">D-- | ضعيف الالتزام (تطبيق شرط 20%)</option>
                      <option value="F">F | محظور / غير جاد</option>
                      <option value="UNRATED">⚡ جديد (سيتم إعلان التقييم بعد أول شراء)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">نسبة الخصم المعتمدة (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editForm.tierDiscountPercent}
                      onChange={(e) => setEditForm({ ...editForm, tierDiscountPercent: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ملاحظات وسبب التقييم (تظهر للعميل في واجهته)</label>
                  <textarea
                    rows={2}
                    value={editForm.tierNotes}
                    onChange={(e) => setEditForm({ ...editForm, tierNotes: e.target.value })}
                    placeholder="مثال: تم إقرار التقييم الاستثنائي A++ نظراً للالتزام الفائق بالتعاقدات وحجز المواعيد. مؤهل لخصم 50% على المنصة القادمة..."
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الإدارة الخاصة (سرية)</label>
                <textarea
                  rows={3}
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                  placeholder="سجل أي ملاحظات خاصة بالمعلم، الاتفاقات السعرية، أو متطلبات المنصة..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-indigo-950 hover:bg-indigo-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {savingEdit ? (
                    <span>جاري الحفظ...</span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      <span>حفظ التعديلات</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-tajawal mb-2">تأكيد حذف العميل</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا العميل وجميع رسائله وطلباته المرتبطة به نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingId(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDeleteCustomer(deletingId)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                نعم، احذف العميل
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
