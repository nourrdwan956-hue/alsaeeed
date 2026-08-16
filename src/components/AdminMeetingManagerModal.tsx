import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  UserCheck, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Save, 
  Printer, 
  QrCode,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { InPersonMeetingData } from '../types/payment';
import InPersonMeetingCard from './InPersonMeetingCard';

interface AdminMeetingManagerModalProps {
  onClose: () => void;
}

export default function AdminMeetingManagerModal({ onClose }: AdminMeetingManagerModalProps) {
  const [meetings, setMeetings] = useState<InPersonMeetingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeetingForCard, setSelectedMeetingForCard] = useState<InPersonMeetingData | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<InPersonMeetingData | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [filterGov, setFilterGov] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/in-person-meetings');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMeetings(data);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (meetingId: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      const res = await fetch(`/api/admin/in-person-meetings/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setMeetings(prev => prev.map(m => m.id === meetingId ? data.meeting : m));
      }
    } catch (err) {
      console.error('Error updating meeting status:', err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/in-person-meetings/${editingMeeting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate: editingMeeting.scheduledDate,
          scheduledTime: editingMeeting.scheduledTime,
          governorate: editingMeeting.governorate,
          region: editingMeeting.region,
          specificAddress: editingMeeting.specificAddress,
          employeeName: editingMeeting.employeeName,
          employeePhone: editingMeeting.employeePhone,
          employeeTitle: editingMeeting.employeeTitle,
          amountToCollect: editingMeeting.amountToCollect,
          adminNotes: editingMeeting.adminNotes,
          status: editingMeeting.status
        })
      });
      const data = await res.json();
      if (data.success) {
        setMeetings(prev => prev.map(m => m.id === editingMeeting.id ? data.meeting : m));
        setEditingMeeting(null);
      }
    } catch (err) {
      console.error('Error saving meeting:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Filtered meetings
  const filteredMeetings = meetings.filter(m => {
    if (filterGov !== 'all' && m.governorate !== filterGov) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.customerName.toLowerCase().includes(q) ||
        m.customerPhone.includes(q) ||
        m.meetingNumber.toLowerCase().includes(q) ||
        m.verificationCode.toLowerCase().includes(q) ||
        m.region.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-right font-sans">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-tajawal">
                مركز إدارة المقابلات والدفع اليدوي (القاهرة والإسكندرية)
              </h3>
              <p className="text-[11px] text-amber-400 font-semibold">
                تنسيق المواعيد بالساعة، تعيين المندوبين، وتوثيق استلام المبالغ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم المعلم، الهاتف، رقم الموعد أو كود التحقق..."
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-8 text-xs font-medium focus:border-amber-500 focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Gov filter */}
            <select
              value={filterGov}
              onChange={(e) => setFilterGov(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="all">كل المحافظات</option>
              <option value="القاهرة">القاهرة</option>
              <option value="الإسكندرية">الإسكندرية</option>
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="all">كل الحالات</option>
              <option value="scheduled">مجدولة / قيد التنفيذ</option>
              <option value="completed">تم التحصيل بنجاح</option>
              <option value="cancelled">ملغاة</option>
            </select>

            <button
              onClick={fetchMeetings}
              className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl"
              title="تحديث"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span>جاري تحميل طلبات ومواعيد المقابلات...</span>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Building2 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-600 text-sm">لا توجد مواعيد مقابلات مطابقة للبحث</p>
              <p className="text-xs text-slate-400 mt-1">تظهر هنا كافة طلبات المقابلة الشخصية وسداد المنصة نقداً فور إنشائها.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMeetings.map((meet) => (
                <div
                  key={meet.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-amber-400/60 transition-all shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-100 flex items-center justify-center font-black shrink-0">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 font-tajawal">
                            {meet.customerName}
                          </h4>
                          <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {meet.meetingNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{meet.customerPhone}</span>
                          <span>•</span>
                          <span className="font-bold text-slate-700">{meet.governorate} ({meet.region})</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        meet.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : meet.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {meet.status === 'completed' ? 'تم الاستلام والتحصيل ✓' :
                         meet.status === 'cancelled' ? 'ملغاة / غير جاد ✕' : 'موعد معتمد وقائم ⏳'}
                      </span>
                    </div>

                  </div>

                  {/* Meeting Details Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/80 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-500 block text-[11px]">الموعد والتوقيت:</span>
                      <span className="font-bold text-slate-800">{meet.scheduledDate} - {meet.scheduledTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">المندوب المكلف:</span>
                      <span className="font-bold text-indigo-950">{meet.employeeName} ({meet.employeePhone})</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">المبلغ المطلوب:</span>
                      <span className="font-black text-emerald-700 font-tajawal text-sm">
                        {Number(meet.amountToCollect).toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                  </div>

                  {/* Actions & Verification */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-bold">كود التحقق الأمني:</span>
                      <span className="font-mono text-xs font-black text-indigo-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {meet.verificationCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View chic Card */}
                      <button
                        onClick={() => setSelectedMeetingForCard(meet)}
                        className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>عرض البطاقة</span>
                      </button>

                      {/* Edit Details */}
                      <button
                        onClick={() => setEditingMeeting(meet)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-slate-300"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل الموعد والمندوب</span>
                      </button>

                      {/* Mark Completed */}
                      {meet.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(meet.id, 'completed')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>تأكيد الاستلام نقداً</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal: Edit Specific Meeting */}
        {editingMeeting && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
                <h4 className="text-sm font-black text-white font-tajawal">
                  تعديل تفاصيل الموعد والمندوب ({editingMeeting.meetingNumber})
                </h4>
                <button onClick={() => setEditingMeeting(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">تاريخ المقابلة:</label>
                    <input
                      type="text"
                      value={editingMeeting.scheduledDate}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, scheduledDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">الساعة المحددة:</label>
                    <input
                      type="text"
                      value={editingMeeting.scheduledTime}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, scheduledTime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">اسم الموظف / المندوب:</label>
                    <input
                      type="text"
                      value={editingMeeting.employeeName}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, employeeName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-emerald-950"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">هاتف المندوب:</label>
                    <input
                      type="text"
                      value={editingMeeting.employeePhone}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, employeePhone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">العنوان أو النقطة المتفق عليها:</label>
                  <input
                    type="text"
                    value={editingMeeting.specificAddress}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, specificAddress: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">المبلغ المطلوب (ج.م):</label>
                    <input
                      type="text"
                      value={editingMeeting.amountToCollect}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, amountToCollect: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">حالة المقابلة:</label>
                    <select
                      value={editingMeeting.status}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                    >
                      <option value="scheduled">مجدولة / معتمدة</option>
                      <option value="completed">تم الاستلام والتحصيل</option>
                      <option value="cancelled">ملغاة / طلب غير جاد</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditingMeeting(null)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md"
                  >
                    {savingEdit ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Modal: View Chic Meeting Card */}
        {selectedMeetingForCard && (
          <InPersonMeetingCard
            meeting={selectedMeetingForCard}
            onClose={() => setSelectedMeetingForCard(null)}
          />
        )}

      </div>
    </div>
  );
}
