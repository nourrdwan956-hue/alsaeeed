import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Phone, UserCircle, LogOut, QrCode, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scroll = totalScroll / windowHeight;
        setScrollProgress(scroll);
      } else {
        setScrollProgress(0);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        // Adjust for navbar height
        const y = element.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Luxury Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 z-[100] transition-all duration-150 ease-out shadow-[0_0_15px_rgba(251,191,36,0.8)]"
        style={{ width: `${scrollProgress * 100}%` }}
      />
      
      <header className="bg-slate-950/95 text-white shadow-xl sticky top-0 z-50 border-b border-amber-500/20 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/50 group-hover:border-amber-400 transition-colors shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                  <img src="/logo.png" alt="شعار السعيد" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-tajawal font-black text-3xl tracking-wide bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 text-transparent bg-clip-text">السعيد</span>
                  <span className="text-[10px] text-amber-500/80 tracking-widest uppercase font-bold mt-[-4px]">Al-Sa'eed</span>
                </div>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-6 space-x-reverse items-center">
              <Link to="/" onClick={scrollToTop} className="text-gray-300 hover:text-amber-400 transition-colors font-bold text-base hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">الرئيسية</Link>
              <Link to="/#features" onClick={(e) => scrollToSection(e, 'features')} className="text-gray-300 hover:text-amber-400 transition-colors font-bold text-base hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">المميزات</Link>
              <Link to="/#platforms" onClick={(e) => scrollToSection(e, 'platforms')} className="text-gray-300 hover:text-amber-400 transition-colors font-bold text-base hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">المنصات</Link>
              <Link to="/#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="text-gray-300 hover:text-amber-400 transition-colors font-bold text-base hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">كيف تعمل؟</Link>
              
              {/* QR Verification Link */}
              <Link 
                to="/verify" 
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-bold transition-all hover:scale-105 shadow-inner"
                title="فحص وتحقق من وثيقة عبر الـ QR Code"
              >
                <QrCode className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>التحقق من وثيقة</span>
              </Link>
              
              {user ? (
                <div className="flex items-center gap-3 mr-4 border-r border-slate-800 pr-4">
                  <NotificationBell 
                    role={user.role === 'admin' ? 'admin' : 'customer'} 
                    email={user.email} 
                    onNotificationClick={(link) => {
                      if (link) navigate(link);
                      else navigate(user.role === 'admin' ? '/admin?tab=chat' : '/dashboard?tab=chat');
                    }}
                  />

                  <Link 
                    to={user.role === 'admin' ? "/admin" : "/dashboard"}
                    className="flex items-center gap-2 text-amber-100 bg-slate-900/50 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all group shadow-sm"
                  >
                    <UserCircle className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">لوحة التحكم</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-white hover:bg-red-950/50 transition-colors flex items-center gap-1 text-sm bg-slate-900/50 px-3 py-2 rounded-xl border border-slate-800 hover:border-red-900/50"
                  >
                    <LogOut className="w-4 h-4" />
                    خروج
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mr-4 border-r border-slate-800 pr-4">
                  <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-amber-300 transition-colors bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800 hover:border-amber-500/30">دخول</Link>
                  <Link to="/register" className="text-sm font-bold bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 px-5 py-2 rounded-xl hover:from-amber-500 hover:to-amber-300 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] transform hover:-translate-y-0.5">حساب جديد</Link>
                </div>
              )}
            </nav>
            
            <div className="flex items-center gap-3 bg-slate-900/80 px-4 sm:px-5 py-2.5 rounded-2xl border border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.15)] group hover:border-amber-400/50 transition-colors cursor-pointer" onClick={() => window.open('https://wa.me/201151157100', '_blank')}>
              <Phone className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-base sm:text-lg dir-ltr text-amber-50 tracking-wider">01151157100</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
