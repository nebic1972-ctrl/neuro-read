"use client";

import { useState, useRef } from "react";
import { BookOpen, Plus, Play } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useNeuroStore } from "@/store/useNeuroStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ReaderModal from "@/components/rsvp/ReaderModal";
import { cn } from "@/lib/utils";
import type { Library } from "@/types";
import { createClient } from "@/lib/supabase/client";

type LibraryGridProps = {
  onAddContent?: () => void;
  onBookClick?: (item: Library) => void;
};

export default function LibraryGrid({ onAddContent, onBookClick }: LibraryGridProps) {
  const { user } = useUser();
  const library = useNeuroStore((s) => s.library);
  const fetchUserData = useNeuroStore((s) => s.fetchUserData);
  const [selectedBook, setSelectedBook] = useState<Library | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBookClick = (item: Library) => {
    if (onBookClick) {
      onBookClick(item);
    } else {
      setSelectedBook(item);
    }
  };

  const handleCloseReader = () => {
    setSelectedBook(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("File selected:", file.name);
    alert("Yükleme Başladı...");

    if (!user?.id) {
      alert("Hata: Kullanıcı bilgisi bulunamadı.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          alert("Hata: Dosya okunamadı.");
          return;
        }

        // Ensure user_id is a string
        const userId = String(user.id);
        const fileName = file.name;

        console.log("File selected:", file.name);
        console.log("Inserting to Supabase:", {
          user_id: userId,
          title: fileName,
          file_type: "txt",
        });

        const supabase = createClient();
        const { error } = await supabase.from("library").insert({
          user_id: userId,
          title: fileName,
          content_text: text,
          file_type: "txt",
        });

        if (error) {
          console.error("Supabase insert error:", error);
          alert("Hata: " + error.message);
        } else {
          console.log("File uploaded successfully!");
          alert("Başarılı!");
          // Refresh library list
          await fetchUserData(userId);
        }
      } catch (err) {
        console.error("File upload error:", err);
        const errorMessage = err instanceof Error ? err.message : "Bilinmeyen hata";
        alert("Hata: " + errorMessage);
      }
    };

    reader.onerror = () => {
      alert("Hata: Dosya okunamadı.");
    };

    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddContent = () => {
    if (onAddContent) {
      onAddContent();
    } else {
      // CRITICAL: Trigger file input click
      console.log("Button clicked, triggering file input...");
      fileInputRef.current?.click();
    }
  };

  return (
    <Card className={cn("overflow-hidden border-white/10 bg-zinc-900/80")}>
      {/* Hidden file input at the top */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        accept=".txt,.md"
        className="hidden"
      />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <h2 className="text-lg font-semibold">Kütüphane</h2>
          <p className="text-xs text-zinc-500">İçerikleriniz</p>
        </div>
        <Button
          onClick={handleAddContent}
          size="lg"
          className="gap-2 bg-amber-600 font-semibold hover:bg-amber-500"
        >
          <Plus className="h-4 w-4" />
          Yeni İçerik Ekle
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {library.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group relative flex flex-col gap-3 rounded-xl border border-white/5 bg-zinc-800/50 p-4",
                "transition hover:border-amber-500/40 hover:bg-zinc-800"
              )}
            >
              <button
                type="button"
                onClick={() => handleBookClick(item)}
                className="flex items-start gap-3 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-100">{item.title || "İsimsiz"}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                    {(item.content_text || "").slice(0, 80)}
                    {(item.content_text?.length ?? 0) > 80 ? "…" : ""}
                  </p>
                </div>
              </button>
              <Button
                onClick={() => handleBookClick(item)}
                size="sm"
                className="w-full gap-2 bg-amber-600 font-semibold hover:bg-amber-500"
              >
                <Play className="h-4 w-4" />
                Okumaya Başla
              </Button>
            </div>
          ))}

          {/* Add New Content card */}
          <button
            type="button"
            onClick={handleAddContent}
            className={cn(
              "flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl",
              "border-2 border-dashed border-zinc-600 text-zinc-500",
              "transition hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-500"
            )}
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">İçerik Ekle</span>
          </button>
        </div>
      </CardContent>

      {/* RSVP Reader Modal */}
      <ReaderModal
        libraryItem={selectedBook}
        isOpen={selectedBook !== null}
        onClose={handleCloseReader}
      />
    </Card>
  );
}
