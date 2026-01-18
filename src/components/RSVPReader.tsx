"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw, Settings, Zap, Eye, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RSVPReaderProps {
  content: string;
  wpm: number;
  onClose: () => void;
  onComplete: (stats: { wpm: number; duration: number }) => void;
}

export function RSVPReader({ content, wpm: initialWpm, onClose, onComplete }: RSVPReaderProps) {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // --- YENİ ÖZELLİKLER (MODLAR) ---
  const [wpm, setWpm] = useState(initialWpm);
  const [mode, setMode] = useState<"NORMAL" | "FOCUS" | "ADHD">("NORMAL");
  const [fontSize, setFontSize] = useState(0); // 0: Normal, 1: Büyük

  useEffect(() => {
    if (content) {
      setWords(content.split(/\s+/).filter(w => w.length > 0));
    }
  }, [content]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentIndex < words.length) {
      if (!startTime) setStartTime(Date.now());
      
      const delay = 60000 / wpm;
      
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

  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;
  const currentWord = words[currentIndex] || "";

  // --- ODAK NOKTASI HESAPLAMA (Reticle) ---
  const renderWord = () => {
    if (mode === "NORMAL") return currentWord;

    // FOCUS Modu: Kelimenin ortasını renklendir
    if (mode === "FOCUS" || mode === "ADHD") {
      if (currentWord.length === 0) return currentWord;
      const mid = Math.floor(currentWord.length / 2);
      const first = currentWord.slice(0, mid);
      const middle = currentWord[mid];
      const last = currentWord.slice(mid + 1);

      return (
        <>
          <span className="text-zinc-400">{first}</span>
          <span className="text-red-500 font-bold scale-110 inline-block">{middle}</span>
          <span className="text-zinc-400">{last}</span>
        </>
      );
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-white ${mode === 'ADHD' ? 'backdrop-blur-md' : ''}`}>
      
      {/* Üst Bar */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex gap-2">
            {/* AYARLAR MENÜSÜ */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-transparent border-zinc-700 hover:bg-zinc-800">
                  <Settings className="w-5 h-5 mr-2" /> Ayarlar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-zinc-900 border-zinc-800 text-white w-72">
                 <div className="space-y-4">
                    <h4 className="font-bold text-lg border-b border-zinc-800 pb-2">Okuma Ayarları</h4>
                    
                    <div className="space-y-2">
                       <label className="text-xs text-zinc-400 flex justify-between">
                          <span>Hız (WPM)</span>
                          <span className="text-purple-400">{wpm}</span>
                       </label>
                       <Slider 
                          value={[wpm]} 
                          max={1000} 
                          min={100} 
                          step={50}
                          onValueChange={(val) => setWpm(val[0])}
                          className="py-4"
                       />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                       <button onClick={() => setMode("NORMAL")} className={`p-2 text-xs rounded border ${mode === 'NORMAL' ? 'bg-purple-600 border-purple-600' : 'border-zinc-700'}`}>Normal</button>
                       <button onClick={() => setMode("FOCUS")} className={`p-2 text-xs rounded border ${mode === 'FOCUS' ? 'bg-purple-600 border-purple-600' : 'border-zinc-700'}`}>Odak</button>
                       <button onClick={() => setMode("ADHD")} className={`p-2 text-xs rounded border ${mode === 'ADHD' ? 'bg-purple-600 border-purple-600' : 'border-zinc-700'}`}>ADHD</button>
                    </div>
                 </div>
              </PopoverContent>
            </Popover>
        </div>

        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition">
          <X className="w-8 h-8 text-zinc-400" />
        </button>
      </div>

      {/* OKUMA ALANI */}
      <div className="w-full max-w-4xl px-4 text-center space-y-12 relative">
        {/* ADHD Rehber Çizgileri */}
        {mode === 'ADHD' && (
           <div className="absolute inset-0 pointer-events-none border-y-2 border-purple-500/20 h-32 top-1/2 -translate-y-1/2 bg-purple-500/5"></div>
        )}

        <div className="relative h-64 flex items-center justify-center">
          {/* Odak Çizgileri (Sadece Focus modunda) */}
          {mode === 'FOCUS' && (
            <>
              <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/30 left-1/2 -translate-x-1/2"></div>
              <div className="absolute left-0 right-0 h-0.5 bg-red-500/30 top-1/2 -translate-y-1/2"></div>
            </>
          )}
          
          <div className="z-10 font-mono font-bold text-white relative">
             <span className={`block leading-none transition-all duration-100 ${
               currentWord.length > 12 ? "text-5xl md:text-6xl" : "text-7xl md:text-9xl"
             }`}>
               {renderWord()}
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

          <div className="w-full max-w-md h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-zinc-500 font-mono">
            {currentIndex + 1} / {words.length} • {Math.round(wpm)} WPM
          </div>
        </div>
      </div>
    </div>
  );
}
