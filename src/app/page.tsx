"use client";

import { useState, useRef } from "react"; // useRef eklendi
import { useUser, UserButton } from "@clerk/nextjs";
import CalibrationModal from "@/components/CalibrationModal";
import RSVPReader from "@/components/RSVPReader";
import { BookOpen, Zap, Trophy, Plus, FileText } from "lucide-react";

export default function Home() {
  const { isLoaded, user } = useUser();
  const [isReading, setIsReading] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [readingSpeed, setReadingSpeed] = useState(300);
  
  // Dosya yükleme için referans
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoaded || !user) return null;

  const startReading = (text: string) => {
    setCurrentText(text);
    setIsReading(true);
  };

  // Dosya okuma fonksiyonu
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        startReading(text); // Dosya okunduğu anda RSVP motorunu başlat
      }
    };
    reader.readAsText(file); // Şimdilik .txt ve .md dosyaları için
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <CalibrationModal />
      
      {/* Gizli Dosya Girişi */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".txt,.md" 
      />

      {isReading && (
        <RSVPReader 
          content={currentText} 
          initialWpm={readingSpeed} 
          onClose={() => setIsReading(false)} 
        />
      )}

      {/* Header Alanı */}
      <header className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter italic">NEURO-READ</h1>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          
          {/* İstatistik Paneli */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Hedef Hız</div>
              <div className="text-3xl font-black text-blue-500">{readingSpeed} <span className="text-xs text-gray-600">K/DK</span></div>
            </div>
            {/* ... diğer istatistikler buraya gelebilir */}
          </div>

          {/* Kütüphane ve Yükleme Alanı */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic">Nöro-Kütüphane</h2>
              
              {/* DOSYA YÜKLE BUTONU ARTIK AKTİF */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-xs font-black rounded-full hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" /> DOSYA YÜKLE (.txt)
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Örnek İçerik */}
              <div className="bg-black border border-white/5 p-6 rounded-3xl group hover:border-blue-500/30 transition-all">
                <FileText className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold mb-4">Hızlı Başlangıç Rehberi</h3>
                <button 
                  onClick={() => startReading("Neuro-Read platformuna hoş geldiniz. Bu sistem, göz kaslarınızı eğitmek ve odaklanma sürenizi artırmak için tasarlanmıştır. Odak noktasındaki kırmızı harfe bakmaya devam edin.")}
                  className="w-full py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-white hover:text-black transition-all"
                >
                  OKUMAYA BAŞLA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}