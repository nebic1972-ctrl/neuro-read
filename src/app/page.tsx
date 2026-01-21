"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import CalibrationModal from "@/components/CalibrationModal";
import RSVPReader from "@/components/RSVPReader";

export default function Home() {
  const { isLoaded, user } = useUser();
  const [isReading, setIsReading] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [readingSpeed, setReadingSpeed] = useState(350);

  if (!isLoaded || !user) return null;

  const startReading = (text: string) => {
    setCurrentText(text);
    setIsReading(true);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <CalibrationModal />
      
      {isReading && (
        <RSVPReader 
          content={currentText} 
          initialWpm={readingSpeed} 
          onClose={() => setIsReading(false)} 
        />
      )}

      <header className="flex justify-between items-center mb-12 py-4 border-b border-white/10">
        <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">NEURO-READ</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        <section className="bg-[#111] p-8 rounded-3xl border border-white/5">
          <h2 className="text-3xl font-bold mb-6">Kütüphanen</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-black/50 p-6 rounded-2xl border border-white/5 hover:border-blue-500/50 transition">
              <h3 className="text-xl font-bold mb-4">Örnek: Teknoloji ve Gelecek</h3>
              <button 
                onClick={() => startReading("Gelecekte yapay zeka, insanların öğrenme hızını katlayarak artıracak. Bu platform, nöro-plastisite prensiplerini kullanarak okuma kapasitenizi geliştirmek için tasarlandı.")}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-blue-400 transition"
              >
                Hızlı Oku
              </button>
            </div>
            {/* Ekle Butonu İşlevi (Şimdilik manuel ekleme simülasyonu) */}
            <div className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-500 hover:border-white/30 cursor-pointer">
              <span className="text-4xl mb-2">+</span>
              <span className="font-bold text-sm text-center">Dosya Yükle (PDF/EPUB)</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
