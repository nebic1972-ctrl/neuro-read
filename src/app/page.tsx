"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, BrainCircuit, Eye, Activity, Play } from "lucide-react";
import Link from "next/link";

// Bileşenler
import { RSVPReader } from "@/components/RSVPReader";
import { FileUploader } from "@/components/FileUploader";
import { Leaderboard } from "@/components/Leaderboard";
import { ReadingStats } from "@/components/ReadingStats"; // Yeni grafik
import { DiagnosticTest } from "@/components/DiagnosticTest"; // Yeni test
import { TextPreview } from "@/components/TextPreview"; // Önizleme ekranı
import { SessionResult } from "@/components/SessionResult"; // Sonuç ekranı
import { UserProgress } from "@/components/UserProgress"; // İlerleme çubuğu
import { DisclaimerModal } from "@/components/DisclaimerModal"; // Yasal uyarı

export default function HomePage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("id");

  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false); // Okuma öncesi mod
  const [sessionData, setSessionData] = useState<any>(null); // Sonuç ekranı için veri
  const [loadingBook, setLoadingBook] = useState(false);
  const [statsTrigger, setStatsTrigger] = useState(0);

  // --- KULLANICI PROFİL STATE'LERİ ---
  const [needsTest, setNeedsTest] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recommendedBook, setRecommendedBook] = useState<any>(null); // Önerilen kitap

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Kullanıcı Profilini ve Önerilen Kitabı Çek
  useEffect(() => {
    const initSystem = async () => {
      if (!user) return;
      
      // A) Profili Al
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !profile) {
        setNeedsTest(true);
      } else {
        setUserProfile(profile);
        setNeedsTest(false);

        // B) PROFİLE GÖRE KİTAP ÖNER (YENİ KISIM 🧠)
        let targetDifficulty = 1;
        
        // Eğitim ve Ustalığa göre zorluk belirle
        if (profile.education_level === 'akademik' || profile.mastery_level === 'genius') targetDifficulty = 5;
        else if (profile.education_level === 'lisans' || profile.mastery_level === 'elite') targetDifficulty = 3;
        else targetDifficulty = 1;

        // Veritabanından uygun kitabı bul
        const { data: book } = await supabase
            .from("library")
            .select("*")
            .lte('difficulty_level', targetDifficulty) // Kullanıcının seviyesine eşit veya altı
            .order('difficulty_level', { ascending: false }) // En zorunu (kullanıcıya en yakınını) getir
            .limit(1)
            .single();
        
        if (book) setRecommendedBook(book);
      }
    };
    
    if (mounted) initSystem();
  }, [user, mounted, statsTrigger]); // Test bitince (statsTrigger) profili tekrar çek

  // 2. Kütüphaneden Kitap Yükleme (Varsa)
  useEffect(() => {
    if (bookId) {
      const loadBook = async () => {
        setLoadingBook(true);
        const { data } = await supabase.from("library").select("content").eq("id", bookId).single();
        if (data) {
          setText(data.content);
          setIsPreviewing(true); // Önce önizleme göster
        }
        setLoadingBook(false);
      };
      loadBook();
    }
  }, [bookId]);

  const handleSessionComplete = (stats: { wpm: number; duration: number; quizScore: number }) => {
    setIsReading(false);
    
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    
    // 🛡️ GÜVENLİK FİLTRESİ: 
    // Eğer kelime sayısı 5'ten azsa (boş metin hatası) sonuç ekranını açma.
    if (wordCount < 5) return; 

    setSessionData({
      wpm: stats.wpm,
      wordCount: wordCount,
      durationSeconds: stats.duration,
      quizScore: stats.quizScore // ✅ Quiz skoru eklendi
    });
  };

  // Hydration Shield
  if (!mounted) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono">Nöro-Sistem Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-4 relative">
      
      {/* YASAL KORUMA KALKANI - En üstte çalışır */}
      <DisclaimerModal onAccept={() => console.log("Yasal metin kabul edildi.")} />
      
      {/* --- SONUÇ EKRANI (EN ÜSTTE - MODAL) --- */}
      {sessionData && (
        <SessionResult 
          wpm={sessionData.wpm}
          wordCount={sessionData.wordCount}
          durationSeconds={sessionData.durationSeconds}
          quizScore={sessionData.quizScore}
          onClose={() => { 
            setSessionData(null); // Sonuç ekranını kapat
            setStatsTrigger(prev => prev + 1); // Grafikleri güncelle
          }}
        />
      )}

      {/* --- TEŞHİS TESTİ MODALI --- */}
      {needsTest && (
        <DiagnosticTest onComplete={() => { setNeedsTest(false); setStatsTrigger(prev => prev+1); }} />
      )}

      {/* --- HEADER & PROFİL ÖZETİ --- */}
      <header className="max-w-6xl mx-auto flex justify-between items-center py-6 mb-8 border-b border-zinc-800">
        <div className="flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-purple-500" />
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              Neuro-Read <span className="text-xs text-zinc-600 font-mono">v1.2</span>
            </h1>
        </div>

        {userProfile && (
            <div className="flex items-center gap-4">
                {/* Ustalık Rozeti */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700">
                    <Trophy className={`w-4 h-4 ${userProfile.mastery_level === 'genius' ? 'text-yellow-400' : 'text-purple-400'}`} />
                    <span className="text-xs font-bold uppercase text-zinc-300">
                        {userProfile.mastery_level || "NOVICE"}
                    </span>
                </div>

                {/* Hız Limiti Göstergesi */}
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 uppercase">Güvenli Hız</span>
                    <span className="text-sm font-mono font-bold text-green-400">{userProfile.base_wpm || 200} WPM</span>
                </div>

                {/* Görsel/Yüksek Odak Uyarıları */}
                {(userProfile.visual_condition !== 'saglikli' || userProfile.adhd_mode_active) && (
                    <div className="p-2 bg-blue-500/10 rounded-full border border-blue-500/20" title="Adaptif Görsel Mod Aktif">
                        <Eye className="w-4 h-4 text-blue-400" />
                    </div>
                )}

                <Link href="/library">
                    <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 gap-2">
                        <BookOpen className="w-4 h-4" /> Kütüphane
                    </Button>
                </Link>
            </div>
        )}
      </header>

      {/* --- ANA İÇERİK --- */}
      {loadingBook ? (
        <div className="flex flex-col items-center justify-center h-64 animate-pulse">
           <Activity className="w-10 h-10 text-purple-500 mb-4" />
           <p className="text-zinc-500 font-mono">Sinaptik Veri Yükleniyor...</p>
        </div>
      ) : isReading ? (
        // Okuyucuya Kullanıcı Ayarlarını Gönderiyoruz
        <RSVPReader 
           content={text} 
           wpm={userProfile?.base_wpm || 300}
           isAdhdMode={userProfile?.adhd_mode_active}
           onClose={() => setIsReading(false)} 
           onComplete={handleSessionComplete}
        />
      ) : isPreviewing ? (
        // Önizleme Modunda
        <TextPreview 
          content={text} 
          userWpm={userProfile?.base_wpm || 250}
          onStart={() => { 
              setSessionData(null); // 🛡️ GEÇMİŞ KARNEYİ SİL
              setIsPreviewing(false); 
              setIsReading(true); 
          }} 
          onCancel={() => setIsPreviewing(false)} 
        />
      ) : (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* İLERLEME VE SEVİYE ÇUBUĞU */}
          {userProfile && (
             <UserProgress 
                currentWpm={userProfile.base_wpm || 200} 
                masteryLevel={userProfile.mastery_level || 'novice'} 
             />
          )}
          
          {/* Dosya Yükleyici */}
          <FileUploader onTextLoaded={(t) => { setText(t); setIsPreviewing(true); }} />
          
          {/* GÜNLÜK AKILLI ÖNERİ KARTI */}
          {recommendedBook && (
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-xl flex justify-between items-center animate-in slide-in-from-left">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">
                              Sizin İçin Seçildi
                          </span>
                          <span className="text-[10px] text-zinc-500">
                              ({userProfile?.education_level?.toUpperCase()} Seviyesi)
                          </span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{recommendedBook.title || "İsimsiz Metin"}</h3>
                      <p className="text-sm text-zinc-400 line-clamp-1">{recommendedBook.content.substring(0, 80)}...</p>
                  </div>
                  
                  <Button 
                      onClick={() => { setText(recommendedBook.content); setIsPreviewing(true); }}
                      className="bg-white text-black hover:bg-zinc-200 font-bold"
                  >
                      Hemen Oku <Play className="w-4 h-4 ml-2" />
                  </Button>
              </div>
          )}
          
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Grafik - Sol Geniş Alan */}
             <div className="lg:col-span-2 h-80">
                <ReadingStats refreshTrigger={statsTrigger} />
             </div>
             
             {/* Liderlik Tablosu - Sağ Dar Alan */}
             <div className="h-80">
                <Leaderboard />
             </div>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="border-t border-zinc-900 mt-20 py-10 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-zinc-600 text-xs leading-relaxed">
            <strong>YASAL UYARI:</strong> Bu uygulama bir tıbbi cihaz değildir ve tıbbi tavsiye vermez. 
            Sunulan içerikler ve egzersizler sadece eğitim ve kişisel gelişim amaçlıdır. 
            Göz sağlığı veya nörolojik durumlarla ilgili endişeleriniz için lütfen bir uzmana danışın.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
            <span>Gizlilik Politikası</span>
            <span>Kullanım Koşulları</span>
            <span>KVKK Aydınlatma Metni</span>
          </div>
          <p className="text-zinc-700 text-[10px] mt-4">
            © {new Date().getFullYear()} Neuro-Read Platform. Tüm Hakları Saklıdır.
          </p>
        </div>
      </footer>
    </main>
  );
}