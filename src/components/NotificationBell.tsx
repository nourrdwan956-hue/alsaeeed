import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, MessageSquare, AlertCircle, ShoppingBag, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string;
  type?: 'message' | 'request' | 'order' | 'system';
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  role: 'admin' | 'customer';
  email?: string;
  onNotificationClick?: (link?: string) => void;
}

export default function NotificationBell({ role, email, onNotificationClick }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const url = role === 'admin' 
        ? '/api/notifications?recipientType=admin'
        : `/api/notifications?recipientType=customer&email=${encodeURIComponent(email || '')}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (data && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount || 0);
        }
      } else {
        // Just silently ignore HTML responses during dev server restarts
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 6000); // poll every 6s
    return () => clearInterval(interval);
  }, [role, email]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, link?: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (link) {
        if (onNotificationClick) {
          onNotificationClick(link);
        } else {
          navigate(link);
        }
        setIsOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipientType: role,
          customerId: notifications.length > 0 ? (notifications[0] as any).customerId : undefined
        })
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case 'request':
        return <AlertCircle className="w-4 h-4 text-indigo-500" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-all flex items-center justify-center focus:outline-none"
        title="الإشعارات"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md shadow-red-500/30">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-auto sm:left-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold font-tajawal text-base">مركز الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد إشعارات جديدة حالياً</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id, item.link)}
                  className={`p-4 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${
                    !item.isRead ? 'bg-amber-50/60 border-r-4 border-amber-500' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-bold truncate ${!item.isRead ? 'text-indigo-950 font-tajawal' : 'text-slate-700'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 flex-shrink-0 mr-2">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    {item.link && (
                      <span className="text-[11px] font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 mt-1.5">
                        عرض التفاصيل
                        <ChevronLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
