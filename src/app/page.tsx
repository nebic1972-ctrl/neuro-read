"use client";

import { useState, useEffect } from "react";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import CalibrationModal from "@/components/CalibrationModal";
import RSVPReader from "@/components/RSVPReader"; // Yeni motorumuzu çağırıyoruz

export default function Home() {
  const { isLoaded, user } = useUser();
  
  // Okuma Motoru Durumları
  const [isReading, setIsReading] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [readingSpeed, setReadingSpeed] = useState(300); // Varsayılan hız

  // Veritabanından (LocalStorage) hızı çekme simülasyonu
  useEffect(() => {
    // Gerçekte burası veritabanından gelecek
    setReadingSpeed(300); 
  }, []);

  // 1. Clerk yükleniyor mu?
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-xl font-bold animate-pulse">Nöro-Sistem Başlatılıyor...</div>
      </div>
    );
  }

  // 2. Kullanıcı giriş yapmamışsa yönlendir
  if (!user) {
    return <RedirectToSignIn />;
  }

  // Okumayı Başlatan Fonksiyon
  const startReading = (text: string) => {
    setCurrentText(text);
    setIsReading(true);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      
      {/* 1. Hız Testi Modalı (Sadece ilk girişte veya gerekince) */}
      <CalibrationModal />

      {/* 2. Eğer Okuma Modundaysak SADECE Motoru Göster */}
      {isReading && (
        <RSVPReader 
          content={currentText} 
          initialWpm={readingSpeed} 
          onClose={() => setIsReading(false)} 
        />
      )}

      {/* Ana Sayfa İçeriği */}
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Üst Bar */}
        <header className="flex items-center justify-between py-8 mb-12 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-purple-600 animate-pulse"></div>
            <h1 className="text-2xl font-bold tracking-tighter">Neuro-Read</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/20 flex items-center justify-center text-xs">
            {user.firstName?.charAt(0) || "U"}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol: İstatistikler ve Kütüphane */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* İstatistik Kartları */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Hız (K/DK)", val: readingSpeed, color: "text-blue-400" },
                { label: "Okunan", val: "0", color: "text-purple-400" },
                { label: "Seviye", val: "NOVICE", color: "text-white" }
              ].map((stat, i) => (
                <div key={i} className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition">
                  <div className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-widest">{stat.label}</div>
                  <div className={`text-3xl font-black ${stat.color}`}>{stat.val}</div>
                </div>
              ))}
            </div>

            {/* Kütüphane Alanı */}
            <div className="bg-[#111] rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -z-10 transition group-hover:bg-purple-600/20"></div>
              
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Nöro-Kütüphane</h2>
                  <p className="text-gray-400">Beyin antrenmanınız için kategorize edilmiş içerikler.</p>
                </div>
                <button className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition">
                  + İçerik Ekle
                </button>
              </div>

              {/* Kitap Listesi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ÖRNEK İÇERİK 1 */}
                <div className="bg-black/40 p-6 rounded-xl border border-white/5 hover:border-blue-500/50 transition cursor-pointer group/card">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded">AKADEMİK</span>
                    <span className="text-xs text-gray-500">~5 dk</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover/card:text-blue-400 transition">Yapay Zeka Etiği</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                    Otonom sistemlerin karar alma mekanizmalarında etik algoritmaların inşası...
                  </p>
                  <button 
                    onClick={() => startReading("Otonom sistemlerin karar alma mekanizmalarında etik algoritmaların inşası, modern toplumun en büyük felsefi problemlerinden biridir. Yapay zeka, insan hayatını kolaylaştırırken aynı zamanda mahremiyet ve güvenlik endişelerini de beraberinde getirmektedir. Bu metin, hızlı okuma becerilerinizi test etmek için hazırlanmıştır. Odaklanın ve kelimeleri takip edin.")}
                    className="w-full py-3 rounded-lg bg-white/5 hover:bg-white text-white hover:text-black font-bold text-sm transition"
                  >
                    Okumaya Başla
                  </button>
                </div>

                {/* ÖRNEK İÇERİK 2 */}
                <div className="bg-black/40 p-6 rounded-xl border border-white/5 hover:border-purple-500/50 transition cursor-pointer group/card">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 px-2 py-1 rounded">HİKAYE</span>
                    <span className="text-xs text-gray-500">~12 dk</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover/card:text-purple-400 transition">Mars Kolonisi</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                    Kızıl gezegenin tozlu fırtınaları arasında yükselen ilk kubbe şehri...
                  </p>
                  <button 
                    onClick={() => startReading("Kızıl gezegenin tozlu fırtınaları arasında yükselen ilk kubbe şehri, insanlığın umudunu taşıyordu. Mühendisler, oksijen jeneratörlerini çalıştırmak için gece gündüz demeden çalışıyorlardı. Dışarıdaki dondurucu soğuğa rağmen, içerideki yaşam filizlenmeye başlamıştı.")}
                    className="w-full py-3 rounded-lg bg-white/5 hover:bg-white text-white hover:text-black font-bold text-sm transition"
                  >
                    Okumaya Başla
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Panel: Liderlik ve Hedefler */}
          <div className="space-y-6">
            <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="text-yellow-500">🏆</span> Liderlik Tablosu
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">{i}</div>
                      <span className="text-sm font-medium">Anonim Okuyucu</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">750 K/DK</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
              <h3 className="font-bold mb-2 text-sm text-gray-400">Günlük Hedef</h3>
              <div className="text-2xl font-black mb-4">1250 Kelime</div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-[35%] bg-green-500"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
