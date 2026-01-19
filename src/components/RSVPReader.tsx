"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, X } from "lucide-react";

interface RSVPReaderProps {
  content: string;
  initialWpm: number;
  onClose: () => void;
}

export default function RSVPReader({ content, initialWpm, onClose }: RSVPReaderProps) {
  const [words, setWords] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(initialWpm);
  
  // Zamanlayıcı referansı (Motorun pistonu)
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Metni kelimelere böl ve temizle
    const wordList = content.split(/\s+/).filter(w => w.length > 0);
    setWords(wordList);
  }, [content]);

  useEffect(() => {
    if (isPlaying) {
      const interval = 60000 / wpm; // Hıza göre milisaniye hesapla
      timerRef.current = setInterval(() => {
        setIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false); // Bittiğinde dur
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, wpm, words]);

  // İlerleme yüzdesi
  const progress = words.length > 0 ? ((index + 1) / words.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
      {/* Üst Bar: Kapat ve İlerleme */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-gray-400 font-mono text-sm">
          {index + 1} / {words.length} Kelime
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
          <X className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* ⚡ ODAK NOKTASI (Motorun Ekranı) ⚡ */}
      <div className="flex-1 flex items-center justify-center w-full max-w-4xl px-4">
        <div className="text-center">
          <div className="text-7xl md:text-9xl font-black tracking-tight text-white mb-8">
            {words.length > 0 ? (
              // Odaklama Harfi (Kırmızı renkli orta harf mantığı eklenebilir, şimdilik basit tutuyoruz)
              <span className="relative">
                 {/* Vurgulu gösterim için basit bir mantık */}
                 <span className="text-gray-400">{words[index]?.slice(0, Math.floor(words[index]?.length / 2))}</span>
                 <span className="text-red-500">{words[index]?.slice(Math.floor(words[index]?.length / 2), Math.floor(words[index]?.length / 2) + 1)}</span>
                 <span className="text-gray-400">{words[index]?.slice(Math.floor(words[index]?.length / 2) + 1)}</span>
              </span>
            ) : (
              "Hazır..."
            )}
          </div>
          
          {/* İlerleme Çubuğu */}
          <div className="w-full h-2 bg-gray-800 rounded-full mt-12 max-w-lg mx-auto overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Kontrol Paneli */}
      <div className="absolute bottom-0 w-full p-8 bg-[#111] border-t border-white/10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          
          {/* Hız Ayarı */}
          <div className="flex items-center gap-4">
            <span className="text-gray-400 font-bold text-sm">HIZ</span>
            <div className="flex items-center gap-2 bg-black/50 p-1 rounded-lg border border-white/10">
              <button onClick={() => setWpm(w => Math.max(100, w - 50))} className="p-2 hover:bg-white/10 rounded">-</button>
              <span className="text-xl font-bold text-blue-400 w-16 text-center">{wpm}</span>
              <button onClick={() => setWpm(w => w + 50)} className="p-2 hover:bg-white/10 rounded">+</button>
            </div>
          </div>

          {/* Oynat / Durdur */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { setIndex(0); setIsPlaying(false); }} 
              className="p-4 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-6 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
          </div>

          {/* Sağ Boşluk (Denge için) */}
          <div className="w-32 hidden md:block"></div>
        </div>
      </div>
    </div>
  );
}
