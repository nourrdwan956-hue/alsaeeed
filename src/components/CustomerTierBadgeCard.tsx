import React, { useState } from 'react';
import { 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  XCircle, 
  Gift, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert,
  Star,
  Percent,
  TrendingUp,
  Clock
} from 'lucide-react';
import { getTierInfo, TIER_DEFINITIONS, TIER_ORDER, TierInfo } from '../utils/customerTierUtils';

interface CustomerTierBadgeCardProps {
  tierRating?: string;
  tierNotes?: string;
  customerName?: string;
  ordersCount?: number;
  totalSpent?: number;
  compact?: boolean;
}

export default function CustomerTierBadgeCard({
  tierRating = 'UNRATED',
  tierNotes = '',
  customerName = '',
  ordersCount = 0,
  totalSpent = 0,
  compact = false
}: CustomerTierBadgeCardProps) {
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [expandedTierCode, setExpandedTierCode] = useState<string | null>('A_PLUS_PLUS');

  const tier = getTierInfo(tierRating);
  const isUnrated = !tierRating || tierRating === 'UNRATED';

  // Choose icon component
  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Crown':
        return <Crown className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'AlertCircle':
        return <AlertCircle className={className} />;
      case 'AlertTriangle':
        return <AlertTriangle className={className} />;
      case 'XCircle':
        return <XCircle className={className} />;
      default:
        return <ShieldCheck className={className} />;
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${tier.colorClass} ${tier.borderClass}`}>
        {renderIcon(tier.iconName, 'w-3.5 h-3.5 shrink-0')}
        <span>تصنيف العميل: {tier.badge}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${tier.bgGradient} ${tier.borderClass} p-6 text-white shadow-2xl transition-all`}>
      {/* Background Decorative Elements */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner shrink-0">
            {renderIcon(tier.iconName, `w-7 h-7 ${tier.severity === 'vip' ? 'text-amber-400 animate-bounce' : tier.severity === 'excellent' ? 'text-emerald-400' : 'text-blue-400'}`)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                منظومة تقييم وتصنيف العملاء المعتمدة
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide ${tier.colorClass}`}>
                {tier.badge}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              {tier.title}
            </h3>
          </div>
        </div>

        {/* View All Tiers Modal Button */}
        <button
          onClick={() => setShowCriteriaModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-md shrink-0"
        >
          <Info className="w-4 h-4 text-amber-400" />
          <span>ميثاق وشروط تصنيفات العملاء</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="relative z-10 pt-6">
        {isUnrated ? (
          /* NEW / UNRATED CLIENT STATE */
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
                <Clock className="w-6 h-6 animate-spin-slow" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تنويه إداري رسمي</span>
                </div>
                <h4 className="text-lg font-bold text-amber-200 leading-snug">
                  سيتم إعلان التصنيف والامتيازات الرسمية بين الإدارة والعميل فور إتمام أول عملية شراء بنجاح
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  أهلاً بك أستاذ <span className="font-bold text-white">{customerName || 'العميل العزيز'}</span> في منظومة المنصات التعليمية. يتم تقييم العميل وتحديد نسب التخفيضات الاستثنائية والامتيازات السيادية تلقائياً بعد إتمام وتوثيق الشراء الأول، مع التزام المنظومة بتوفير كافة ضمانات الجدية وحماية الملكية.
                </p>

                {/* Highlight box for A++ Potential */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 text-xs text-amber-200/90 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>امتياز العميل الاستثنائي (A++):</span>
                  </div>
                  <p className="leading-relaxed">
                    العملاء الملتزمون الذين يحصلون على تقييم <span className="font-black text-amber-300">A++</span> بعد المعاملات الأولى يحصلون على <span className="underline decoration-amber-400 font-bold text-white">خصم يصل إلى 50% على المنصة الثانية فوراً</span> بلا أي تردد أو خيار من قِبل الإدارة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* RATED CLIENT STATE (A++, A+, A, etc.) */
          <div className="space-y-5">
            {/* Discount Highlight Banner */}
            {tier.discountPercent > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/40 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xl shadow-lg shrink-0">
                    %{tier.discountPercent}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      نسبة الخصم المعتمدة بحسابك
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {tier.discountDescription}
                    </span>
                  </div>
                </div>

                {tier.code === 'A_PLUS_PLUS' && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md">
                    <Crown className="w-4 h-4 fill-current" />
                    <span>خصم 50% مؤكد بلا أي تردد</span>
                  </div>
                )}
              </div>
            )}

            {/* Subtitle / Description */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {tier.subtitle}
            </p>

            {/* List of Perks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tier.perks.map((perk, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            {/* Private Admin / Evaluation Notes if present */}
            {tierNotes && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 text-xs space-y-1">
                <div className="text-blue-400 font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>ملاحظات التقييم المعتمدة من الإدارة:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{tierNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Full Criteria & Ratings Charter */}
      {showCriteriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 text-white shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    ميثاق ومعايير تصنيفات العملاء والامتيازات السيادية
                  </h3>
                  <p className="text-xs text-slate-400">
                    لائحة الحقوق والتخفيضات وأولويات المعاملات لدى منظومة إدارة المنصات
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCriteriaModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>آلية التقييم والترقية السيادية:</span>
                </div>
                <p className="leading-relaxed">
                  تعتمد المنظومة نظام التقييم الشفاف بناءً على الجدية في حجز المواعيد، السرعة في إنهاء إجراءات التسليم، وسابقة التعاملات المالية. يمنح العملاء الملتزمون في الفئة الاستثنائية <span className="font-black text-amber-300">A++</span> تخفيضاً فورياً بنسبة <span className="underline font-bold text-white">50% على المنصة الثانية</span> دون أي شروط معقدة.
                </p>
              </div>

              {/* Tiers Accordion */}
              <div className="space-y-2.5 mt-4">
                {TIER_ORDER.map((code) => {
                  const t = TIER_DEFINITIONS[code];
                  const isExpanded = expandedTierCode === code;
                  const isCurrent = code === tierRating;

                  return (
                    <div 
                      key={code} 
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isCurrent 
                          ? 'border-amber-500/80 bg-slate-800/90 shadow-md' 
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/50'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedTierCode(isExpanded ? null : code)}
                        className="w-full p-4 text-right flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-xl text-xs font-black ${t.colorClass}`}>
                            {t.badge}
                          </span>
                          <div>
                            <span className="font-bold text-white text-sm block">
                              {t.title}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {t.subtitle}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {t.discountPercent > 0 && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                              خصم {t.discountPercent}%
                            </span>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 space-y-3 bg-slate-900/50">
                          <p className="text-slate-300 font-medium">
                            {t.discountDescription}
                          </p>

                          <div className="space-y-1.5">
                            <span className="text-slate-400 font-semibold block">الامتيازات والصلاحيات:</span>
                            <ul className="space-y-1 pr-2">
                              {t.perks.map((perk, i) => (
                                <li key={i} className="flex items-center gap-2 text-slate-300">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  <span>{perk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => setShowCriteriaModal(false)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-md"
              >
                إغلاق الميثاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
