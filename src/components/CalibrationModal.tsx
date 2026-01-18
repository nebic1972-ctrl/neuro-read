"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, Play, CheckCircle2, Brain } from "lucide-react";
import { RSVPReader } from "@/components/RSVPReader"; // Okuyucuyu içeri alıyoruz

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

  // Başlangıçta kullanıcının testi yapıp yapmadığını kontrol et
  useEffect(() => {
    async function checkProfile() {
      const { data } = await supabase
        .from("user_profiles")
        .select("total_words_read")
        .eq("user_id", userId)
        .single();
      
      // Eğer hiç okuma yapmamışsa (0 kelime), testi başlat
      if (!data || data.total_words_read === 0) {
        setIsOpen(true);
      }
    }
    checkProfile();
  }, [userId]);

  const handleTestComplete = async (stats: { wpm: number; duration: number }) => {
    setWpmResult(stats.wpm);
    setStep("RESULT");
    await saveProfile(stats.wpm, stats.duration);
  };

  const saveProfile = async (wpm: number, duration: number) => {
    setLoading(true);
    try {
      // Seviyeyi belirle
      let level = "NOVICE";
      if (wpm > 300) level = "APPRENTICE";
      if (wpm > 600) level = "MASTER";

      // Veritabanına kaydet
      const { error } = await supabase
        .from("user_profiles")
        .upsert({ 
            user_id: userId,
            mastery_level: level,
            total_words_read: 40, // Test metni yaklaşık uzunluğu
            total_reading_time_sec: duration,
            current_streak: 1
        }, { onConflict: "user_id" });

      if (error) throw error;
      console.log("Teşhis kaydedildi:", level);

    } catch (error) {
      console.error("Kayıt hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[600px]">
        
        {/* ADIM 1: GİRİŞ EKRANI */}
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

        {/* ADIM 2: OKUMA EKRANI (RSVP READER) */}
        {step === "READING" && (
          <div className="h-[300px] w-full">
            <RSVPReader 
              content={testContent} 
              wpm={300} // Başlangıç hızı
              onClose={() => setStep("INTRO")} 
              onComplete={handleTestComplete}
            />
          </div>
        )}

        {/* ADIM 3: SONUÇ VE KAPANIŞ */}
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
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={() => {
                setIsOpen(false);
                onComplete();
              }}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin"/> : "Panale Git"}
            </Button>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
