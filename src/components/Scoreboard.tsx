"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trophy, Medal, User } from "lucide-react";

export function Scoreboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      // En çok kelime okuyan ilk 5 kişiyi çek
      const { data } = await supabase
        .from("user_profiles")
        .select("email, total_words_read, mastery_level")
        .order("total_words_read", { ascending: false })
        .limit(5);

      if (data) setLeaders(data);
      setLoading(false);
    }
    fetchLeaders();
  }, []);

  // Email gizleme fonksiyonu (neb***@gmail.com)
  const maskEmail = (email: string) => {
    if (!email) return "Anonim";
    const [name, domain] = email.split("@");
    return `${name.substring(0, 3)}***@${domain}`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-white">Liderlik Tablosu</h2>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-zinc-500 text-center py-4">Yükleniyor...</div>
        ) : leaders.length === 0 ? (
          <div className="text-zinc-500 text-center">Henüz veri yok.</div>
        ) : (
          leaders.map((leader, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 transition">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold
                  ${index === 0 ? "bg-yellow-500/20 text-yellow-500" : 
                    index === 1 ? "bg-zinc-400/20 text-zinc-400" : 
                    index === 2 ? "bg-amber-700/20 text-amber-700" : "bg-zinc-800 text-zinc-500"}`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-zinc-200">{maskEmail(leader.email)}</div>
                  <div className="text-xs text-purple-400">{leader.mastery_level}</div>
                </div>
              </div>
              <div className="font-mono font-bold text-white">
                {(leader.total_words_read ?? 0).toLocaleString()} <span className="text-xs text-zinc-500 font-normal">Kelime</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
