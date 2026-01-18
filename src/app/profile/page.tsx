"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Trophy, Activity, History, Settings, 
  BrainCircuit, Calendar, TrendingUp 
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // 1. Profil Verisini Çek
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      setProfile(profileData);

      // 2. Son Okumaları Çek (Geçmiş)
      const { data: historyData } = await supabase
        .from("readings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10); // Son 10 okuma
      
      if (historyData) setHistory(historyData);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Nöro-Profil Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- HEADER: Kullanıcı Kimliği --- */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-zinc-800 pb-8 gap-6">
           <div className="flex items-center gap-6">
              {/* Clerk Avatarı */}
              <div className="scale-150 p-2 bg-zinc-900 rounded-full border border-zinc-800">
                <UserButton afterSignOutUrl="/" />
              </div>
              <div>
                 <h1 className="text-3xl font-black text-white">{user?.fullName || "İsimsiz Nöron"}</h1>
                 <p className="text-zinc-500 flex items-center gap-2">
                    <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-1 rounded border border-purple-500/20 font-bold uppercase">
                      {profile?.mastery_level || "NOVICE"}
                    </span>
                    <span className="text-xs">Üyelik: {new Date(user?.createdAt || Date.now()).toLocaleDateString('tr-TR')}</span>
                 </p>
              </div>
           </div>
           
           <div className="flex gap-4">
              <Link href="/">
                 <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:text-white">Kokpite Dön</Button>
              </Link>
           </div>
        </div>

        {/* --- İSTATİSTİK KARTLARI --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* Kart 1: Hız Rekoru */}
           <Card className="bg-zinc-900 border-zinc-800 p-6 flex items-center gap-4 hover:border-purple-500/50 transition-colors">
              <div className="p-4 bg-purple-600/20 rounded-full">
                 <Trophy className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                 <div className="text-3xl font-black text-white">{profile?.max_comprehension_speed || 0}</div>
                 <div className="text-xs text-zinc-500 uppercase font-bold">Max Hız (WPM)</div>
              </div>
           </Card>

           {/* Kart 2: Güvenli Hız */}
           <Card className="bg-zinc-900 border-zinc-800 p-6 flex items-center gap-4 hover:border-green-500/50 transition-colors">
              <div className="p-4 bg-green-600/20 rounded-full">
                 <Activity className="w-8 h-8 text-green-500" />
              </div>
              <div>
                 <div className="text-3xl font-black text-white">{profile?.base_wpm || 200}</div>
                 <div className="text-xs text-zinc-500 uppercase font-bold">Konfor Hızı (WPM)</div>
              </div>
           </Card>

           {/* Kart 3: Toplam Seans */}
           <Card className="bg-zinc-900 border-zinc-800 p-6 flex items-center gap-4 hover:border-blue-500/50 transition-colors">
              <div className="p-4 bg-blue-600/20 rounded-full">
                 <BrainCircuit className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                 <div className="text-3xl font-black text-white">{history.length}</div>
                 <div className="text-xs text-zinc-500 uppercase font-bold">Tamamlanan Seans</div>
              </div>
           </Card>
        </div>

        {/* --- GEÇMİŞ LİSTESİ --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Sol: Geçmiş */}
           <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <History className="w-5 h-5 text-zinc-400" /> Son Antrenmanlar
              </h3>
              
              <div className="space-y-3">
                 {history.length === 0 ? (
                    <div className="text-zinc-600 text-sm italic">Henüz veri yok...</div>
                 ) : (
                    history.map((item) => (
                       <div key={item.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex justify-between items-center group hover:bg-zinc-900 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="text-xs text-zinc-500 font-mono flex flex-col items-center justify-center w-12 border-r border-zinc-800 pr-4">
                                <span>{new Date(item.created_at).getDate()}</span>
                                <span className="uppercase">{new Date(item.created_at).toLocaleString('tr-TR', { month: 'short' })}</span>
                             </div>
                             <div>
                                <div className="text-white font-bold text-lg">{item.wpm} WPM</div>
                                <div className="text-zinc-500 text-xs">Anlama Skoru: %{item.quiz_score || 0}</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             {/* Basit Skor Göstergesi */}
                             <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className={`h-full ${item.quiz_score >= 80 ? 'bg-green-500' : item.quiz_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${item.quiz_score || 0}%` }}></div>
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Sağ: Ayarlar / Bilgi */}
           <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <Settings className="w-5 h-5 text-zinc-400" /> Profil Detayları
              </h3>
              
              <Card className="bg-zinc-900 border-zinc-800 p-6 space-y-4">
                 <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold">Eğitim Seviyesi</label>
                    <div className="text-white">{profile?.education_level?.toUpperCase() || "Belirtilmedi"}</div>
                 </div>
                 <div className="h-px bg-zinc-800"></div>
                 <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold">Göz Durumu</label>
                    <div className={`text-white flex items-center gap-2 ${profile?.visual_condition === 'saglikli' ? 'text-green-400' : 'text-red-400'}`}>
                       {profile?.visual_condition === 'goz_tembelligi' ? "Görsel Destek Modu Aktif" : "Standart Görüş"}
                    </div>
                 </div>
                 <div className="h-px bg-zinc-800"></div>
                 <div>
                     <label className="text-xs text-zinc-500 uppercase font-bold">Yüksek Odak Modu</label>
                     <div className="text-white">{profile?.adhd_mode_active ? "Aktif (Odak Çerçevesi Açık)" : "Pasif"}</div>
                 </div>
              </Card>

              {/* Reset Butonu (İleride eklenebilir) */}
              <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20 text-xs text-yellow-200/70">
                 <TrendingUp className="w-4 h-4 mb-2 text-yellow-500" />
                 Seviyenizi yükseltmek için günde en az 1 seans yapmanız önerilir.
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}