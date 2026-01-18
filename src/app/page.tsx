"use client";

import { useState, useEffect, Suspense } from "react"; // Suspense eklendi
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { 
  BookOpen, Brain, Zap, Activity, 
  ArrowRight, LayoutDashboard, 
  Settings, PlayCircle, Trophy 
} from "lucide-react";
import { RSVPReader } from "@/components/RSVPReader"; 
import { CalibrationModal } from "@/components/CalibrationModal"; 
import { DisclaimerModal } from "@/components/DisclaimerModal";
import Link from "next/link";

// 1. TÜM MANTIĞI 'HomeContent' ADINDA BİR KOMPONENT İÇİNE ALIYORUZ
function HomeContent() {
  const { user, isLoaded } = useUser();
  const [readingState, setReadingState] = useState<{
    isActive: boolean;
    content: string;
    wpm: number;
    bookId?: string;
  }>({ isActive: false, content: "", wpm: 300 });

  // İstatistikler
  const [stats, setStats] = useState({
    totalWords: 0,
    totalTime: 0,
    streak: 0,
    level: "NOVICE"
  });

  // Profil verisini çek
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if(!user) return;
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setStats({
        totalWords: data.total_words_read || 0,
        totalTime: Math.round((data.total_reading_time_sec || 0) / 60),
        streak: data.current_streak || 0,
        level: data.mastery_level || "NOVICE"
      });
    }
  };

  const handleBookSelect = (book: any) => {
    // Profildeki hızı alalım (yoksa 300)
    const userWpm = 300; 
    setReadingState({
      isActive: true,
      content: book.content,
      wpm: userWpm,
      bookId: book.id
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      
      {/* MODALLAR */}
      {user && <CalibrationModal userId={user.id} onComplete={() => window.location.reload()} />}
      <DisclaimerModal onAccept={() => {}} />

      {/* OKUMA MODU AKTİFSE */}
      {readingState.isActive && (
        <RSVPReader 
          content={readingState.content}
          wpm={readingState.wpm}
          onClose={() => setReadingState({...readingState, isActive: false})}
          onComplete={(sessionStats) => {
             console.log("Seans bitti:", sessionStats);
             setReadingState({...readingState, isActive: false});
          }}
        />
      )}

      {/* NAVBAR */}
      <nav className="border-b border-zinc-900 bg-black/50 backdrop-blur-xl fixed w-full z-40 top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              Neuro-Read
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 border border-zinc-800 ml-2">
              v2.0 Beta
            </span>
          </div>

          <div className="flex items-center gap-6">
            {!user ? (
              <SignInButton mode="modal">
                <button className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-zinc-200 transition">
                  Giriş Yap
                </button>
              </SignInButton>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end mr-2">
                   <span className="text-xs text-zinc-400">Hoş geldin,</span>
                   <span className="text-sm font-bold text-white">{user.firstName}</span>
                </div>
                <UserButton afterSignOutUrl="/"/>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* SOL: Dashboard */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-3 gap-4">
               <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2 text-zinc-400">
                     <BookOpen className="w-4 h-4"/> <span>Toplam Kelime</span>
                  </div>
                  <div className="text-3xl font-black text-white">{stats.totalWords.toLocaleString()}</div>
               </div>
               <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2 text-zinc-400">
                     <Activity className="w-4 h-4"/> <span>Odak Süresi</span>
                  </div>
                  <div className="text-3xl font-black text-white">{stats.totalTime} <span className="text-sm font-normal text-zinc-600">dk</span></div>
               </div>
               <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="w-24 h-24 text-yellow-500"/></div>
                  <div className="flex items-center gap-3 mb-2 text-zinc-400">
                     <Zap className="w-4 h-4 text-yellow-500"/> <span>Seviye</span>
                  </div>
                  <div className="text-3xl font-black text-white uppercase">{stats.level}</div>
               </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-purple-500"/> 
                    Kütüphanem
                  </h2>
                  <Link href="/library">
                    <button className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition">
                       Tümünü Gör <ArrowRight className="w-4 h-4"/>
                    </button>
                  </Link>
               </div>
               
               <div className="group relative p-6 bg-black/40 rounded-xl border border-zinc-800 hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => handleBookSelect({ id: 'demo', content: 'Bu bir deneme metnidir.', title: 'Hızlı Başlangıç Rehberi' })}
               >
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Hızlı Başlangıç Rehberi</h3>
                        <p className="text-zinc-500 text-sm line-clamp-2">Sistemi test etmek ve kalibrasyon yapmak için kısa bir metin.</p>
                     </div>
                     <div className="p-3 bg-purple-500/10 rounded-full text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                        <PlayCircle className="w-6 h-6" />
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* SAĞ: Menü */}
          <div className="lg:col-span-4 space-y-6">
             <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                <h3 className="font-bold text-zinc-400 mb-4 text-sm uppercase tracking-wider">Hızlı Erişim</h3>
                <div className="space-y-2">
                   <Link href="/library" className="block w-full text-left p-4 rounded-lg bg-zinc-950 hover:bg-zinc-800 transition border border-zinc-900 hover:border-zinc-700">
                      📚 Kütüphaneye Git
                   </Link>
                   <Link href="/admin" className="block w-full text-left p-4 rounded-lg bg-zinc-950 hover:bg-zinc-800 transition border border-zinc-900 hover:border-zinc-700">
                      ⚙️ İçerik Yönetimi (Admin)
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// 2. ANA EXPORT ARTIK SUSPENSE İÇİNDE! İŞTE ÇÖZÜM BU.
export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-black text-white">Yükleniyor...</div>}>
      <HomeContent />
    </Suspense>
  );
}
