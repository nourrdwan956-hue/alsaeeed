import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Search, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  BadgeCheck, 
  AlertCircle,
  ExternalLink,
  QrCode
} from 'lucide-react';
import jsQR from 'jsqr';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (data: any) => void;
}

export default function QrScannerModal({ isOpen, onClose, onVerified }: QrScannerModalProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean;
    type?: 'invoice' | 'meeting';
    data?: any;
    message?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      // Ignored
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("المتصفح لا يدعم الوصول المباشر للكاميرا");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
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
          if (playErr?.name !== 'AbortError' && !String(playErr?.message || playErr).toLowerCase().includes('interrupted')) {
            console.warn("Scanner video play error:", playErr);
          }
        }
        requestScan();
      }
    } catch (err: any) {
      console.warn("Scanner camera access error handled:", err);
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
        setCameraError("تم تجاهل أو رفض إذن الكاميرا. يمكنك إعادة طلب الكاميرا أو رفع صورة الـ QR أو كتابة الرقم يدوياً.");
      } else {
        setCameraError("تعذر تشغيل الكاميرا. يمكنك رفع صورة الـ QR أو إدخال الكود يدوياً.");
      }
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
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
  };

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
          handleQrDetected(code.data.trim());
          return;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  };

  const handleQrDetected = (scannedText: string) => {
    playBeep();
    stopCamera();

    let cleanCode = scannedText;
    if (scannedText.includes('code=')) {
      try {
        const urlObj = new URL(scannedText);
        cleanCode = urlObj.searchParams.get('code') || scannedText;
      } catch (e) {
        const match = scannedText.match(/code=([^&]+)/);
        if (match) cleanCode = match[1];
      }
    }

    setInputCode(cleanCode);
    performVerification(cleanCode);
  };

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
          alert("لم يتم العثور على رمز QR Code صالح في الصورة.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const performVerification = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setIsLoading(true);
    setVerificationResult(null);

    try {
      const res = await fetch(`/api/public/verify-document?code=${encodeURIComponent(codeToVerify.trim())}`);
      const data = await res.json();

      if (res.ok && data.found) {
        setVerificationResult({ found: true, type: data.type, data: data.data });
        if (onVerified) onVerified(data.data);
      } else {
        setVerificationResult({ found: false, message: data.message });
      }
    } catch (e) {
      setVerificationResult({ found: false, message: "فشل الاتصال بسيرفر التحقق المباشر" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setInputCode('');
    if (activeTab === 'camera') startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-tajawal text-white">
                ماسح ومحقق وثائق الـ QR Code
              </h3>
              <p className="text-[11px] text-slate-400">التحقق اللحظي من العقود والمقابلات</p>
            </div>
          </div>

          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls (if no result) */}
        {!verificationResult && (
          <div className="p-3 bg-slate-950/50 border-b border-slate-800 flex gap-2">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'camera' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>كاميرا حية</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>رفع صورة</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'manual' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>كتابة الكود</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-right">
          
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm font-bold text-white font-tajawal">جاري مطابقة الختم والأكواد الرسمية...</p>
            </div>
          )}

          {!isLoading && !verificationResult && activeTab === 'camera' && (
            <div className="relative aspect-square max-w-sm mx-auto bg-black rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />

              {/* HUD Frame */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                <div className="w-48 h-48 border-2 border-amber-400/80 rounded-2xl relative shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                  <div className="w-full h-0.5 bg-amber-400 absolute top-1/2 -translate-y-1/2 shadow-[0_0_10px_#fbbf24] animate-bounce" />
                </div>
              </div>

              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                  <p className="text-xs text-rose-300">{cameraError}</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold"
                    >
                      إعادة طلب الكاميرا
                    </button>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold"
                    >
                      رفع صورة QR
                    </button>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
                    >
                      إدخال الكود يدوياً
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !verificationResult && activeTab === 'upload' && (
            <div className="py-8 text-center space-y-4">
              <Upload className="w-12 h-12 text-amber-400 mx-auto" />
              <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md">
                <span>اختر صورة تحتوي على رمز الـ QR</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {!isLoading && !verificationResult && activeTab === 'manual' && (
            <form onSubmit={(e) => { e.preventDefault(); performVerification(inputCode); }} className="space-y-4 py-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="INV-2026-XXXX أو AUTH-XXXX-XXX"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-center text-sm outline-none focus:border-amber-400"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs"
              >
                التحقق الفوري
              </button>
            </form>
          )}

          {/* VERIFICATION RESULT */}
          {!isLoading && verificationResult && verificationResult.found && verificationResult.data && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-1">
                <BadgeCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-black text-white font-tajawal">
                  {verificationResult.data.documentType}
                </h4>
                <p className="text-[11px] text-emerald-300 font-bold">وثيقة معتمدة وموثقة رسمياً في النظام</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">رقم الوثيقة:</span>
                  <strong className="text-amber-400 font-mono">{verificationResult.data.documentNumber}</strong>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">المعلم / العميل:</span>
                  <strong className="text-white truncate block">{verificationResult.data.customerName || verificationResult.data.teacherName}</strong>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 col-span-2">
                  <span className="text-[10px] text-slate-400 block">موضوع الاعتماد:</span>
                  <strong className="text-indigo-300 truncate block">{verificationResult.data.platformTitle}</strong>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  فحص رمز آخر
                </button>
                <a
                  href={`/verify?code=${encodeURIComponent(verificationResult.data.documentNumber || verificationResult.data.verificationCode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black text-center flex items-center justify-center gap-1"
                >
                  <span>عرض الشهادة كاملة</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {!isLoading && verificationResult && !verificationResult.found && (
            <div className="py-6 text-center space-y-3">
              <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-300 font-bold">{verificationResult.message || "كود غير صالح أو غير مسجل"}</p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
