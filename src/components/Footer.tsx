export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16 border-t border-amber-500/10 mt-auto relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-950/80 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex flex-col items-center md:items-start text-center md:text-right">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-500/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
              <img src="/logo.png" alt="شعار السعيد" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-tajawal font-black text-2xl tracking-wide bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 text-transparent bg-clip-text">السعيد</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-400 max-w-xs">الوجهة الأولى للمنصات التعليمية الفاخرة، حيث تجتمع التكنولوجيا المتطورة مع التصميم المتألق.</p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-3">
          <p className="text-lg flex items-center gap-2">
            <span className="text-slate-400">تواصل معنا:</span> 
            <span className="font-bold text-amber-400 tracking-wider bg-slate-900 px-4 py-1.5 rounded-lg border border-amber-500/20 shadow-[0_0_8px_rgba(251,191,36,0.1)]" dir="ltr">01151157100</span>
          </p>
          <p className="text-sm text-slate-500 font-medium">حقوق النشر &copy; 2026 - السعيد. جميع الحقوق محفوظة.</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800/80 flex flex-col items-center justify-center text-center relative z-10 space-y-2">
        <div className="text-amber-400 text-3xl font-black drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse mb-1">
          ⚡
        </div>
        <div className="text-slate-200 text-base sm:text-lg font-bold font-sans tracking-wide">
          Built with <span className="text-rose-500 inline-block animate-bounce">❤️</span> by
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white font-tajawal tracking-wider drop-shadow-md py-0.5">
          Nour El-Saeed
        </div>
        <div className="text-amber-400 text-lg font-bold">
          •
        </div>
        <div className="text-slate-300 text-sm font-semibold tracking-widest uppercase">
          Developer & Designer
        </div>
      </div>
    </footer>
  );
}
