"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface LibraryManagerProps {
  userId: string;
  onSelectBook: (book: any) => void;
}

export function LibraryManager({ userId, onSelectBook }: LibraryManagerProps) {
  const [books, setBooks] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", content: "", category: "Genel" });
  const [isOpen, setIsOpen] = useState(false);

  // Kitapları Çek (Hem senin hem demo kitapları)
  useEffect(() => {
    fetchBooks();
  }, [userId]);

  const fetchBooks = async () => {
    // Demo içerikleri ('demo_content') VE kullanıcının kendi kitaplarını getir
    const { data, error } = await supabase
      .from("user_library")
      .select("*")
      .or(`user_id.eq.${userId},user_id.eq.demo_content`)
      .order("created_at", { ascending: false });
    
    if (error) console.error("Çekme hatası:", error);
    if (data) setBooks(data);
  };

  const handleAddBook = async () => {
    // 1. Doğrulama
    if (!newBook.title.trim() || !newBook.content.trim()) {
      alert("Lütfen başlık ve metin alanlarını doldurun.");
      return;
    }

    setIsUploading(true);

    try {
      // 2. Veritabanına Ekle
      const { data, error } = await supabase.from("user_library").insert([{
        user_id: userId,
        title: newBook.title,
        content: newBook.content,
        category: newBook.category,
        words_count: newBook.content.trim().split(/\s+/).length
      }]).select(); // .select() eklenen veriyi geri döndürür, onay için şarttır

      if (error) throw error;

      // 3. Başarılıysa Temizle ve Listeyi Yenile
      console.log("Kitap eklendi:", data);
      setNewBook({ title: "", content: "", category: "Genel" });
      setIsOpen(false);
      fetchBooks(); // Listeyi anında güncelle

    } catch (error: any) {
      console.error("Ekleme Hatası:", error);
      alert(`Kitap eklenemedi! Hata: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, e: any) => {
    e.stopPropagation();
    if(!confirm("Bu kitabı silmek istediğine emin misin?")) return;
    
    const { error } = await supabase.from("user_library").delete().eq("id", id);
    if (error) alert("Silinemedi: " + error.message);
    else fetchBooks();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kütüphanem</h2>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Yeni Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Yeni Metin Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input 
                placeholder="Başlık (Örn: Günlük Okumam)" 
                className="bg-zinc-900 border-zinc-700"
                value={newBook.title}
                onChange={(e) => setNewBook({...newBook, title: e.target.value})}
              />
              <Textarea 
                placeholder="Metni buraya yapıştır..." 
                className="bg-zinc-900 border-zinc-700 h-40 resize-none"
                value={newBook.content}
                onChange={(e) => setNewBook({...newBook, content: e.target.value})}
              />
              <div className="flex gap-2">
                {['Genel', 'Akademik', 'Hikaye'].map(cat => (
                  <div 
                    key={cat}
                    onClick={() => setNewBook({...newBook, category: cat})}
                    className={`px-3 py-1 rounded-full text-xs cursor-pointer border transition ${newBook.category === cat ? 'bg-purple-500 border-purple-500 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                  >
                    {cat}
                  </div>
                ))}
              </div>
              <Button onClick={handleAddBook} disabled={isUploading} className="w-full bg-white text-black hover:bg-zinc-200 font-bold">
                {isUploading ? "Kaydediliyor..." : "Kütüphaneye Ekle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div 
            key={book.id} 
            onClick={() => onSelectBook(book)}
            className="group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-purple-500/50 hover:bg-zinc-900 transition cursor-pointer flex flex-col justify-between h-[180px]"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${book.category === 'Akademik' ? 'bg-blue-500/10 text-blue-400' : book.category === 'Hikaye' ? 'bg-green-500/10 text-green-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                {/* Demo içerik silinemez, sadece kullanıcınınkiler silinir */}
                {book.user_id !== 'demo_content' && (
                  <button 
                    onClick={(e) => handleDelete(book.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-400 rounded-full transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1 line-clamp-2 text-white">{book.title}</h3>
            </div>
            
            <div className="flex justify-between items-center text-xs font-medium text-zinc-500 mt-4 border-t border-zinc-800/50 pt-3">
              <span className="bg-zinc-800/50 px-2 py-1 rounded">{book.category}</span>
              <span>{book.words_count} Kelime</span>
            </div>
          </div>
        ))}
        
        {books.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <AlertCircle className="w-10 h-10 mb-4 opacity-50"/>
            <p>Kütüphanen boş. Yeni bir metin ekle!</p>
          </div>
        )}
      </div>
    </div>
  );
}
