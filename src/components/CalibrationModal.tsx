"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Play, CheckCircle2, Eye, Zap, Brain, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs"; // ✅ EKLEME 1: Clerk Kancası

interface CalibrationModalProps {
  userId: string;
  onComplete: () => void;
}

export function CalibrationModal({ userId, onComplete }: CalibrationModalProps) {
  const { user } = useUser(); // ✅ EKLEME 2: Kullanıcı verisini al
  const [step, setStep] = useState<"intro" | "visual" | "adhd" | "speed_test" | "result">("intro");
  
  // Test Verileri
  const [visualCondition, setVisualCondition] = useState<"saglikli" | "goz_tembelligi">("saglikli");
  const [isADHD, setIsADHD] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [education, setEducation] = useState("lisans"); // Varsayılan

  // Hız Testi İçin Basit Motor
  const [startTime, setStartTime] = useState(0);
  const [testText] = useState("Okuma hızınızı ölçmek için bu metni normal hızınızda okuyun. Nöro-sistemimiz, beyninizin kelime işleme kapasitesini analiz ederek size en uygun 'Pivot' noktasını belirleyecektir. Hazır olduğunuzda bitir butonuna basın.");

  const startSpeedTest = () => {
    setStep("speed_test");
    setStartTime(Date.now());
  };

  const finishSpeedTest = () => {
    const duration = (Date.now() - startTime) / 1000 / 60; // Dakika cinsinden
    const wordCount = testText.split(" ").length;
    const calculatedWpm = Math.round(wordCount / duration);
    setWpm(calculatedWpm);
    setStep("result");
  };

  const saveProfile = async () => {
    if (!user) return; // Güvenlik

    // ✅ EKLEME 3: İsim ve E-posta verisini hazırla
    // Clerk'ten gelen veri bazen 'firstName' bazen 'fullName' olabilir, garantili alalım.
    const fullName = user.fullName || user.firstName || "İsimsiz Okuyucu";
    const email = user.primaryEmailAddress?.emailAddress || "";

    // Veritabanına "Tam Paket" gönder
    const { error } = await supabase.from("user_profiles").upsert({
      user_id: userId,
      
      // Kimlik Bilgileri (YENİ)
      full_name: fullName,
      email: email,
      
      // Nörolojik Ayarlar
      visual_condition: visualCondition,
      adhd_mode_active: isADHD,
      education_level: education,
      
      // Hız Ayarları
      base_wpm: wpm,
      max_comprehension_speed: wpm, // Başlangıçta max hız eşittir base hız
      
      // Oyunlaştırma
      mastery_level: wpm < 300 ? 'novice' : wpm < 600 ? 'adept' : 'elite',
      
      created_at: new Date().toISOString()
    });

    if (!error) {
      onComplete(); // Ana sayfaya dön
    } else {
      console.error("Profil Oluşturma Hatası:", error);
      alert("Profil kaydedilemedi. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 p-8 shadow-2xl relative overflow-hidden">
        
        {/* Dekoratif Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"></div>

        {step === "intro" && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95">
             <div className="inline-flex p-4 bg-purple-500/10 rounded-full mb-2">
                <Brain className="w-12 h-12 text-purple-500" />
             </div>
             <h2 className="text-3xl font-black text-white">Nöro-Kalibrasyon</h2>
             <p className="text-zinc-400 text-lg">
               Hoş geldin <span className="text-white font-bold">{user?.firstName}</span>. <br/>
               Sistemi beyninize göre ayarlamak için 30 saniyelik bir tarama yapacağız.
             </p>
             <Button size="lg" onClick={() => setStep("visual")} className="w-full bg-white text-black hover:bg-zinc-200 font-bold text-lg py-6">
                Taramayı Başlat <ArrowRight className="w-5 h-5 ml-2" />
             </Button>
          </div>
        )}

        {step === "visual" && (
          <div className="space-y-6 animate-in slide-in-from-right">
             <h3 className="text-xl font-bold text-white flex items-center gap-2"><Eye className="text-blue-500"/> Görsel Durum</h3>
             <p className="text-zinc-400">Görsel destek ihtiyacı veya odaklanma sorunu yaşıyor musunuz?</p>
             <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => { setVisualCondition("goz_tembelligi"); setStep("adhd"); }} className="h-24 border-zinc-700 hover:border-red-500 hover:bg-red-500/10 hover:text-red-500 flex flex-col gap-2">
                   <Eye className="w-6 h-6" />
                   Evet, Görsel Destek Modu
                </Button>
                <Button variant="outline" onClick={() => { setVisualCondition("saglikli"); setStep("adhd"); }} className="h-24 border-zinc-700 hover:border-green-500 hover:bg-green-500/10 hover:text-green-500 flex flex-col gap-2">
                   <CheckCircle2 className="w-6 h-6" />
                   Hayır, Sağlıklı
                </Button>
             </div>
          </div>
        )}

        {step === "adhd" && (
          <div className="space-y-6 animate-in slide-in-from-right">
             <h3 className="text-xl font-bold text-white flex items-center gap-2"><Zap className="text-yellow-500"/> Dikkat Yönetimi</h3>
             <p className="text-zinc-400">Okurken dikkatiniz çabuk dağılır mı? (Yüksek Odak Modu)</p>
             <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => { setIsADHD(true); startSpeedTest(); }} className="h-24 border-zinc-700 hover:border-purple-500 hover:bg-purple-500/10 hover:text-purple-500 flex flex-col gap-2">
                   Evet, Dağılıyor
                </Button>
                <Button variant="outline" onClick={() => { setIsADHD(false); startSpeedTest(); }} className="h-24 border-zinc-700 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-500 flex flex-col gap-2">
                   Hayır, Odaklanabilirim
                </Button>
             </div>
          </div>
        )}

        {step === "speed_test" && (
           <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-bold text-white">Hız Tespiti</h3>
              <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 text-xl leading-relaxed font-serif text-zinc-300 select-none">
                 {testText}
              </div>
              <Button onClick={finishSpeedTest} className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold text-lg">
                 Okudum, Bitir
              </Button>
           </div>
        )}

        {step === "result" && (
           <div className="text-center space-y-6 animate-in zoom-in-95">
              <div className="inline-flex p-4 bg-green-500/10 rounded-full mb-2">
                 <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-white">Kalibrasyon Tamamlandı</h2>
              
              <div className="grid grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-lg">
                 <div>
                    <div className="text-zinc-500 text-xs uppercase">Başlangıç Hızı</div>
                    <div className="text-2xl font-bold text-white">{wpm} WPM</div>
                 </div>
                 <div>
                    <div className="text-zinc-500 text-xs uppercase">Nöro-Mod</div>
                    <div className="text-sm font-bold text-white mt-1">
                        {visualCondition === 'goz_tembelligi' ? 'Kırmızı Odak' : 'Standart'} + {isADHD ? 'Yüksek Odak Çerçevesi' : 'Normal'}
                    </div>
                 </div>
              </div>

              <Button size="lg" onClick={saveProfile} className="w-full bg-white text-black hover:bg-zinc-200 font-bold text-lg py-6">
                 Profili Kaydet ve Başla 🚀
              </Button>
           </div>
        )}

      </Card>
    </div>
  );
}
