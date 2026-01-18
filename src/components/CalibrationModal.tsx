"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, Play, Brain, ArrowRight } from "lucide-react";
import { RSVPReader } from "@/components/RSVPReader";

interface CalibrationModalProps {
  userId: string;
  onComplete: () => void;
}

export function CalibrationModal({ userId, onComplete }: CalibrationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"INTRO" | "READING" | "RESULT">("INTRO");
  const [loading, setLoading] = useState(false);
  const [wpmResult, setWpmResult] = useState(0);

  // Test Metni
  const testContent = "Hızlı okuma, beynin bilgiyi işleme hızını artırmayı hedefleyen bir tekniktir. Göz kaslarını eğiterek ve iç seslendirmeyi azaltarak daha kısa sürede daha çok kelime okuyabilirsiniz. Bu kısa test, mevcut seviyenizi belirlemek içindir. Lütfen odaklanarak okuyun.";

  // Profil kontrolü
  useEffect(() => {
    async function checkProfile() {
      const { data } = await supabase
        .from("user_profiles")
        .select("total_words_read")
        .eq("user_id", userId)
        .maybeSingle(); // maybeSingle hata vermez
      
      // Kayıt yoksa veya hiç okumamışsa testi aç
      if (!data || data.total_words_read === 0) {
        setIsOpen(true);
      }
    }
    if (userId) checkProfile();
  }, [userId]);

  const handleTestComplete = async (stats: { wpm: number; duration: number }) => {
    setWpmResult(stats.wpm);
    setStep("RESULT");
    // Arka planda kaydetmeyi dene ama kullanıcıyı bekletme
    saveProfile(stats.wpm, stats.duration);
  };

  const saveProfile = async (wpm: number, duration: number) => {
    try {
      let level = "NOVICE";
      if (wpm > 300) level = "APPRENTICE";
      if (wpm > 600) level = "MASTER";

      console.log("Kaydediliyor...", { userId, level, wpm });

      const { error } = await supabase
        .from("user_profiles")
        .upsert({ 
            user_id: userId,
            mastery_level: level,
            total_words_read: 40, 
            total_reading_time_sec: duration,
            current_streak: 1
        }, { onConflict: "user_id" });

      if (error) {
        console.error("Supabase Hatası:", error);
      } else {
        console.log("Başarıyla kaydedildi.");
      }
    } catch (error) {
      console.error("Beklenmeyen hata:", error);
    }
  };

  // PANELE GİT (Hata olsa bile çalışır)
  const handleGoToDashboard = () => {
    setIsOpen(false);
    onComplete(); // Ana sayfadaki kilidi açar
    window.location.reload(); // Garanti olsun diye sayfayı yeniler
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[600px] [&>button]:hidden">
        
        {step === "INTRO" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <Brain className="w-6 h-6 text-purple-500"/> Hız Testi
              </DialogTitle>
              <DialogDescription className="text-center text-zinc-400">
                Sistemi kişiselleştirmek için kısa bir okuma testi yapacağız.
              </DialogDescription>
            </DialogHeader>
            <div className="py-8 flex justify-center">
              <Button 
                onClick={() => setStep("READING")} 
                className="bg-white text-black hover:bg-zinc-200 font-bold px-8 py-6 text-lg"
              >
                <Play className="w-5 h-5 mr-2 fill-black"/> Başla
              </Button>
            </div>
          </>
        )}

        {step === "READING" && (
          <RSVPReader 
            content={testContent} 
            wpm={300} 
            onClose={() => setStep("INTRO")} 
            onComplete={handleTestComplete}
          />
        )}

        {step === "RESULT" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Test Tamamlandı! 🎉</DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center space-y-4">
              <div className="text-zinc-400">Tespit Edilen Hızın</div>
              <div className="text-5xl font-black text-purple-500">{wpmResult} <span className="text-xl text-zinc-500">K/DK</span></div>
              <p className="text-sm text-zinc-500">Profilin buna göre ayarlandı.</p>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-lg"
              onClick={handleGoToDashboard}
            >
              Panele Git <ArrowRight className="ml-2 w-5 h-5"/>
            </Button>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
