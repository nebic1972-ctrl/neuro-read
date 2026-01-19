"use client";

import { useState, useRef, useEffect } from "react"; 
import { useUser, UserButton } from "@clerk/nextjs";
import CalibrationModal from "@/components/CalibrationModal";
import RSVPReader from "@/components/RSVPReader";
import { Zap, BookOpen, Plus, FileText, BarChart3, Clock } from "lucide-react";

export default function Home() {
  const { isLoaded, user } = useUser();
  const [isReading, setIsReading] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [readingSpeed, setReadingSpeed] = useState(300);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sayfa yüklendiğinde yerel hafızadaki hızı kontrol et
  useEffect(() => {
    const savedSpeed = localStorage.getItem("user_wpm");
    if (savedSpeed) setReadingSpeed(parseInt(savedSpeed));
  }, []);

  // RSVPReader açıkken arka plan kaymasını engelle
  useEffect(() => {
    if (isReading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isReading]);

  if (!isLoaded || !user) return null;

  const startReading = (text: string) => {
    if (!text || text.trim().length === 0) return;
    setCurrentText(text);
    setIsReading(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Sadece .txt ve .md dosyalarına izin ver (Dosya tipi güvenliği)
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      alert("Lütfen sadece .txt veya .md uzantılı metin dosyaları yükleyin.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      startReading(text);
    };
    reader.onerror = () => alert("Dosya okunurken bir hata oluştu!");
    reader.readAsText(file);
    
    // Aynı dosyayı tekrar seçebilmek için input'u temizle
    event.target.value = "";
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      {/* 1. Hız Testi (Gerekli değilse CalibrationModal içinde kontrol edilmeli) */}
      <CalibrationModal />
      
      {/* 2. Gizli Dosya Girişi */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".txt,.md" 
      />

      {/* 3. Okuma Modu (RSVP Motoru) */}
      {isReading && (
        <RSVPReader 
          content={currentText} 
          initialWpm={readingSpeed} 
          onClose={() => setIsReading(false)} 
        />
      )}

      {/* Üst Bar */}
      <header className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/10">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter italic">NEURO-READ</h1>
        </div>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sol Kolon: Ana İçerik */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Hızlı İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl group hover:border-blue-500/20 transition-all">
                <div className="flex items-center gap-2 mb-3 text-gray-500">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Mevcut Hız</span>
                </div>
                <div className="text-3xl font-black text-blue-500">{readingSpeed} <span className="text-xs text-gray-700 uppercase">K/dk</span></div>
              </div>
              
              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl group hover:border-purple-500/20 transition-all text-gray-400">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Bugün</span>
                </div>
                <div className="text-3xl font-black">0 <span className="text-xs text-gray-800 uppercase">Dakika</span></div>
              </div>
            </div>

            {/* Kütüphane Alanı */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                  <h2 className="text-3xl font-black italic">Nöro-Kütüphane</h2>
                  <p className="text-sm text-gray-500 mt-1">Egzersiz yapmak için bir metin seçin veya yükleyin.</p>
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-8 py-4 bg-white text-black text-xs font-black rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:shadow-blue-500/20 uppercase tracking-tighter"
                >
                  <Plus className="w-4 h-4" /> Dosya Yükle
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Hazır İçerik Kartı */}
                <div className="bg-black border border-white/5 p-8 rounded-[2rem] group hover:border-blue-600/40 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <FileText className="w-12 h-12 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-black bg-blue-600/10 text-blue-500 px-3 py-1 rounded-full uppercase tracking-widest">Eğitim</span>
                  <h3 className="text-xl font-bold mt-4 mb-2">Hızlı Başlangıç Rehberi</h3>
                  <p className="text-sm text-gray-500 mb-8 line-clamp-2">Neuro-Read platformuna hoş geldiniz. Bu sistem, göz kaslarınızı eğitmek ve odaklanma sürenizi artırmak için tasarlandı.</p>
                  <button 
                    onClick={() => startReading("Neuro-Read platformuna hoş geldiniz. Bu sistem, göz kaslarınızı eğitmek ve odaklanma sürenizi artırmak için tasarlanmıştır. Odak noktasındaki kırmızı harfe bakmaya devam edin. Gözlerinizi kırpmaktan korkmayın ama odağınızı kaybetmeyin.")}
                    className="w-full py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-white hover:text-black transition-all uppercase text-xs tracking-widest border border-white/5"
                  >
                    Egzersizi Başlat
                  </button>
                </div>

                {/* Yükleme Alanı (Görsel Yardımcı) */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-8 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:scale-110 transition-all">
                    <Plus className="w-6 h-6 text-gray-500 group-hover:text-white" />
                  </div>
                  <span className="font-bold text-sm text-gray-500">Yeni Metin Dosyası (.txt)</span>
                  <span className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">Bilgisayarından Seç</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Liderlik & Hedefler */}
          <div className="space-y-6">
             <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Profil Seviyesi</h3>
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 to-orange-600 flex items-center justify-center font-black text-black">1</div>
                   <div>
                      <div className="text-sm font-black uppercase">Acemi Okuyucu</div>
                      <div className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Bir Sonraki Seviye: 2500 Kelime</div>
                   </div>
                </div>
                <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                   <div className="h-full bg-yellow-500 w-1/4"></div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}