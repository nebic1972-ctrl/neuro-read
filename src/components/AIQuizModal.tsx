"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, BrainCircuit, ArrowRight } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  answer: number;
}

interface AIQuizModalProps {
  questions: Question[];
  onComplete: (score: number) => void;
}

export function AIQuizModal({ questions, onComplete }: AIQuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.answer) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz bitti, skoru hesapla (Örn: 100 üzerinden)
      const finalScore = Math.round((correctCount / questions.length) * 100);
      onComplete(finalScore);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 p-8 relative overflow-hidden">
        
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>

        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-2 text-purple-400 font-bold">
              <BrainCircuit className="w-6 h-6" /> 
              <span>Yapay Zeka Analizi</span>
           </div>
           <div className="text-zinc-500 text-sm font-mono">
              Soru {currentIndex + 1} / {questions.length}
           </div>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
           {currentQuestion.question}
        </h3>

        <div className="space-y-3 mb-8">
           {currentQuestion.options.map((option, index) => {
              let btnClass = "justify-start text-left h-auto py-4 px-6 text-lg border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all";
              
              if (isAnswered) {
                 if (index === currentQuestion.answer) {
                    btnClass = "justify-start text-left h-auto py-4 px-6 text-lg bg-green-900/50 border-green-500 text-green-400"; // Doğru şık
                 } else if (index === selectedOption) {
                    btnClass = "justify-start text-left h-auto py-4 px-6 text-lg bg-red-900/50 border-red-500 text-red-400"; // Yanlış seçim
                 } else {
                    btnClass += " opacity-50"; // Diğer şıklar
                 }
              }

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full ${btnClass}`}
                  onClick={() => handleOptionClick(index)}
                  disabled={isAnswered}
                >
                  <div className="flex items-center gap-3 w-full">
                     <span className="w-6 h-6 flex items-center justify-center rounded-full border border-current text-xs opacity-50">
                        {String.fromCharCode(65 + index)}
                     </span>
                     <span>{option}</span>
                     {isAnswered && index === currentQuestion.answer && <CheckCircle2 className="ml-auto w-5 h-5 text-green-500"/>}
                     {isAnswered && index === selectedOption && index !== currentQuestion.answer && <XCircle className="ml-auto w-5 h-5 text-red-500"/>}
                  </div>
                </Button>
              );
           })}
        </div>

        {isAnswered && (
           <div className="flex justify-end animate-in slide-in-from-bottom-2">
              <Button onClick={handleNext} size="lg" className="bg-white text-black hover:bg-zinc-200 font-bold">
                 {currentIndex < questions.length - 1 ? "Sonraki Soru" : "Sonucu Gör"} <ArrowRight className="w-4 h-4 ml-2"/>
              </Button>
           </div>
        )}

      </Card>
    </div>
  );
}
