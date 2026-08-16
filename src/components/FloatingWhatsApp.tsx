import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/201151157100"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 flex items-center justify-center animate-bounce"
      aria-label="تواصل معنا عبر واتساب"
    >
      <MessageCircle className="w-8 h-8" />
    </a>
  );
}
