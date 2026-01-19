"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import CalibrationModal from "@/components/CalibrationModal";
import RSVPReader from "@/components/RSVPReader";
import { BookOpen, Zap, Trophy, Plus } from "lucide-react";

export default function Home() {
  const { isLoaded, user } = useUser();
  const [isReading, setIsReading] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [readingSpeed, setReadingSpeed] = useState(300);

  if (!isLoaded || !user) return null;

  const startReading = (text: string) => {
    setCurrentText(text);
    setIsReading(true);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      <CalibrationModal />
      
      {isReading && (
        <RSVPReader 
          content={currentText} 
          initialWpm={readingSpeed} 
          onClose={() => setIsReading(false)} 
        />
      )}

      {/* Modern Header */}
      <header className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter italic">NEURO-READ</h1>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sol Panel: İstatistikler */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Okuma Hızı", val: readingSpeed, unit: "K/DK", icon: <Zap className="w-4 h-4 text-blue-500" /> },
              { label: "Bugün Okunan", val: "1,240", unit: "KELİME", icon: <BookOpen className="w-4 h-4 text-purple-500" /> },
              { label: "Sıralama", val: "#12", unit: "GLOBAL", icon: <Trophy className="w-4 h-4 text-yellow-500" /> }
            ].map((s, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl hover:border-white/10 transition">
                <div className="flex items-center gap-2 mb-3">
                   {s.icon}
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.label}</span>
                </div>
                <div className="text-3xl font-black">{s.val} <span className="text-xs text-gray-600">{s.unit}</span></div>
              </div>
            ))}
          </div>

          {/* Kütüphane Izgarası */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic">Nöro-Kütüphane</h2>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-black rounded-full hover:bg-blue-500 hover:text-white transition-all">
                <Plus className="w-4 h-4" /> DOSYA YÜKLE
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Yapay Zeka ve Etik", tag: "AKADEMİK", content: "Yapay zeka sistemlerinin etik çerçevede geliştirilmesi, modern mühendisliğin en kritik sınavıdır..." },
                { title: "Kuantum Mekaniği 101", tag: "BİLİM", content: "Kuantum dünyasında bir parçacık aynı anda iki yerde olabilir. Bu fenomen süperpozisyon olarak adlandırılır..." }
              ].map((book, i) => (
                <div key={i} className="group bg-black border border-white/5 p-6 rounded-3xl hover:border-blue-500/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black bg-white/5 text-gray-500 px-3 py-1 rounded-full uppercase">{book.tag}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-blue-500 transition">{book.title}</h3>
                  <button 
                    onClick={() => startReading(book.content)}
                    className="w-full py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-white hover:text-black transition-all uppercase text-xs"
                  >
                    Egzersizi Başlat
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Panel: Hedefler */}
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
            <h3 className="font-black text-[10px] text-gray-500 uppercase tracking-widest mb-6">Günlük Hedef</h3>
            <div className="text-3xl font-black mb-2">2,500 <span className="text-xs text-gray-600">KELİME</span></div>
            <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
               <div className="h-full bg-blue-600 w-[45%]" />
            </div>
            <p className="text-[10px] text-gray-600 mt-4 italic">%45 tamamlandı. 1,375 kelime kaldı.</p>
          </div>
        </div>

      </div>
    </main>
  );
}