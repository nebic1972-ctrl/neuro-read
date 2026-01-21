"use client";

import { Trophy, Flame } from "lucide-react";
import { useNeuroStore } from "@/store/useNeuroStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const XP_PER_LEVEL = 100;

function levelFromXP(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

function progressToNext(xp: number): { current: number; needed: number; pct: number } {
  const inLevel = xp % XP_PER_LEVEL;
  return { current: inLevel, needed: XP_PER_LEVEL, pct: inLevel / XP_PER_LEVEL };
}

export default function UserProgress() {
  const profile = useNeuroStore((s) => s.profile);
  const xp = profile?.xp_points ?? 0;
  const level = levelFromXP(xp);
  const { current, needed, pct } = progressToNext(xp);
  // Streak: placeholder until we have it in DB
  const streak = 0;

  return (
    <Card className={cn("overflow-hidden border-white/10 bg-zinc-900/80")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            İlerleme
          </span>
          <div className="flex items-center gap-1.5 text-amber-500">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-bold">Seviye {level}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* XP Bar */}
        <div>
          <div className="mb-1 flex justify-between text-xs text-zinc-500">
            <span>XP</span>
            <span>
              {current} / {needed}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500"
              style={{ width: `${Math.min(100, pct * 100)}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 rounded-lg bg-zinc-800/60 px-3 py-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <div>
            <p className="text-sm font-medium text-zinc-200">{streak} gün</p>
            <p className="text-[10px] text-zinc-500">seri</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
