import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  QrCode, 
  Camera, 
  Upload, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Layers, 
  Sparkles, 
  ArrowLeft, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Share2, 
  Printer, 
  ExternalLink,
  Lock,
  BadgeCheck,
  AlertCircle
} from 'lucide-react';
import jsQR from 'jsqr';

interface VerifiedDocData {
  id?: string;
  documentNumber: string;
  documentType: string;
  platformTitle: string;
  teacherName?: string;
  subject?: string;
  targetAudience?: string;
  customerName: string;
  customerPhone?: string;
  customerGovernorate?: string;
  amount?: string;
  status: string;
  issuedDate: string;
  deliveryDays?: string;
  deliveredAt?: string;
  paidAt?: string;
  scheduledTime?: string;
  employeeName?: string;
  employeePhone?: string;
  employeeTitle?: string;
  amountToCollect?: string;
  verificationCode?: string;
  createdAt?: string;
  completedAt?: string;
  featuresIncluded?: string[];
  sealAuthority: string;
  securityStamp: string;
}

export default function VerifyDocument() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  
  // Search query & status
  const [inputCode, setInputCode] = useState(searchParams.get('code') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean;
    type?: 'invoice' | 'meeting';
    data?: VerifiedDocData;
    message?: string;
  } | null>(null);

  // Camera Scanner State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const animFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-verify if code exists in URL
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl && codeFromUrl.trim()) {
      setInputCode(codeFromUrl.trim());
      performVerification(codeFromUrl.trim());
    }
  }, [searchParams]);

  // Handle Camera Stream
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode]);

  // Play pleasant verification chime using Web Audio API
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("المتصفح لا يدعم الوصول للكاميرا المباشرة. يرجى استخدام رفع صورة الـ QR أو كتابة الكود يدوياً.");
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        try {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (playErr: any) {
          // Play request interrupted by new load or stream change - safe to ignore AbortError/Interrupted
          if (playErr?.name !== 'AbortError' && !String(playErr?.message || playErr).toLowerCase().includes('interrupted')) {
            console.warn("Video play error:", playErr);
          }
        }
        setIsCameraActive(true);
        requestScan();
      }
    } catch (err: any) {
      console.warn("Camera access error handled:", err);
      setIsCameraActive(false);
      const errStr = String(err?.name || err?.message || err || '').toLowerCase();
      if (
        err?.name === 'NotAllowedError' || 
        err?.name === 'PermissionDeniedError' || 
        err?.name === 'PermissionDismissedError' ||
        errStr.includes('permission') || 
        errStr.includes('dismiss') || 
        errStr.includes('denied') || 
        errStr.includes('notallowed') ||
        errStr.includes('not allowed')
      ) {
        setCameraError("تم رفض أو تجاهل إذن استخدام الكاميرا. يمكنك إعادة المحاولة والتأكد من السماح للكاميرا، أو رفع صورة الـ QR أو إدخال الرقم يدوياً.");
      } else {
        setCameraError("تعذر الوصول للكاميرا المباشرة حالياً. يمكنك التبديل لرفع صورة الوثيقة أو كتابة الرقم يدوياً.");
      }
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (e) {
        // Ignore pause error
      }
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Continuous Camera QR Code Frame Analyzer
  const requestScan = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scanFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          const rawScanned = code.data.trim();
          handleQrDetected(rawScanned);
          return; // Pause scanning loop while showing result
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  };

  const handleQrDetected = (scannedContent: string) => {
    playBeep();
    stopCamera();
    
    // Extract code if it is a full URL like https://.../verify?code=INV-2026-9214
    let cleanCode = scannedContent;
    if (scannedContent.includes('code=')) {
      try {
        const urlObj = new URL(scannedContent);
        cleanCode = urlObj.searchParams.get('code') || scannedContent;
      } catch (e) {
        const match = scannedContent.match(/code=([^&]+)/);
        if (match) cleanCode = match[1];
      }
    }

    setInputCode(cleanCode);
    setSearchParams({ code: cleanCode });
    performVerification(cleanCode);
  };

  // File Upload Scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleQrDetected(code.data);
        } else {
          alert("لم يتم العثور على رمز QR Code صالح في الصورة المرفوعة. يرجى التأكد من وضوح الرمز أو إدخال الرقم يدوياً.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Core Verification Fetcher
  const performVerification = async (codeToVerify: string) => {
    if (!codeToVerify || !codeToVerify.trim()) return;

    setIsLoading(true);
    setVerificationResult(null);

    try {
      const res = await fetch(`/api/public/verify-document?code=${encodeURIComponent(codeToVerify.trim())}`);
      const data = await res.json();

      if (res.ok && data.found) {
        setVerificationResult({
          found: true,
          type: data.type,
          data: data.data
        });
      } else {
        setVerificationResult({
          found: false,
          message: data.message || "لم يتم العثور على أي وثيقة أو عقد مسجل بهذا الرقم. يرجى التأكد من كتابة الرقم بدقة أو إعادة مسح رمز الـ QR."
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({
        found: false,
        message: "حدث خطأ أثناء الاتصال بسيرفر التحقق المباشر. يرجى المحاولة مرة أخرى."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setSearchParams({ code: inputCode.trim() });
    performVerification(inputCode.trim());
  };

  const handleReset = () => {
    setVerificationResult(null);
    setInputCode('');
    setSearchParams({});
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      
      {/* 1. TOP HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-amber-500/20 pt-12 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-inner">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>بوابة التحقق السيادي ومكافحة التزييف المعتمدة</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-tajawal tracking-tight text-white">
            نظام التحقق اللحظي عبر <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-transparent bg-clip-text">الـ QR Code</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            امسح الرمز المطبوع على وثيقة العقد أو بطاقة الموعد للتحقق الفوري من صحة الاعتماد، بيانات المعلم، وسجلات الدفع الرسمية مباشرة من قاعدة البيانات.
          </p>

        </div>
      </div>

      {/* 2. MAIN VERIFICATION CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* TAB CONTROLS */}
        {!verificationResult && (
          <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2 mb-6 max-w-md mx-auto shadow-lg backdrop-blur-md">
            
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'camera'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>مسح بالكاميرا</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>رفع صورة QR</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>إدخال يدوي</span>
            </button>

          </div>
        )}

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-12 text-center space-y-4 shadow-2xl animate-pulse">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-400 animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-tajawal text-white">جاري فحص وتدقيق الوثيقة في سجلات السعيد...</h3>
            <p className="text-xs text-slate-400">مطابقة التوقيع الرقمي والختم الأمني اللحظي</p>
          </div>
        )}

        {/* TAB 1: LIVE CAMERA SCANNER */}
        {!isLoading && !verificationResult && activeTab === 'camera' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Top Toolbar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>الكاميرا تعمل بنظام المسح البصري الذكي</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl border text-xs transition-colors ${
                    soundEnabled ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title={soundEnabled ? 'كتم صوت الإشعار' : 'تفعيل صوت الإشعار'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleCameraFacing}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 font-bold transition-colors"
                  title="تبديل الكاميرا الخلفية / الأمامية"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">تبديل الكاميرا</span>
                </button>
              </div>
            </div>

            {/* Video Viewport & Scanning HUD */}
            <div className="relative aspect-square sm:aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Laser Scanning Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-amber-400/80 rounded-3xl shadow-[0_0_50px_rgba(251,191,36,0.25)] flex flex-col justify-between p-3">
                  
                  {/* Corner Accents */}
                  <div className="flex justify-between">
                    <span className="w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                    <span className="w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                  </div>

                  {/* Animated Scanning Laser Line */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce my-auto" />

                  <div className="flex justify-between">
                    <span className="w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                    <span className="w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                  </div>
                </div>
              </div>

              {/* Camera Error Message Overlay */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-rose-300 max-w-md">{cameraError}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>طلب الكاميرا مجدداً</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs border border-amber-500/30 transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>رفع صورة QR</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      الكتابة اليدوية
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Scanner Guidance */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                وجه كاميرا هاتفك مباشرة نحو مربع الـ QR Code المطبوع على الوثيقة ليتم الفحص تلقائياً في أجزاء من الثانية.
              </p>
            </div>

          </div>
        )}

        {/* TAB 2: UPLOAD IMAGE SCANNER */}
        {!isLoading && !verificationResult && activeTab === 'upload' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-dashed border-amber-400/60 mx-auto flex items-center justify-center text-amber-400">
              <Upload className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-tajawal text-white">
                رفع صورة الوثيقة أو الـ QR Code
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                قم باختيار أو سحب لقطة شاشة (Screenshot) أو صورة فوتوغرافية للوثيقة ليتم قراءة الكود المشفر وفحصه فورياً.
              </p>
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm rounded-2xl shadow-lg hover:shadow-amber-500/20 transition-all">
                <Upload className="w-5 h-5" />
                <span>اختر ملف الصورة من جهازك</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-[11px] text-slate-500">يدعم صيغ JPG, PNG, WEBP بدقة عالية</p>
          </div>
        )}

        {/* TAB 3: MANUAL INPUT */}
        {!isLoading && !verificationResult && activeTab === 'manual' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div className="space-y-2 text-center sm:text-right">
              <h3 className="text-xl font-bold font-tajawal text-white flex items-center justify-center sm:justify-start gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                <span>البحث المباشر برقم الوثيقة أو كود الأمان</span>
              </h3>
              <p className="text-xs text-slate-400">
                أدخل رقم الفاتورة (مثال: <code className="font-mono text-amber-400 bg-slate-950 px-2 py-0.5 rounded">INV-2026-XXXX</code>) أو كود تفويض المقابلة (مثال: <code className="font-mono text-amber-400 bg-slate-950 px-2 py-0.5 rounded">AUTH-XXXX-XXX</code>):
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="أدخل رقم الوثيقة أو كود التحقق هنا..."
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 rounded-2xl py-4 px-5 pr-12 text-sm sm:text-base font-bold text-white placeholder-slate-500 outline-none transition-all dir-ltr text-center sm:text-right"
                  required
                />
                <QrCode className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>تدقيق والتحقق من الوثيقة الآن</span>
              </button>
            </form>
          </div>
        )}

        {/* 3. VERIFICATION RESULT PRESENTATION (AUTHENTICATED CERTIFICATE) */}
        {!isLoading && verificationResult && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            
            {/* SUCCESS / VERIFIED RESULT */}
            {verificationResult.found && verificationResult.data && (
              <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl overflow-hidden shadow-2xl">
                
                {/* Certificate Top Banner */}
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-6 sm:p-8 border-b border-emerald-500/40 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
                  
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <BadgeCheck className="w-10 h-10" />
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>وثيقة رسمية معتمدة وموثقة 100% في سجلات السعيد</span>
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-black font-tajawal text-white">
                    {verificationResult.data.documentType}
                  </h2>
                  <p className="text-xs text-slate-300 font-mono mt-1">
                    SEAL HASH: {verificationResult.data.securityStamp}
                  </p>
                </div>

                {/* Certificate Details Grid */}
                <div className="p-6 sm:p-8 space-y-6 text-right">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Item 1: Document Number */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block font-bold">رقم القيد والوثيقة:</span>
                      <strong className="text-base font-black text-amber-400 font-mono">
                        {verificationResult.data.documentNumber}
                      </strong>
                    </div>

                    {/* Item 2: Status */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block font-bold">الحالة القانونية:</span>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <strong className="text-sm font-black text-emerald-400 font-tajawal">
                          {verificationResult.data.status === 'paid' ? 'معتمد ومسدد بالكامل' :
                           verificationResult.data.status === 'delivered' ? 'تم التسليم النهائي والتفعيل' :
                           verificationResult.data.status === 'scheduled' ? 'موعد مقابلة مؤكد ومجدول' :
                           verificationResult.data.status === 'completed' ? 'تمت المقابلة واستلام المبلغ' :
                           'عرض رسمي صادر ومعتمد'}
                        </strong>
                      </div>
                    </div>

                    {/* Item 3: Client / Teacher */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block font-bold">اسم المعلم / العميل المستفيد:</span>
                      <strong className="text-base font-bold text-white font-tajawal">
                        {verificationResult.data.customerName || verificationResult.data.teacherName}
                      </strong>
                      {verificationResult.data.subject && (
                        <p className="text-xs text-slate-400">مادة: {verificationResult.data.subject}</p>
                      )}
                    </div>

                    {/* Item 4: Platform Title / Location */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block font-bold">موضوع الاعتماد / المنصة:</span>
                      <strong className="text-base font-black text-indigo-300 font-tajawal">
                        {verificationResult.data.platformTitle}
                      </strong>
                    </div>

                    {/* Item 5: Amount */}
                    {(verificationResult.data.amount || verificationResult.data.amountToCollect) && (
                      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-[11px] text-slate-400 block font-bold">القيمة المالية المسجلة:</span>
                        <strong className="text-lg font-black text-emerald-400 font-tajawal">
                          {Number(verificationResult.data.amount || verificationResult.data.amountToCollect).toLocaleString('ar-EG')} جنيه مصري
                        </strong>
                      </div>
                    )}

                    {/* Item 6: Date */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 block font-bold">تاريخ وساعة التوثيق:</span>
                      <strong className="text-xs font-bold text-slate-300">
                        {verificationResult.data.issuedDate}
                      </strong>
                    </div>

                  </div>

                  {/* Meeting specific data if meeting */}
                  {verificationResult.type === 'meeting' && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                      <span className="text-xs font-black text-amber-300 block">بيانات المندوب المفوض والموقع:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                        <p>المندوب: <strong className="text-white">{verificationResult.data.employeeName}</strong></p>
                        <p>هاتف المندوب: <strong className="text-white font-mono">{verificationResult.data.employeePhone}</strong></p>
                        <p>المحافظة: <strong className="text-white">{verificationResult.data.governorate} ({verificationResult.data.region})</strong></p>
                        <p>كود المطابقة: <strong className="text-amber-400 font-mono font-bold">{verificationResult.data.verificationCode}</strong></p>
                      </div>
                    </div>
                  )}

                  {/* Sovereign Stamp Footer */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">جهة التصديق والاعتماد:</span>
                        <strong className="text-xs text-slate-200">{verificationResult.data.sealAuthority}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 print:hidden"
                      >
                        <Printer className="w-4 h-4" />
                        <span>طباعة إفادة التحقق</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Bottom Action Bar */}
                <div className="p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>فحص وثيقة أو كود آخر</span>
                  </button>

                  <Link
                    to="/"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>العودة للرئيسية</span>
                  </Link>
                </div>

              </div>
            )}

            {/* FAILED / INVALID CODE RESULT */}
            {!verificationResult.found && (
              <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
                
                <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-400 mx-auto flex items-center justify-center text-rose-400">
                  <XCircle className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-black">
                    تحذير أمني: لم يتم العثور على الوثيقة
                  </span>
                  <h3 className="text-2xl font-black font-tajawal text-white">
                    كود التحقق غير مسجل أو غير صالح
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    {verificationResult.message || "الرقم الذي تم إدخاله غير موجود في سجلات منصات السعيد. يرجى مراجعة إدارة الشركة للتأكد من سلامة التعاقد."}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>إعادة المسح أو المحاولة</span>
                  </button>

                  <a
                    href="https://wa.me/201151157100"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
                  >
                    <span>الإبلاغ والتواصل مع الإدارة</span>
                  </a>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
