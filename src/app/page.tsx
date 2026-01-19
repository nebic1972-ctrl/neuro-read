"use client";

import { useState, useRef, useEffect } from "react"; 
import { useUser, UserButton } from "@clerk/nextjs";
import CalibrationModal from "@/components/CalibrationModal";
import RSVPReader from "@/components/RSVPReader";
import { Zap, BookOpen, Plus, FileText, BarChart3, Clock, LayoutGrid } from "lucide-react";

export default function Home() {
  const { isLoaded, user } = useUser();
  const [isReading, setIsReading] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [readingSpeed, setReadingSpeed] = useState(300);
  
  // 🚨 KRİTİK: Butonun çalışması için bu referans şart
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sayfa yüklendiğinde hızı hafızadan çek
  useEffect(() => {
    const savedSpeed = localStorage.getItem("user_wpm");
    if (savedSpeed) setReadingSpeed(parseInt(savedSpeed));
  }, []);

  // Okuma motoru açıkken sayfanın kaymasını engelle
  useEffect(() => {
    document.body.style.overflow = isReading ? "hidden" : "unset";
  }, [isReading]);

  if (!isLoaded || !user) return null;

  const startReading = (text: string) => {
    if (!text || text.trim().length === 0) return;
    setCurrentText(text);
    setIsReading(true);
  };

  // 📂 DOSYA YÜKLEME FONKSİYONU
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) startReading(text);
    };
    reader.readAsText(file);
    event.target.value = ""; // Aynı dosyayı tekrar seçebilmek için
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      <CalibrationModal />
      
      {/* 🧩 Gizli Dosya Girişi (Buton burayı tetikler) */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".txt,.md" 
      />

      {/* ⚡ RSVP Motoru */}
      {isReading && (
        <RSVPReader 
          content={currentText} 
          initialWpm={readingSpeed} 
          onClose={() => setIsReading(false)} 
        />
      )}

      {/* HEADER */}
      <header className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/10">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter italic">NEURO-READ</h1>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-3 space-y-8">
            {/* İSTATİSTİK KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
                <div className="flex items-center gap-2 mb-3 text-gray-500">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Hız Kapasitesi</span>
                </div>
                <div className="text-3xl font-black text-blue-500">{readingSpeed} <span className="text-xs text-gray-700">K/DK</span></div>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl text-gray-400">
                <div className="flex items-center gap-2 mb-3">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Kütüphane</span>
                </div>
                <div className="text-3xl font-black">Aktif</div>
              </div>
            </div>

            {/* KÜTÜPHANE ALANI */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <div>
                  <h2 className="text-3xl font-black italic">Nöro-Kütüphane</h2>
                  <p className="text-sm text-gray-500 mt-1">Egzersiz yapmak için bir dosya seçin.</p>
                </div>
                
                {/* 🚀 ÇALIŞMAYAN BUTON BURASIYDI, ŞİMDİ DÜZELDİ */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-8 py-4 bg-white text-black text-xs font-black rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-lg uppercase"
                >
                  <Plus className="w-4 h-4" /> İçerik Ekle (.txt)
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Hazır İçerik */}
                <div className="bg-black border border-white/5 p-8 rounded-[2rem] group hover:border-blue-600/40 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <FileText className="w-12 h-12 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-black bg-blue-600/10 text-blue-500 px-3 py-1 rounded-full uppercase tracking-widest">Başlangıç</span>
                  <h3 className="text-xl font-bold mt-4 mb-2">Hızlı Okuma Temelleri</h3>
                  <p className="text-sm text-gray-500 mb-8 line-clamp-2 italic">Gözlerinizi metin üzerinde gezdirmek yerine kelimelerin ortasına odaklanın...</p>
                  <button 
                    onClick={() => startReading("Hızlı okuma, göz kaslarının eğitilmesi ve beynin kelimeleri sembol olarak algılaması sürecidir. Bu platformda odak noktanız her zaman kırmızı işaretli harf olmalıdır.")}
                    className="w-full py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-white hover:text-black transition-all uppercase text-[10px] tracking-widest"
                  >
                    Egzersizi Başlat
                  </button>
                </div>

                {/* Yükleme Alanı Kartı */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-8 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-all">
                    <Plus className="w-6 h-6 text-gray-500 group-hover:text-white" />
                  </div>
                  <span className="font-bold text-sm text-gray-500 uppercase tracking-tighter">Metin Dosyası Yükle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}