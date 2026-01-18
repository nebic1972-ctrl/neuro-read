"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Search, BookOpen, Filter, ArrowLeft, 
  BrainCircuit, GraduationCap, Feather, Zap 
} from "lucide-react";

export default function LibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase
        .from("library")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (data) setBooks(data);
      setLoading(false);
    };
    fetchBooks();
  }, []);

  // --- FİLTRELEME MANTIĞI ---
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre ? book.genre === selectedGenre : true;
    return matchesSearch && matchesGenre;
  });

  const getGenreIcon = (genre: string) => {
    switch (genre) {
      case 'Akademik': return <GraduationCap className="w-4 h-4" />;
      case 'Hikaye': return <Feather className="w-4 h-4" />;
      case 'Kurgu Dışı': return <BrainCircuit className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (level: number) => {
    if (level >= 5) return "bg-red-500";
    if (level >= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      
      {/* --- HEADER --- */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 -ml-4">
              <ArrowLeft className="w-5 h-5 mr-2" /> Kokpite Dön
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
              Nöro-Kütüphane
            </h1>
            <p className="text-zinc-400">Beyin antrenmanınız için kategorize edilmiş içerikler.</p>
          </div>

          <div className="flex gap-4">
             <div className="text-right">
                <div className="text-2xl font-bold text-white">{books.length}</div>
                <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Toplam Metin</div>
             </div>
          </div>
        </div>
      </div>

      {/* --- KONTROLLER (Arama & Filtre) --- */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row gap-4">
         {/* Manuel Input (Bileşensiz) */}
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Kitap adı veya içerik ara..." 
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         
         <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['Tümü', 'Hikaye', 'Kurgu Dışı', 'Akademik'].map((genre) => (
               <Button
                 key={genre}
                 variant={selectedGenre === (genre === 'Tümü' ? null : genre) ? "default" : "outline"}
                 className={`border-zinc-800 ${selectedGenre === (genre === 'Tümü' ? null : genre) ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                 onClick={() => setSelectedGenre(genre === 'Tümü' ? null : genre)}
               >
                 {genre}
               </Button>
            ))}
         </div>
      </div>

      {/* --- KİTAP GRİDİ --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <p className="text-zinc-500 animate-pulse">Kütüphane taranıyor...</p>
        ) : filteredBooks.length === 0 ? (
           <div className="col-span-full text-center py-20 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
              <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">Aradığınız kriterlere uygun içerik bulunamadı.</p>
           </div>
        ) : (
           filteredBooks.map((book) => (
             <Card key={book.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all duration-300 group flex flex-col h-full overflow-hidden">
                
                {/* Zorluk Barı */}
                <div className="h-1 w-full bg-zinc-950 flex">
                   <div className={`h-full ${getDifficultyColor(book.difficulty_level || 1)}`} style={{ width: `${((book.difficulty_level || 1) / 5) * 100}%` }}></div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                   {/* Başlık ve Tür (Badge yerine Span kullanıldı) */}
                   <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border border-zinc-700 text-zinc-400">
                         {getGenreIcon(book.genre)} {book.genre || 'Genel'}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-950 px-2 py-1 rounded">
                         <Zap className="w-3 h-3" /> Yük: {book.cognitive_load_score || '?'}
                      </div>
                   </div>

                   <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {book.title || "İsimsiz Metin"}
                   </h3>
                   <p className="text-sm text-zinc-500 line-clamp-3 mb-6 flex-1 font-serif">
                      {book.content}
                   </p>

                   {/* Aksiyon */}
                   <Link href={`/?id=${book.id}`} className="w-full">
                      <Button className="w-full bg-zinc-800 hover:bg-white hover:text-black transition-all font-bold group-hover:bg-zinc-700 group-hover:text-white">
                         Okumaya Başla <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                   </Link>
                </div>
             </Card>
           ))
        )}
      </div>

    </div>
  );
}