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
    if (isPlaying) {
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
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white">
      <div className="absolute top-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-gray-400 font-mono text-sm">{index + 1} / {words.length} Kelime</div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition"><X className="w-8 h-8" /></button>
      </div>

      <div className="flex-1 flex items-center justify-center w-full max-w-4xl px-4">
        <div className="text-center">
          <div className="text-7xl md:text-9xl font-black tracking-tight mb-8">
            {words.length > 0 ? (
              <span className="relative inline-block">
                <span className="text-gray-500">{words[index]?.slice(0, Math.floor(words[index]?.length / 2))}</span>
                <span className="text-red-500">{words[index]?.slice(Math.floor(words[index]?.length / 2), Math.floor(words[index]?.length / 2) + 1)}</span>
                <span className="text-gray-500">{words[index]?.slice(Math.floor(words[index]?.length / 2) + 1)}</span>
              </span>
            ) : "Hazır..."}
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full mt-12 max-w-md mx-auto overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="w-full p-8 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl">
            <button onClick={() => setWpm(Math.max(100, wpm - 50))} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><ChevronLeft /></button>
            <div className="text-center min-w-[80px]">
              <div className="text-xs text-gray-500 font-bold uppercase">HIZ</div>
              <div className="text-xl font-black text-blue-400">{wpm}</div>
            </div>
            <button onClick={() => setWpm(wpm + 50)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><ChevronRight /></button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => { setIndex(0); setIsPlaying(false); }} className="p-4 text-gray-500 hover:text-white transition"><RotateCcw /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-6 bg-white text-black rounded-full hover:scale-105 transition shadow-xl">
              {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
