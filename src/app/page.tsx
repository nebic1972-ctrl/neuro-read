"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import CalibrationModal from "@/components/CalibrationModal";
import RSVPReader from "@/components/RSVPReader";

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
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <CalibrationModal />
      
      {isReading && (
        <RSVPReader 
          content={currentText} 
          initialWpm={readingSpeed} 
          onClose={() => setIsReading(false)} 
        />
      )}

      {/* Modern Header */}
      <header className="max-w-6xl mx-auto px-6 py-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20" />
          <h1 className="text-2xl font-black tracking-tighter italic">NEURO-READ</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Hoş Geldin</div>
            <div className="text-sm font-bold">{user.firstName}</div>
          </div>
          <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-white/10" } }} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          
          {/* İstatistikler */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Okuma Hızı", val: readingSpeed, unit: "K/DK", color: "text-blue-500" },
              { label: "Bugün", val: "1.2k", unit: "KELİME", color: "text-purple-500" },
              { label: "Seviye", val: "NOVICE", unit: "", color: "text-white" }
            ].map((s, i) => (
              <div key={i} className="bg-[#080808] border border-white/5 p-6 rounded-3xl">
                <div className="text-[10px] font-black text-gray-600 uppercase mb-2 tracking-widest">{s.label}</div>
                <div className={`text-3xl font-black ${s.color}`}>{s.val} <span className="text-xs text-gray-700">{s.unit}</span></div>
              </div>
            ))}
          </div>

          {/* Kütüphane Listesi */}
          <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black italic">Nöro-Kütüphane</h2>
              <button className="px-6 py-2 bg-white text-black text-sm font-black rounded-full hover:bg-gray-200 transition">+ Dosya Yükle</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Yapay Zeka Etiği", desc: "Otonom sistemlerin karar alma mekanizmaları...", tag: "AKADEMİK", content: "Otonom sistemlerin karar alma mekanizmalarında etik algoritmaların inşası, modern toplumun en büyük felsefi problemlerinden biridir. Yapay zeka, insan hayatını kolaylaştırırken aynı zamanda mahremiyet ve güvenlik endişelerini de beraberinde getirmektedir." },
                { title: "Mars Kolonisi 2045", desc: "Kızıl gezegenin ilk yerleşim planları...", tag: "HİKAYE", content: "Kızıl gezegenin tozlu fırtınaları arasında yükselen ilk kubbe şehri, insanlığın umudunu taşıyordu. Mühendisler, oksijen jeneratörlerini çalıştırmak için gece gündüz demeden çalışıyorlardı." }
              ].map((book, i) => (
                <div key={i} className="group bg-black border border-white/5 p-6 rounded-3xl hover:border-blue-500/50 transition-all">
                  <span className="text-[10px] font-black bg-white/5 text-gray-500 px-3 py-1 rounded-full mb-4 inline-block">{book.tag}</span>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition">{book.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2">{book.desc}</p>
                  <button 
                    onClick={() => startReading(book.content)}
                    className="w-full py-4 bg-white/5 group-hover:bg-white group-hover:text-black text-white font-black rounded-2xl transition-all"
                  >
                    OKUMAYA BAŞLA
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          <div className="bg-[#080808] border border-white/5 p-8 rounded-3xl">
            <h3 className="font-black text-sm text-gray-500 uppercase tracking-widest mb-6">Liderlik Tablosu</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-black rounded-2xl border border-white/5">
                  <span className="text-sm font-bold">Nöro-Okuyucu #{i}</span>
                  <span className="text-xs font-black text-blue-500">{900 - i*100} K/DK</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}