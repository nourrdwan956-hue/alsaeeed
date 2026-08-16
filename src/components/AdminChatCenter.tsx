import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  Search, 
  User, 
  Phone, 
  Check, 
  CheckCheck, 
  RefreshCw, 
  ExternalLink,
  Crown,
  Sparkles,
  FileText,
  Eye,
  Rocket,
  Settings2
} from 'lucide-react';
import CreateInvoiceModal from './CreateInvoiceModal';
import FormalInvoiceDocument, { InvoiceData } from './FormalInvoiceDocument';
import AdminDeliveryManagerModal from './AdminDeliveryManagerModal';

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  governorate?: string;
  region?: string;
}

interface ConversationItem {
  customer: CustomerInfo;
  lastMessage: {
    id: string;
    message: string;
    sender: 'admin' | 'customer';
    createdAt: string;
    isReadByAdmin: boolean;
  } | null;
  unreadCount: number;
  totalMessages: number;
  lastActivity: string;
}

interface Message {
  id: string;
  customerId: string;
  sender: 'admin' | 'customer';
  senderName: string;
  message: string;
  isReadByAdmin: boolean;
  isReadByCustomer: boolean;
  createdAt: string;
}

interface AdminChatCenterProps {
  initialCustomerId?: string | null;
}

export default function AdminChatCenter({ initialCustomerId }: AdminChatCenterProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(initialCustomerId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceData | null>(null);
  const [managingDeliveryInvoice, setManagingDeliveryInvoice] = useState<InvoiceData | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<InvoiceData[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchCustomerInvoices = async () => {
    if (!selectedCustomerId) return;
    try {
      const res = await fetch(`/api/invoices?customerId=${selectedCustomerId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomerInvoices(data.map(item => item.invoice));
      }
    } catch (err) {
      console.error("Error fetching customer invoices:", err);
    }
  };

  // Fetch all conversations
  const fetchConversations = async (silent = false) => {
    if (!silent) setLoadingList(true);
    try {
      const res = await fetch('/api/admin/conversations');
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
        if (!selectedCustomerId && data.length > 0) {
          setSelectedCustomerId(data[0].customer.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      if (!silent) setLoadingList(false);
    }
  };

  // If initialCustomerId changes from parent, select it
  useEffect(() => {
    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }, [initialCustomerId]);

  // Initial & interval fetch of conversations
  useEffect(() => {
    fetchConversations(false);
    const interval = setInterval(() => fetchConversations(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages for selected customer
  const fetchMessages = async (silent = false) => {
    if (!selectedCustomerId) return;
    if (!silent) setLoadingChat(true);
    try {
      const res = await fetch(`/api/messages/${selectedCustomerId}?role=admin`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
      fetchCustomerInvoices();
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      if (!silent) setLoadingChat(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      fetchMessages(false);
      const interval = setInterval(() => fetchMessages(true), 3500); // 3.5s poll for active chat
      return () => clearInterval(interval);
    }
  }, [selectedCustomerId]);

  const selectedConversation = conversations.find(c => c.customer.id === selectedCustomerId);

  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customMsg || inputText).trim();
    if (!textToSend || !selectedCustomerId || sending) return;

    setSending(true);
    if (!customMsg) setInputText('');

    // Optimistic insert
    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      customerId: selectedCustomerId,
      sender: 'admin',
      senderName: 'إدارة السعيد 👑',
      message: textToSend,
      isReadByAdmin: true,
      isReadByCustomer: false,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          sender: 'admin',
          senderName: 'إدارة السعيد 👑',
          message: textToSend
        })
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => prev.map(m => m.id === tempMessage.id ? data.message : m));
        // Refresh conversation list preview
        fetchConversations(true);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.customer.name.toLowerCase().includes(q) ||
      c.customer.email.toLowerCase().includes(q) ||
      (c.customer.phone && c.customer.phone.includes(q))
    );
  });

  const quickReplies = [
    "مرحباً بك يا أستاذنا. لقد استلمنا طلب منصتك وسعداء جداً بالتعاون معك.",
    "يمكنك سداد الفاتورة أو الدفعة عبر تحويل فودافون كاش / إنستاباي على الرقم: 01151157100 وسنقوم بتفعيل المنصة فوراً.",
    "إذا كنت ترغب في مقابلة شخصية ودفع يدوي، نوفر لك مقابلة مندوبنا المعتمد في محافظتي (القاهرة أو الإسكندرية) مع تسليمك بطاقة الموعد وإيصال رسمي.",
    "يرجى العلم بأنه في حال إلغاء طلب المنصة بعد الاعتماد، يتم خصم 20% مصاريف إدارية وحجز سيرفرات ولا يمكن التفاوض فيها.",
    "بناءً على المتطلبات، السعر المبدئي التقديري هو ... ج.م وقابل للتفاوض حسب الميزات المطلوبة.",
    "المنصة تشمل سيرفرات سحابية فائقة السرعة، حماية فيديوهات ضد التسجيل، ولوحة تحكم شاملة للطلاب والامتحانات."
  ];

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[720px] animate-in fade-in duration-300">
      
      {/* SIDEBAR: Conversations List */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-l border-slate-200 flex flex-col bg-slate-50/50">
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800 font-tajawal">محادثات العملاء</h3>
            </div>
            <button
              onClick={() => fetchConversations(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              title="تحديث القائمة"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الهاتف..."
              className="w-full pl-3 pr-9 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>
        </div>

        {/* List of Customers */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingList ? (
            <div className="p-8 text-center text-slate-400 text-sm">جاري تحميل المحادثات...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">لا يوجد عملاء مطابقين للبحث</div>
          ) : (
            filteredConversations.map((item) => {
              const isSelected = item.customer.id === selectedCustomerId;
              return (
                <div
                  key={item.customer.id}
                  onClick={() => setSelectedCustomerId(item.customer.id)}
                  className={`p-4 transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-100 ${
                    isSelected ? 'bg-amber-500/10 border-r-4 border-amber-500' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-base shadow-sm">
                      {item.customer.name.charAt(0)}
                    </div>
                    {item.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate font-tajawal">
                        {item.customer.name}
                      </h4>
                      {item.lastMessage && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0 mr-1">
                          {formatTime(item.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs truncate ${item.unreadCount > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                      {item.lastMessage ? (
                        <span>
                          {item.lastMessage.sender === 'admin' && <span className="text-amber-600">أنت: </span>}
                          {item.lastMessage.message}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">لا توجد رسائل سابقة</span>
                      )}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                      {item.customer.phone && (
                        <span className="dir-ltr text-[11px] font-mono">{item.customer.phone}</span>
                      )}
                      {item.customer.governorate && (
                        <span>• {item.customer.governorate}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN: Active Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Top Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedConversation.customer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base font-tajawal text-white flex items-center gap-2">
                    {selectedConversation.customer.name}
                    <span className="text-[11px] font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      عميل
                    </span>
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="dir-ltr font-mono text-slate-300">{selectedConversation.customer.phone || selectedConversation.customer.email}</span>
                    {selectedConversation.customer.governorate && (
                      <span>• {selectedConversation.customer.governorate}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {customerInvoices.length > 0 && (
                  <button
                    onClick={() => setManagingDeliveryInvoice(customerInvoices[0])}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border border-indigo-400/30"
                    title="إدارة شريط التقدم، مراحل البناء وتفعيل/قفل الميزات"
                  >
                    <Rocket className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">إدارة تسليم المنصة</span>
                  </button>
                )}

                <button
                  onClick={() => setShowCreateInvoiceModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
                  title="إنشاء وثيقة وعرض سعر رسمي معتمد"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-950" />
                  <span>إصدار فاتورة / عرض سعر</span>
                </button>

                {selectedConversation.customer.whatsapp || selectedConversation.customer.phone ? (
                  <button
                    onClick={() => window.open(`https://wa.me/2${selectedConversation.customer.whatsapp || selectedConversation.customer.phone}`, '_blank')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">واتساب</span>
                  </button>
                ) : null}
                
                <button
                  onClick={() => fetchMessages(true)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="تحديث الرسائل"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-50/60 space-y-4">
              {loadingChat ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-3 border border-amber-100">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base mb-1 font-tajawal">ابدأ المحادثة مع العميل</h4>
                  <p className="text-slate-500 text-xs max-w-sm mb-4">
                    يمكنك إرسال رسالة ترحيبية، أو عرض السعر المبدئي ومناقشة تفاصيل المنصة.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isMe ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      {isMe ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center flex-shrink-0 text-slate-950 font-bold text-xs shadow-sm">
                          <Crown className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="order-2 w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm">
                          {selectedConversation.customer.name.charAt(0)}
                        </div>
                      )}

                      <div className={`max-w-[78%] md:max-w-[70%] flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                        <span className="text-[11px] text-slate-400 mb-1 px-1 font-medium">
                          {isMe ? 'أنت (إدارة السعيد)' : selectedConversation.customer.name}
                        </span>

                        <div
                          className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                            isMe
                              ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-tr-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.message}
                        </div>

                        <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMe && (
                            <span title={msg.isReadByCustomer ? 'قرأها العميل' : 'تم الإرسال'}>
                              {msg.isReadByCustomer ? (
                                <CheckCheck className="w-3.5 h-3.5 text-amber-500 inline" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick response chips for Admin */}
            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-2 no-scrollbar">
              <span className="text-[11px] font-bold text-slate-500 self-center flex items-center gap-1 flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                ردود سريعة:
              </span>
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, reply)}
                  className="text-[11px] whitespace-nowrap bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 px-3 py-1.5 rounded-full border border-slate-200 transition-colors shadow-xs"
                >
                  {reply.slice(0, 32)}...
                </button>
              ))}
            </div>

            {/* Send Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب ردك للعميل هنا..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-800 text-sm"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !inputText.trim()}
                className="px-5 py-3 bg-indigo-950 hover:bg-indigo-900 text-white font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>إرسال</span>
                    <Send className="w-4 h-4 rotate-180 text-amber-400" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-600 mb-1 font-tajawal">اختر عميلاً من القائمة</h3>
            <p className="text-sm">اضغط على أي عميل في القائمة الجانبية لبدء المحادثة ومتابعة تفاصيل طلبه.</p>
          </div>
        )}
      </div>

      {/* Modal: Create Official Invoice */}
      {showCreateInvoiceModal && selectedConversation && (
        <CreateInvoiceModal
          customerId={selectedConversation.customer.id}
          customerName={selectedConversation.customer.name}
          customerPhone={selectedConversation.customer.phone || selectedConversation.customer.whatsapp}
          onClose={() => setShowCreateInvoiceModal(false)}
          onCreated={(newInv) => {
            fetchMessages(true);
            setViewingInvoice(newInv);
          }}
        />
      )}

      {/* Modal: View Official Formal Document */}
      {viewingInvoice && (
        <FormalInvoiceDocument
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
        />
      )}

      {/* Modal: Manage Platform Delivery Progress & Modules */}
      {managingDeliveryInvoice && (
        <AdminDeliveryManagerModal
          invoice={managingDeliveryInvoice}
          onClose={() => setManagingDeliveryInvoice(null)}
          onUpdated={(updatedInv) => {
            setCustomerInvoices(prev => prev.map(inv => inv.id === updatedInv.id ? updatedInv : inv));
            if (viewingInvoice?.id === updatedInv.id) {
              setViewingInvoice(updatedInv);
            }
            fetchCustomerInvoices();
          }}
        />
      )}
    </div>
  );
}
