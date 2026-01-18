"use client";

// Vercel Build Hatasını Önleyen Sihirli Satır
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { 
  BookOpen, Brain, Zap, Activity, 
  ArrowRight, LayoutDashboard, 
  Trophy 
} from "lucide-react";
import { RSVPReader } from "@/components/RSVPReader"; 
import { CalibrationModal } from "@/components/CalibrationModal"; 
import { DisclaimerModal } from "@/components/DisclaimerModal";
import Link from "next/link";

function HomeContent() {
  const { user, isLoaded } = useUser();
  
  // Modalı kontrol eden değişken (Varsayılan: Kapalı)
  const [showCalibration, setShowCalibration] = useState(false);

  const [readingState, setReadingState] = useState<{
    isActive: boolean;
    content: string;
    wpm: number;
    bookId?: string;
  }>({ isActive: false, content: "", wpm: 300 });

  const [stats, setStats] = useState({
    totalWords: 0,
    totalTime: 0,
    streak: 0,
    level: "NOVICE"
  });

  // Profil Kontrolü
  useEffect(() => {
    async function checkProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          // Profil varsa verileri çek
          setStats({
            totalWords: data.total_words_read || 0,
            totalTime: Math.round((data.total_reading_time_sec || 0) / 60),
            streak: data.current_streak || 0,
            level: data.mastery_level || "NOVICE"
          });
        } else {
          // Profil YOKSA testi aç!
          console.log("Profil bulunamadı, test açılıyor...");
          setShowCalibration(true);
        }
      } catch (err) {
        console.error("Profil hatası:", err);
      }
    }

    if (isLoaded && user) {
      checkProfile();
    }
  }, [user, isLoaded]);

  const handleBookSelect = (book: any) => {
    setReadingState({ isActive: true, content: book.content, wpm: 300, bookId: book.id });
  };

  // Test Bittiğinde Çalışacak Fonksiyon
  const handleCalibrationComplete = () => {
    // ÖNEMLİ: Sayfayı yenilemek yerine sadece modalı kapatıyoruz!
    // Bu sayede veritabanı hatası olsa bile içeri girersin.
    setShowCalibration(false);
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      
      {/* SADECE GEREKTİĞİNDE AÇILAN MODAL */}
      {user && showCalibration && (
        <CalibrationModal 
          userId={user.id} 
          onComplete={handleCalibrationComplete} 
        />
      )}
      
      {/* Yasal Uyarıyı Şimdilik Kapalı Tutuyoruz */}
      {/* <DisclaimerModal onAccept={() => {}} /> */}

      {readingState.isActive && (
        <RSVPReader 
          content={readingState.content}
          wpm={readingState.wpm}
          onClose={() => setReadingState({...readingState, isActive: false})}
          onComplete={() => setReadingState({...readingState, isActive: false})}
        />
      )}

      <nav className="border-b border-zinc-900 bg-black/50 backdrop-blur-xl fixed w-full z-40 top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Neuro-Read</span>
          </div>
          <div className="flex items-center gap-6">
            {!user ? (
              <SignInButton mode="modal"><button className="bg-white text-black px-4 py-2 rounded-lg font-bold">Giriş Yap</button></SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-3 gap-4">
               <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800"><div className="text-zinc-400 mb-2">Kelime</div><div className="text-3xl font-black text-white">{stats.totalWords}</div></div>
               <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800"><div className="text-zinc-400 mb-2">Süre</div><div className="text-3xl font-black text-white">{stats.totalTime}</div></div>
               <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800"><div className="text-zinc-400 mb-2">Seviye</div><div className="text-3xl font-black text-white">{stats.level}</div></div>
            </div>
            <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
               <h2 className="text-2xl font-bold mb-6">Kütüphanem</h2>
               <div onClick={() => handleBookSelect({ id: 'demo', content: 'Hızlı okuma deneme metni...', title: 'Demo' })} className="p-6 bg-black/40 rounded-xl border border-zinc-800 hover:border-purple-500 cursor-pointer"><h3 className="font-bold">Hızlı Başlangıç</h3></div>
            </div>
          </div>
          <div className="lg:col-span-4"><div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800"><Link href="/library" className="block w-full text-center p-4 rounded-lg bg-white text-black font-bold">📚 Kütüphaneye Git</Link></div></div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-black text-white">Yükleniyor...</div>}>
      <HomeContent />
    </Suspense>
  );
}
