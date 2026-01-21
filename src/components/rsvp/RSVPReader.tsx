"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, ChevronUp, ChevronDown, Trophy, X } from "lucide-react";
import { useNeuroStore } from "@/store/useNeuroStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RSVPReaderProps = {
  content: string;
  initialWpm?: number;
  onClose: () => void;
};

/**
 * Calculate Optimal Recognition Point (ORP) at 30-40% of word length
 * Returns the index of the ORP letter
 */
function getORPIndex(word: string): number {
  if (word.length === 0) return 0;
  if (word.length === 1) return 0;
  // Use 35% as the ORP position (middle of 30-40% range)
  const orpIndex = Math.floor(word.length * 0.35);
  return Math.max(0, Math.min(orpIndex, word.length - 1));
}

/**
 * Render word with ORP letter highlighted in red
 * The actual centering is done via fixed positioning in the component
 */
function renderWordWithORP(word: string): JSX.Element {
  const orpIndex = getORPIndex(word);
  const before = word.slice(0, orpIndex);
  const orpChar = word[orpIndex];
  const after = word.slice(orpIndex + 1);

  return (
    <span className="text-8xl font-bold text-white">
      {before}
      <span className="text-red-500">{orpChar}</span>
      {after}
    </span>
  );
}

export default function RSVPReader({ content, initialWpm, onClose }: RSVPReaderProps) {
  const userSettings = useNeuroStore((s) => s.userSettings);
  const setWPM = useNeuroStore((s) => s.setWPM);
  const updateXP = useNeuroStore((s) => s.updateXP);

  const defaultWpm = initialWpm ?? userSettings?.wpm_speed ?? 300;
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(defaultWpm);
  const [showCompletion, setShowCompletion] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAwardedXP = useRef(false);

  // Parse content into words on mount
  useEffect(() => {
    const parsed = content
      .split(/\s+/)
      .filter((w) => w.trim().length > 0)
      .map((w) => w.trim());
    setWords(parsed);
    setCurrentIndex(0);
    setIsPlaying(false);
    setShowCompletion(false);
    hasAwardedXP.current = false;
  }, [content]);

  // Spacebar shortcut for play/pause
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && !showCompletion) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showCompletion]);

  // Interval-based word advancement
  useEffect(() => {
    if (!isPlaying || words.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Calculate interval: 60000 / wpm milliseconds
    const intervalMs = 60000 / wpm;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        
        // Check if we've reached the end
        if (next >= words.length) {
          setIsPlaying(false);
          
          // Award XP only once
          if (!hasAwardedXP.current) {
            hasAwardedXP.current = true;
            updateXP(50);
            setShowCompletion(true);
          }
          
          return prev;
        }
        
        return next;
      });
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, wpm, words.length, updateXP]);

  const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0;
  const currentWord = words[currentIndex] || "";

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSpeedUp = () => {
    setWpm((prev) => {
      const next = Math.min(2000, prev + 25);
      setWPM(next);
      return next;
    });
  };

  const handleSpeedDown = () => {
    setWpm((prev) => {
      const next = Math.max(50, prev - 25);
      setWPM(next);
      return next;
    });
  };

  const handleCloseAfterCompletion = () => {
    setShowCompletion(false);
    onClose();
  };

  // Session Complete Summary
  if (showCompletion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center shadow-2xl">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-amber-500/20 p-4">
              <Trophy className="h-12 w-12 text-amber-500" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Oturum Tamamlandı!</h2>
          <p className="mb-6 text-zinc-400">
            {words.length} kelime okudunuz ve <span className="font-semibold text-amber-500">+50 XP</span> kazandınız.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleCloseAfterCompletion}
              className="flex-1 bg-amber-600 font-semibold hover:bg-amber-500"
            >
              Kapat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/80 px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">RSVP Reader</h2>
          <span className="text-sm text-zinc-500">{wpm} WPM</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main reading area - ORP letter centered */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-8">
        {currentWord ? (
          <div className="relative w-full text-center">
            {/* Full word rendered normally */}
            <div className="text-8xl font-bold text-white">
              {renderWordWithORP(currentWord)}
            </div>
            {/* Fixed position red ORP letter at exact screen center */}
            <div className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-bold text-red-500">
              {currentWord[getORPIndex(currentWord)]}
            </div>
          </div>
        ) : (
          <div className="text-4xl text-zinc-600">Hazırlanıyor...</div>
        )}
      </div>

      {/* Controls */}
      <div className="border-t border-white/10 bg-zinc-900/80 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
              className="h-10 w-10"
              title="Play/Pause (Spacebar)"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSpeedDown}
              className="h-10 w-10"
              title="Yavaşlat (-25 WPM)"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
            <span className="min-w-[5rem] text-center text-sm font-medium">{wpm} WPM</span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSpeedUp}
              className="h-10 w-10"
              title="Hızlandır (+25 WPM)"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-auto mt-4 max-w-4xl">
          <div className="mb-2 flex justify-between text-xs text-zinc-500">
            <span>
              {currentIndex} / {words.length} kelime
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
