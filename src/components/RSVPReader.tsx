"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RSVPReaderProps {
  content: string;
  wpm: number;
  onClose: () => void;
  onComplete: (stats: { wpm: number; duration: number }) => void;
}

export function RSVPReader({ content, wpm, onClose, onComplete }: RSVPReaderProps) {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Kelimeleri hazırla
  useEffect(() => {
    if (content) {
      setWords(content.split(/\s+/).filter(w => w.length > 0));
    }
  }, [content]);

  // Zamanlayıcı (Motor)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentIndex < words.length) {
      if (!startTime) setStartTime(Date.now());
      
      const delay = 60000 / wpm; // Kelime başına düşen milisaniye
      
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            const duration = (Date.now() - (startTime || Date.now())) / 1000;
            onComplete({ wpm, duration });
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, words, wpm, startTime, onComplete]);

  // İlerleme çubuğu yüzdesi
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-white">
      {/* Kapatma Butonu */}
      <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-zinc-800 rounded-full transition">
        <X className="w-8 h-8 text-zinc-400" />
      </button>

      {/* OKUMA ALANI */}
      <div className="w-full max-w-4xl px-4 text-center space-y-12">
        <div className="relative h-64 flex items-center justify-center">
          {/* Odak Çizgileri */}
          <div className="absolute top-0 bottom-0 w-1 bg-red-500/20 left-1/2 -translate-x-1/2"></div>
          <div className="absolute left-0 right-0 h-1 bg-red-500/20 top-1/2 -translate-y-1/2"></div>
          
          {/* Kelime Gösterimi - TAŞMAYI ÖNLEYEN KISIM */}
          <div className="z-10 font-mono font-bold text-white relative">
             <span className={`block leading-none transition-all duration-100 ${
               words[currentIndex]?.length > 12 ? "text-5xl md:text-7xl" : "text-7xl md:text-9xl"
             }`}>
               {words[currentIndex]}
             </span>
          </div>
        </div>

        {/* Kontroller */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              className="w-16 h-16 rounded-full border-2 border-zinc-700 hover:bg-zinc-800 hover:border-white transition-all"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-500 hover:text-white"
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex(0);
                setStartTime(null);
              }}
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="w-full max-w-md h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-zinc-500 font-mono">
            {currentIndex + 1} / {words.length} Kelime
          </div>
        </div>
      </div>
    </div>
  );
}
