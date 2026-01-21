"use client";

import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Goal = { id: string; label: string; target: string; done: boolean };

const DEFAULT_GOALS: Goal[] = [
  { id: "1", label: "Read 500 words", target: "500 kelime oku", done: false },
  { id: "2", label: "Complete 1 session", target: "1 oturum tamamla", done: false },
  { id: "3", label: "Practice 5 min", target: "5 dk egzersiz", done: false },
];

export default function DailyGoals() {
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);

  const toggle = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g))
    );
  };

  const doneCount = goals.filter((g) => g.done).length;

  return (
    <Card className={cn("overflow-hidden border-white/10 bg-zinc-900/80")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Günlük Hedefler</h2>
          <span className="text-sm text-zinc-500">
            {doneCount} / {goals.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {goals.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => toggle(g.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition",
                  "hover:bg-zinc-800/60",
                  g.done && "text-zinc-500 line-through"
                )}
              >
                {g.done ? (
                  <Check className="h-5 w-5 shrink-0 text-amber-500" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-zinc-600" />
                )}
                <span className="text-sm">{g.target}</span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
