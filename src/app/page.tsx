"use client";

import { RSVPReader } from "@/components/RSVPReader"; 
import { FileUploader } from "@/components/FileUploader";
import { CameraOCR } from "@/components/CameraOCR";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Play, Pause, RotateCcw, Edit2, TrendingUp, BrainCircuit, Keyboard, User, Trophy
} from "lucide-react";
import { useReadingStore } from "./useReadingStore";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { supabase } from "@/lib/supabase"; 

export default function HomePage() {
  const { user } = useUser();
  const { 
    wpm, fontSize, content, history, 
    setWpm, setFontSize, setContent, addHistoryEntry 
  } = useReadingStore();

  const [state, setState] = useState<'idle' | 'reading' | 'paused' | 'completed'>('idle');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempText, setTempText] = useState("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]); 
  const [isRSVPMode, setIsRSVPMode] = useState(false);
  const wordContainerRef = useRef<HTMLDivElement>(null);
  const words = content.split(/[\s\n]+/).filter(w => w.length > 0);

  // --- LİDERLİK TABLOSUNU ÇEK ---
  const fetchLeaderboard = useCallback(async () => {
    const { data, error } = await supabase
      .from('readings')
      .select('username, wpm, created_at')
      .order('wpm', { ascending: false })
      .limit(10);
    
    if (data) setLeaderboard(data);
    if (error) console.error("Liderlik tablosu hatası:", error);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // --- KLAVYE ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDialogOpen) return;
      switch (e.key) {
        case " ": e.preventDefault(); setState(prev => (prev === 'reading' ? 'paused' : 'reading')); break;
        case "ArrowUp": e.preventDefault(); setWpm(Math.min(1000, wpm + 10)); break;
        case "ArrowDown": e.preventDefault(); setWpm(Math.max(50, wpm - 10)); break;
        case "ArrowLeft": e.preventDefault(); setCurrentWordIndex(prev => Math.max(0, prev - 5)); break;
        case "ArrowRight": e.preventDefault(); setCurrentWordIndex(prev => Math.min(words.length - 1, prev + 5)); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen, wpm, words.length, setWpm]);

  // --- HIZ MOTORU ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state === 'reading' && currentWordIndex < words.length) {
      const currentWord = words[currentWordIndex];
      const baseDelay = 60000 / wpm;
      let delay = baseDelay;
      if (/[.?!]$/.test(currentWord)) delay = baseDelay * 3.5; 
      else if (/[,:;]$/.test(currentWord)) delay = baseDelay * 2.0;
      else if (/[-"]$/.test(currentWord)) delay = baseDelay * 1.5;
      if (currentWord.length > 10) delay = delay * 1.3;

      timer = setTimeout(() => {
        setCurrentWordIndex((prev) => {
          if (prev >= words.length - 1) return prev;
          return prev + 1;
        });
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [state, wpm, currentWordIndex, words]);

  // --- KAYIT MEKANİZMASI ---
  useEffect(() => {
    if (state === 'reading' && currentWordIndex >= words.length - 1 && words.length > 0) {
      const timer = setTimeout(async () => {
         setState('completed');
         addHistoryEntry(wpm);
         
         if (user) {
            console.log("Skor kaydediliyor...");
            await supabase.from('readings').insert({
                user_id: user.id,
                username: user.fullName || user.firstName || 'Anonim Pilot',
                wpm: wpm
            });
            console.log("Kaydedildi!");
            fetchLeaderboard(); 
         }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, state, words.length, wpm, addHistoryEntry, user, fetchLeaderboard]);

  const handleReset = () => { setState('idle'); setCurrentWordIndex(0); };
  const handleOpenEdit = () => { setTempText(content); setIsDialogOpen(true); if (state === 'reading') setState('paused'); };
  const handleSaveText = () => { if (tempText.trim().length > 0) { setContent(tempText); handleReset(); setIsDialogOpen(false); } };

  const renderHighlightedWord = (word: string) => {
    if (!word) return null;
    if (word.length < 2) return <span className="text-foreground">{word}</span>;
    const rawCenterIndex = Math.floor(word.length / 2);
    const start = word.slice(0, rawCenterIndex);
    const middle = word[rawCenterIndex];
    const end = word.slice(rawCenterIndex + 1);
    return (
      <>
        <span className="text-slate-300 opacity-80">{start}</span>
        <span className="text-red-500 font-extrabold mx-[0.5px] drop-shadow-[0_0_15px_rgba(239,68,68,1)] scale-125 inline-block">{middle}</span>
        <span className="text-slate-300 opacity-80">{end}</span>
      </>
    );
  };

  return (
    <main className="min-h-screen bg-black text-foreground p-4 md:p-8 font-sans select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 px-2">
           <div className="flex items-center gap-3">
             <BrainCircuit className="w-8 h-8 text-red-600 animate-pulse" />
             <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Neuro-Read</h1>
           </div>
           <div className="flex items-center gap-4">
              <SignedOut>
              <SignInButton mode="modal">
  {/* Button yerine div yaptık ama tipini button gibi gösterdik */}
  <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white h-10 px-4 py-2 cursor-pointer">
    <User className="w-4 h-4 mr-2"/> Giriş Yap
  </div>
</SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-2">
                   <span className="text-sm text-slate-400 hidden sm:inline">Hoş geldin, Pilot</span>
                   <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
           </div>
        </div>

        {/* DOSYA YÜKLEME ALANI */}
        <div className="max-w-4xl mx-auto w-full mb-6">
            <FileUploader onTextLoaded={(text) => {
                // 1. Metni kutuya yaz
                setTempText(text);
                
                // 2. Metni sisteme kaydet (Otomatik "Kaydet" butonu etkisi)
                setContent(text);
                
                // 3. Kullanıcıya haber ver (Tarayıcı uyarısı)
                alert("Dosya başarıyla okundu ve sisteme yüklendi! Hazır olunca BAŞLAT'a bas.");
            }} />
        </div>

        {/* KAMERA / OCR ALANI */}
        <div className="max-w-4xl mx-auto w-full mb-8">
            <CameraOCR onTextLoaded={(text) => {
                setTempText(text);
                setContent(text); // Otomatik kaydet
                alert("Görüntü metne çevrildi! Hazırsan BAŞLAT'a bas.");
            }} />
        </div>

        {/* KONTROLLER */}
        <Card className="p-6 border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-xl">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-400">Hedef Hız</span>
                <span className="text-2xl font-bold text-white">{wpm} <span className="text-xs text-slate-500 font-normal">WPM</span></span>
              </div>
              <Button variant="outline" onClick={handleOpenEdit} className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <Edit2 className="mr-2 h-4 w-4" /> Metni Düzenle
              </Button>
            </div>
            {/* RSVP BUTONU */}
            <div className="flex justify-center mt-6 mb-2">
                <Button 
                    onClick={() => setIsRSVPMode(true)}
                    className="bg-zinc-900 border border-red-900/50 hover:border-red-500 text-red-500 hover:text-white hover:bg-red-600/10 transition-all duration-300 w-full max-w-md py-6 text-lg font-mono tracking-widest uppercase"
                >
                    ⚡ RSVP Modunu Başlat ⚡
                </Button>
            </div>
            <div className="space-y-4">
              <Slider value={[wpm]} onValueChange={(v) => setWpm(v[0])} min={100} max={1000} step={10} />
              <div className="flex justify-between items-center pt-2">
                 <span className="text-sm text-slate-400">Yazı Boyutu: {fontSize}px</span>
                 <div className="w-1/2">
                    <Slider value={[fontSize]} onValueChange={(v) => setFontSize(v[0])} min={20} max={96} step={2} />
                 </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" className="rounded-full px-10 py-7 text-xl bg-white text-black hover:bg-slate-200 transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]" onClick={() => setState(state === 'reading' ? 'paused' : 'reading')}>
                {state === 'reading' ? (<><Pause className="mr-2 h-6 w-6" /> Duraklat (Space)</>) : (<><Play className="mr-2 h-6 w-6 fill-current" /> {state === 'paused' ? 'Devam Et' : 'Başlat'} (Space)</>)}
              </Button>
              {(state === 'paused' || state === 'completed') && (
                <Button variant="outline" size="icon" onClick={handleReset} className="rounded-full h-16 w-16 border-slate-700 hover:bg-slate-800 text-slate-300">
                  <RotateCcw className="h-6 w-6" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* EKRAN */}
        <Card className="min-h-[350px] flex items-center justify-center border-slate-800 bg-black shadow-[inset_0_0_50px_rgba(0,0,0,1)] p-8 relative overflow-hidden rounded-2xl">
           <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-red-600/60 transform -translate-x-1/2 pointer-events-none z-0 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
           <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-red-600/60 transform -translate-y-1/2 pointer-events-none z-0 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
           {state === 'idle' ? (
             <div className="text-center space-y-4 z-10 relative">
                <p className="text-slate-400 text-2xl font-light tracking-wide">Hazır</p>
                <p className="text-sm text-red-500 uppercase tracking-widest font-bold animate-pulse">Boşluk Tuşuna Bas</p>
             </div>
           ) : state === 'completed' ? (
             <div className="text-center space-y-5 z-10 relative">
                <p className="text-white text-3xl font-bold tracking-tight">Tamamlandı</p>
                <p className="text-green-500 text-sm">Skorun Liderlik Tablosuna Eklendi!</p>
                <Button variant="outline" onClick={handleReset} className="mt-4 border-slate-700 text-white hover:bg-slate-800">Başa Dön</Button>
             </div>
           ) : (
             <div className="z-20 text-center w-full relative flex justify-center items-center" ref={wordContainerRef} style={{ height: `${fontSize * 1.5}px` }}>
               <span className="font-bold whitespace-nowrap leading-none select-none flex items-center justify-center" style={{ fontSize: `${fontSize}px` }}>{words.length > 0 && renderHighlightedWord(words[currentWordIndex])}</span>
             </div>
           )}
           {state !== 'idle' && words.length > 0 && (
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 z-30">
               <div className="h-full bg-gradient-to-r from-red-900 to-red-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(220,38,38,0.8)]" style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}></div>
             </div>
           )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GRAFİK */}
            <Card className="p-6 border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-white" />
                    <h3 className="font-semibold text-slate-200">Senin İstatistiğin</h3>
                </div>
                <div className="h-[200px] w-full">
                    {history.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                <XAxis dataKey="date" hide />
                                <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 50', 'dataMax + 50']} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} />
                                <Line type="monotone" dataKey="wpm" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">Veri bekleniyor...</div>
                    )}
                </div>
            </Card>

            {/* LİDERLİK TABLOSU (BURASI EKSİK KALMIŞTI, ŞİMDİ TAMAM) */}
            <Card className="p-6 border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold text-slate-200">Liderlik Tablosu (Top 10)</h3>
                </div>
                <div className="space-y-3">
                    {leaderboard.length === 0 ? (
                        <div className="text-sm text-slate-500 italic text-center py-10">Henüz skor yok. İlk sen ol!</div>
                    ) : (
                        leaderboard.map((entry, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-slate-800/50 hover:border-red-900/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-bold w-6 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                                        #{i + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-200">{entry.username || 'Gizli Pilot'}</span>
                                        <span className="text-[10px] text-slate-500">{new Date(entry.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-red-500">{entry.wpm} <span className="text-[10px] text-slate-500 font-normal">WPM</span></span>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>

        {/* MODAL */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[600px]">
            <DialogHeader><DialogTitle>Metni Düzenle</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label htmlFor="content">Okunacak Metin</Label><Textarea id="content" className="min-h-[200px] bg-black/50 border-slate-700 text-slate-100 resize-y" value={tempText} onChange={(e) => setTempText(e.target.value)} placeholder="Metnini buraya yapıştır..." /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">İptal</Button><Button onClick={handleSaveText} className="bg-white text-black hover:bg-slate-200">Kaydet</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* RSVP MODAL */}
        {isRSVPMode && (
            <RSVPReader 
                content={tempText} 
                wpm={wpm}
                onClose={() => setIsRSVPMode(false)}
                onComplete={() => setIsRSVPMode(false)}
            />
        )}
      </div>
    </main>
  );
}