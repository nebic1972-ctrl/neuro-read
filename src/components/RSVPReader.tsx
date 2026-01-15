"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RSVPReaderProps {
  content: string;
  wpm: number;
  onClose: () => void;
  onComplete: () => void;
}

export function RSVPReader({ content, wpm, onClose, onComplete }: RSVPReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // --- DÜZELTME BURADA ---
  // Eğer gelen metin (content) boşsa, varsayılan bir uyarı metni kullan.
  const safeContent = content && content.trim().length > 0 
    ? content 
    : "Hata: Okunacak metin bulunamadı. Lütfen önce kutuya bir metin yapıştırın.";

  const words = safeContent.split(/[\s\n]+/).filter(word => word.length > 0);
  // -----------------------

  const delay = 60000 / wpm;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentIndex < words.length) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            onComplete(); 
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, delay, words.length, onComplete]);

  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <Card className="w-full max-w-4xl p-12 bg-zinc-900 border-zinc-800 relative flex flex-col items-center min-h-[500px] justify-between shadow-2xl">
        <Button variant="ghost" size="icon" className="absolute right-6 top-6 text-zinc-500 hover:text-red-500" onClick={onClose}>
          <X className="w-8 h-8" />
        </Button>

        <div className="flex-1 flex flex-col items-center justify-center w-full relative">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-800"></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-zinc-800"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60px] w-[2px] h-[20px] bg-red-600"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[40px] w-[2px] h-[20px] bg-red-600"></div>

            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight font-mono z-10 text-center transition-all duration-75">
              {words[currentIndex]}
            </h1>
            <p className="text-zinc-500 mt-8 font-mono text-sm">Hız: <span className="text-red-400">{wpm} WPM</span></p>
        </div>

        <div className="w-full space-y-6 mt-8">
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-900 to-red-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between items-center px-2">
            <span className="text-zinc-500 font-mono text-xs">{currentIndex + 1} / {words.length}</span>
            <div className="flex gap-4">
                <Button variant="outline" size="icon" className="rounded-full border-zinc-700" onClick={() => { setIsPlaying(false); setCurrentIndex(0); }}>
                <RotateCcw className="w-4 h-4" />
                </Button>
                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 min-w-[160px] rounded-full font-bold" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <><Pause className="w-4 h-4 mr-2" /> DURAKLAT</> : <><Play className="w-4 h-4 mr-2" /> BAŞLAT</>}
                </Button>
            </div>
            <span className="text-zinc-500 font-mono text-xs text-right w-[60px]">{Math.round(progress)}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
