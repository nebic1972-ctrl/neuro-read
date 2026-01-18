"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BookPlus, Terminal, Trash2, RefreshCw, BookOpen 
} from "lucide-react";

export default function AdminPage() {
  const { user } = useUser();
  
  // --- STATE'LER ---
  const [form, setForm] = useState({
    title: "",
    content: "",
    genre: "Genel",
    difficulty: 3
  });
  const [libraryList, setLibraryList] = useState<any[]>([]); // Mevcut kitaplar
  const [loadingList, setLoadingList] = useState(true);
  
  const [debugLog, setDebugLog] = useState<string>(""); 
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // --- 1. KİTAPLARI LİSTELE ---
  const fetchLibrary = async () => {
    setLoadingList(true);
    const { data, error } = await supabase
      .from("library")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setLibraryList(data);
    if (error) setDebugLog(`LİSTELEME HATASI: ${error.message}`);
    setLoadingList(false);
  };

  // Sayfa açılınca listeyi çek
  useEffect(() => {
    fetchLibrary();
  }, []);

  // --- 2. SİLME FONKSİYONU ---
  const handleDelete = async (id: string) => {
    if (!confirm("Bu eseri kütüphaneden kalıcı olarak silmek istediğine emin misin?")) return;

    const { error } = await supabase
      .from("library")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Silinemedi: " + error.message);
      setDebugLog(`SİLME HATASI: ${error.message}`);
    } else {
      // Listeden de kaldır (Ekranı yenilemeden)
      setLibraryList(prev => prev.filter(item => item.id !== id));
      setDebugLog(`SİLİNDİ: Kitap ID ${id}`);
    }
  };

  // --- 3. KAYDETME FONKSİYONU ---
  const handleSave = async () => {
    if (!user) {
        setDebugLog("HATA: Oturum yok.");
        setStatus("error");
        return;
    }
    setDebugLog("Kaydediliyor...");
    setStatus("saving");

    try {
      const payload = {
        title: form.title,
        content: form.content,
        genre: form.genre,
        difficulty_level: Number(form.difficulty),
        user_id: user.id,
        cognitive_load_score: 50 
      };

      const { data, error } = await supabase.from("library").insert(payload).select();

      if (error) throw error;

      setDebugLog(`EKLENDİ: ${data?.[0]?.title}`);
      setStatus("success");
      
      // Listeyi güncelle
      fetchLibrary();

      // Formu temizle
      setTimeout(() => {
          setForm({ title: "", content: "", genre: "Genel", difficulty: 3 });
          setStatus("idle");
      }, 2000);

    } catch (err: any) {
      setDebugLog(`HATA: ${err.message}`);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex justify-center">
      <div className="w-full max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
                <BookPlus className="w-8 h-8 text-purple-500" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-white">İçerik Yönetimi</h1>
                <p className="text-zinc-500 text-sm">Ekle, Düzenle ve Sil</p>
            </div>
          </div>
          {/* Sistem Log Kutusu (Küçük) */}
          <div className="w-1/2 bg-zinc-950 border border-zinc-800 p-2 rounded text-[10px] font-mono text-green-400 h-16 overflow-y-auto">
             <div className="flex items-center gap-1 text-zinc-500 mb-1"><Terminal className="w-3 h-3"/> LOG</div>
             {debugLog || "Hazır..."}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- SOL: EKLEME FORMU --- */}
          <Card className="bg-zinc-900 border-zinc-800 p-6 space-y-4 h-fit">
             <h3 className="font-bold text-white flex items-center gap-2"><BookPlus className="w-4 h-4"/> Yeni Eser Ekle</h3>
             
             <div>
               <input 
                 suppressHydrationWarning
                 className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                 placeholder="Eser Başlığı"
                 value={form.title}
                 onChange={e => setForm({...form, title: e.target.value})}
               />
             </div>
             <div>
               <textarea 
                 suppressHydrationWarning
                 className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
                 placeholder="İçerik metni..."
                 value={form.content}
                 onChange={e => setForm({...form, content: e.target.value})}
               />
             </div>
             <div className="grid grid-cols-2 gap-2">
                <select 
                   className="bg-zinc-950 border border-zinc-800 p-2 text-white rounded"
                   value={form.genre}
                   onChange={e => setForm({...form, genre: e.target.value})}
                 >
                   <option value="Genel">Genel</option>
                   <option value="Hikaye">Hikaye</option>
                   <option value="Akademik">Akademik</option>
                 </select>
                 <select 
                   className="bg-zinc-950 border border-zinc-800 p-2 text-white rounded"
                   value={form.difficulty}
                   onChange={e => setForm({...form, difficulty: Number(e.target.value)})}
                 >
                   <option value={1}>Seviye 1 (Kolay)</option>
                   <option value={3}>Seviye 3 (Orta)</option>
                   <option value={5}>Seviye 5 (Zor)</option>
                 </select>
             </div>
             <Button 
               onClick={handleSave} 
               disabled={status === 'saving'}
               className={`w-full font-bold ${status === 'success' ? 'bg-green-600' : 'bg-white text-black hover:bg-zinc-200'}`}
             >
               {status === 'saving' ? "Ekleniyor..." : "KÜTÜPHANEYE EKLE"}
             </Button>
          </Card>

          {/* --- SAĞ: MEVCUT LİSTE & SİLME --- */}
          <Card className="bg-zinc-900 border-zinc-800 p-0 overflow-hidden flex flex-col h-[500px]">
             <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4"/> Mevcut Kütüphane ({libraryList.length})
                </h3>
                <Button size="icon" variant="ghost" onClick={fetchLibrary} title="Yenile">
                    <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
                </Button>
             </div>

             <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {libraryList.length === 0 ? (
                    <div className="text-center text-zinc-500 py-10 text-sm">Kütüphane boş.</div>
                ) : (
                    libraryList.map((book) => (
                        <div key={book.id} className="group flex items-center justify-between p-3 bg-zinc-950/50 border border-zinc-800 rounded hover:border-zinc-600 transition-colors">
                            <div className="overflow-hidden">
                                <div className="font-bold text-sm text-white truncate">{book.title}</div>
                                <div className="text-[10px] text-zinc-500 flex gap-2">
                                    <span className="uppercase">{book.genre}</span>
                                    <span>•</span>
                                    <span>Seviye {book.difficulty_level}</span>
                                </div>
                            </div>
                            
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8 opacity-20 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDelete(book.id)}
                                title="Sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))
                )}
             </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
