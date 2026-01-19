"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, X, ChevronLeft, ChevronRight } from "lucide-react";

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const wordList = content.split(/\s+/).filter(w => w.length > 0);
    setWords(wordList);
  }, [content]);

  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const interval = 60000 / wpm;
      timerRef.current = setInterval(() => {
        setIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
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

  const progress = words.length > 0 ? ((index + 1) / words.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white">
      <div className="absolute top-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
        <div className="text-gray-400 font-mono text-sm">{index + 1} / {words.length} Kelime</div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition"><X className="w-8 h-8" /></button>
      </div>

      <div className="flex-1 flex items-center justify-center w-full max-w-4xl px-4">
        <div className="text-center">
          <div className="text-8xl md:text-[10rem] font-black tracking-tight mb-8 font-mono">
            <span className="relative inline-block">
              <span className="text-gray-600">{words[index]?.slice(0, Math.floor(words[index]?.length / 2))}</span>
              <span className="text-red-600">{words[index]?.slice(Math.floor(words[index]?.length / 2), Math.floor(words[index]?.length / 2) + 1)}</span>
              <span className="text-gray-600">{words[index]?.slice(Math.floor(words[index]?.length / 2) + 1)}</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-900 rounded-full mt-12 max-w-md mx-auto overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="w-full p-10 bg-[#050505] border-t border-white/5">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
            <button onClick={() => setWpm(Math.max(100, wpm - 50))} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 transition"><ChevronLeft /></button>
            <div className="text-center min-w-[90px]">
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">HIZ</div>
              <div className="text-2xl font-black text-blue-500">{wpm}</div>
            </div>
            <button onClick={() => setWpm(wpm + 50)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 transition"><ChevronRight /></button>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => { setIndex(0); setIsPlaying(false); }} className="p-4 text-gray-500 hover:text-white transition active:scale-90"><RotateCcw /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-8 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}