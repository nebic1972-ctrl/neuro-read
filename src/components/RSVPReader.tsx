"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, X, Zap } from "lucide-react";
import { AIQuizModal } from "@/components/AIQuizModal"; // ✅ YENİ
import { Card } from "@/components/ui/card"; // Loading için

interface RSVPReaderProps {
  content: string;
  wpm: number;
  isAdhdMode?: boolean;
  onClose: () => void;
  onComplete: (stats: { wpm: number; duration: number; quizScore: number }) => void; // ✅ Skor eklendi
}

export function RSVPReader({ content, wpm, isAdhdMode = false, onClose, onComplete }: RSVPReaderProps) {
  // Metin İşleme
  const words = content.split(/\s+/).filter((w) => w.length > 0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localWpm, setLocalWpm] = useState(wpm);
  
  // Quiz State'leri (YENİ)
  const [quizStatus, setQuizStatus] = useState<"reading" | "generating" | "quizzing">("reading");
  const [questions, setQuestions] = useState<any[]>([]);
  const startTimeRef = useRef<number>(0);

  // Sayaç ve Motor
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && currentIndex < words.length) {
      if (currentIndex === 0) startTimeRef.current = Date.now();
      
      const delay = 60000 / localWpm;
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            handleReadingFinished(); // ✅ Okuma bitince buraya git
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, localWpm, words.length]);

  // --- OKUMA BİTTİĞİNDE ÇALIŞAN FONKSİYON ---
  const handleReadingFinished = async () => {
    setQuizStatus("generating"); // Ekranda "Yapay Zeka Düşünüyor" yazacak
    
    try {
        console.log("Soru üretimi için API çağrılıyor...");
        
        // 1. API'ye metni gönder
        const response = await fetch("/api/quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: content })
        });

        const data = await response.json();
        console.log("Gelen Sorular:", data);

        if (Array.isArray(data) && data.length > 0) {
            setQuestions(data);
            setQuizStatus("quizzing"); // Quiz ekranını aç
        } else {
            // Soru gelmezse direkt bitir (Fallback)
            finishSession(0); 
        }

    } catch (error) {
        console.error("Quiz hatası:", error);
        finishSession(0); // Hata olursa skorsuz bitir
    }
  };

  // --- QUİZ BİTTİĞİNDE ÇALIŞAN FONKSİYON ---
  const handleQuizComplete = (score: number) => {
      finishSession(score);
  };

  // --- SEANSI KAPATMA ---
  const finishSession = (finalScore: number) => {
      const durationSec = (Date.now() - startTimeRef.current) / 1000;
      onComplete({
          wpm: localWpm,
          duration: durationSec,
          quizScore: finalScore // ✅ Gerçek skoru gönderiyoruz
      });
  };

  // --- RENDER (GÖRÜNÜM) ---

  // 1. Yükleniyor Ekranı (Gemini Düşünürken)
  if (quizStatus === "generating") {
      return (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur text-white">
              <div className="p-4 bg-purple-500/20 rounded-full animate-pulse mb-4">
                  <Zap className="w-12 h-12 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Nöro-Analiz Yapılıyor...</h2>
              <p className="text-zinc-400">Yapay Zeka okuduğunuz metinden sorular hazırlıyor.</p>
          </div>
      );
  }

  // 2. Quiz Ekranı (Sorular Geldiğinde)
  if (quizStatus === "quizzing") {
      return <AIQuizModal questions={questions} onComplete={handleQuizComplete} />;
  }

  // 3. Okuma Ekranı (Standart RSVP)
  const currentWord = words[currentIndex] || "";
  const pivotIndex = Math.ceil(currentWord.length / 2) - 1;
  const leftPart = currentWord.slice(0, pivotIndex);
  const centerChar = currentWord[pivotIndex];
  const rightPart = currentWord.slice(pivotIndex + 1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      {/* Üst Bar */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
           <div className="text-3xl font-black text-purple-500">{localWpm} WPM</div>
           {isAdhdMode && <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-1 rounded border border-blue-800">Yüksek Odak Modu</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-8 h-8" /></Button>
      </div>

      {/* Odak Alanı */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* ADHD Çerçevesi */}
        {isAdhdMode && (
           <div className="absolute w-[600px] h-[300px] border-y-2 border-blue-500/30 bg-blue-500/5 pointer-events-none"></div>
        )}
        
        {/* Kelime Gösterimi */}
        <div className="relative text-7xl md:text-9xl font-mono tracking-wide select-none">
           {/* Odak Çizgileri */}
           <div className="absolute left-1/2 -translate-x-1/2 -top-10 bottom-12 w-0.5 bg-zinc-800"></div>
           <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[300px] h-0.5 bg-zinc-800"></div>

           <span className="text-zinc-500">{leftPart}</span>
           <span className="text-white font-bold scale-110 inline-block transform origin-bottom border-b-4 border-purple-500">{centerChar}</span>
           <span className="text-zinc-500">{rightPart}</span>
        </div>
      </div>

      {/* Kontrol Paneli */}
      <div className="p-12 flex flex-col items-center gap-6 max-w-2xl mx-auto w-full">
         {/* İlerleme Çubuğu */}
         <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${(currentIndex / words.length) * 100}%` }}></div>
         </div>

         {/* Butonlar */}
         <div className="flex items-center gap-6">
            <Button variant="outline" size="icon" className="w-14 h-14 rounded-full border-zinc-800" onClick={() => setCurrentIndex(0)}>
               <RotateCcw className="w-6 h-6" />
            </Button>

            <Button 
              size="icon" 
              className={`w-24 h-24 rounded-full transition-all ${isPlaying ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-green-600 hover:bg-green-500 scale-110'}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
               {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
            </Button>
            
            {/* Hız Ayarı */}
            <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
               <input 
                 type="range" min="100" max="1000" step="50" 
                 value={localWpm} onChange={(e) => setLocalWpm(Number(e.target.value))}
                 className="w-32 accent-purple-500"
               />
            </div>
         </div>
         <div className="text-zinc-500 text-sm font-mono tracking-widest">
            {isAdhdMode ? "YÜKSEK ODAK MODU AKTİF" : "STANDART MOD"}
         </div>
      </div>
    </div>
  );
}
