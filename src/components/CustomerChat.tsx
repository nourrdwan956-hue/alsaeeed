import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  Crown, 
  User, 
  Check, 
  CheckCheck, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  CreditCard, 
  Eye, 
  Clock, 
  ShieldCheck,
  Rocket,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import FormalInvoiceDocument, { InvoiceData } from './FormalInvoiceDocument';
import PlatformDeliveryTimeline from './PlatformDeliveryTimeline';

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

interface CustomerChatProps {
  customerId?: string;
  customerEmail: string;
  customerName: string;
}

export default function CustomerChat({ customerId, customerEmail, customerName }: CustomerChatProps) {
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(customerId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [selectedInvoiceForDoc, setSelectedInvoiceForDoc] = useState<InvoiceData | null>(null);
  const [showDeliveryTimeline, setShowDeliveryTimeline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If customerId is not provided, fetch customer ID by email
  useEffect(() => {
    if (!activeCustomerId && customerEmail) {
      fetch(`/api/customer/me/${encodeURIComponent(customerEmail)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setActiveCustomerId(data.id);
          }
        })
        .catch(err => console.error("Error fetching customer profile:", err));
    }
  }, [activeCustomerId, customerEmail]);

  const fetchCustomerInvoices = async () => {
    if (!activeCustomerId) return;
    try {
      const res = await fetch(`/api/invoices?customerId=${activeCustomerId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setInvoices(data.map(item => item.invoice));
      }
    } catch (err) {
      console.error("Error fetching customer invoices:", err);
    }
  };

  const fetchMessages = async (showLoading = false) => {
    if (!activeCustomerId) return;
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/messages/${activeCustomerId}?role=customer`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
      fetchCustomerInvoices();
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCustomerId) {
      fetchMessages(true);
      const interval = setInterval(() => fetchMessages(false), 3500); // live polling every 3.5s
      return () => clearInterval(interval);
    }
  }, [activeCustomerId]);

  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customMsg || inputText).trim();
    if (!textToSend || !activeCustomerId || sending) return;

    setSending(true);
    if (!customMsg) setInputText('');

    // Optimistic message
    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      customerId: activeCustomerId,
      sender: 'customer',
      senderName: customerName,
      message: textToSend,
      isReadByAdmin: false,
      isReadByCustomer: true,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: activeCustomerId,
          sender: 'customer',
          senderName: customerName,
          message: textToSend
        })
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => prev.map(m => m.id === tempMessage.id ? data.message : m));
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    "مرحباً، أود معرفة السعر التقديري للمنصة المطلوبة وموعد التسليم المبدئي.",
    "هل يمكن إضافة ميزة بنك الأسئلة التفاعلي مع التصحيح التلقائي؟",
    "ما هي طرق الدفع المتاحة لتفعيل المنصة؟",
    "أريد تفعيل ميزة تطبيق الهاتف المخصص (Android / iOS) مع المنصة."
  ];

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Helper to check if message contains invoice number
  const findInvoiceInMessage = (text: string) => {
    const match = text.match(/SA-\d{4}-\d{4}/);
    if (match && invoices.length > 0) {
      return invoices.find(inv => inv.invoiceNumber === match[0]);
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[680px] animate-in fade-in duration-300">
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <span className="w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full absolute bottom-0 right-0"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg font-tajawal text-white">إدارة منصات السعيد</h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                مباشر
              </span>
            </div>
            <p className="text-xs text-slate-400">قسم التفاوض، عروض الأسعار، وإصدار عقود المنصات الرسمية</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {invoices.length > 0 && (
            <>
              <button
                onClick={() => setShowDeliveryTimeline(!showDeliveryTimeline)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border ${
                  showDeliveryTimeline
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                }`}
                title="متابعة مراحل التنفيذ ونسبة إنجاز المنصة"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>{showDeliveryTimeline ? 'العودة للمحادثة' : 'شريط بناء المنصة'}</span>
              </button>

              <button
                onClick={() => setSelectedInvoiceForDoc(invoices[0])}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
                title="عرض وثيقة السعر الرسمية"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>الوثيقة الرسمية</span>
              </button>
            </>
          )}
          <button 
            onClick={() => fetchMessages(true)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
            title="تحديث الرسائل"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main View: Either Platform Delivery Timeline or Live Chat Messages */}
      {showDeliveryTimeline && invoices.length > 0 ? (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-100/70">
          <PlatformDeliveryTimeline 
            invoice={invoices[0]} 
            onViewInvoice={(inv) => setSelectedInvoiceForDoc(inv)} 
          />
        </div>
      ) : (
        <>
          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-50/50 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-4 border border-amber-100 shadow-sm">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-2 font-tajawal">مرحباً بك في المحادثة المباشرة!</h4>
            <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
              يمكنك هنا طرح أي استفسار حول منصتك المطلوبة، طلب عرض سعر رسمي، ومناقشة تفاصيل المميزات مع الإدارة مباشرة.
            </p>
            <div className="w-full max-w-md space-y-2">
              <span className="text-xs font-bold text-slate-400 block mb-2">استفسارات سريعة مقترحة:</span>
              {quickPrompts.slice(0, 2).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, prompt)}
                  className="w-full text-right text-xs bg-white hover:bg-amber-50/80 text-slate-700 hover:text-amber-900 p-3 rounded-xl border border-slate-200 hover:border-amber-300 transition-all shadow-sm flex items-center justify-between"
                >
                  <span>{prompt}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mr-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === 'customer';
            const matchedInvoice = findInvoiceInMessage(msg.message);

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isMe ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {/* Sender Avatar */}
                {isMe ? (
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700 font-bold text-sm shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="order-2 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center flex-shrink-0 text-slate-950 font-bold text-sm shadow-sm">
                    <Crown className="w-5 h-5" />
                  </div>
                )}

                <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                  {/* Sender Name */}
                  <span className="text-[11px] text-slate-400 mb-1 px-1 font-medium">
                    {isMe ? 'أنت' : (msg.senderName || 'إدارة منصات السعيد 👑')}
                  </span>

                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      isMe
                        ? 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}
                  >
                    {msg.message}

                    {/* INTERACTIVE INVOICE CARD INSIDE CHAT */}
                    {matchedInvoice && (
                      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border-2 border-amber-400/40 shadow-lg text-right">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                            <span className="text-xs font-black text-amber-400 font-tajawal">
                              وثيقة عرض سعر معتمدة
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400">{matchedInvoice.invoiceNumber}</span>
                        </div>

                        <div className="py-3 space-y-1.5">
                          <h5 className="font-bold text-sm text-white font-tajawal">{matchedInvoice.platformTitle}</h5>
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-slate-400">القيمة الاستثمارية:</span>
                            <strong className="text-base font-black text-amber-300 font-tajawal">
                              {Number(matchedInvoice.amount).toLocaleString('ar-EG')} ج.م
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>حالة السعر:</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              matchedInvoice.isNegotiable ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {matchedInvoice.isNegotiable ? 'قابل للتفاوض' : 'سعر نهائي معتمد'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex gap-2">
                          <button
                            onClick={() => setSelectedInvoiceForDoc(matchedInvoice)}
                            className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة الوثيقة والسداد</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Status */}
                  <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                    <span>{formatTime(msg.createdAt)}</span>
                    {isMe && (
                      <span title={msg.isReadByAdmin ? 'تمت القراءة بواسطة الإدارة' : 'تم الإرسال'}>
                        {msg.isReadByAdmin ? (
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

      {/* Suggested chips (when in chat) */}
      {messages.length > 0 && (
        <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(undefined, prompt)}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-900 px-3 py-1.5 rounded-full border border-slate-200 transition-colors shadow-xs"
            >
              {prompt.slice(0, 35)}...
            </button>
          ))}
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3 items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="اكتب رسالتك أو استفسارك هنا..."
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-800 text-sm"
          disabled={sending || !activeCustomerId}
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim() || !activeCustomerId}
          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>إرسال</span>
              <Send className="w-4 h-4 rotate-180" />
            </>
          )}
        </button>
      </form>
        </>
      )}

      {/* Formal Document Modal with Payment Capability */}
      {selectedInvoiceForDoc && (
        <FormalInvoiceDocument
          invoice={selectedInvoiceForDoc}
          isCustomerView={true}
          onPayNow={(updated) => {
            fetchCustomerInvoices();
            fetchMessages(false);
          }}
          onClose={() => setSelectedInvoiceForDoc(null)}
        />
      )}
    </div>
  );
}

