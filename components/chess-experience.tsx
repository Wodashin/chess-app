"use client"

import { useMemo, useState } from "react"
import ChessBoard from "@/components/chess-board"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, BookOpenCheck, Bot, GraduationCap, Users } from "lucide-react"
import InteractiveTutorial from "./interactive-tutorial"
import MoveHistoryPanel from "./move-history-panel"

export function ChessExperience() {
  const [vsAI, setVsAI] = useState(true);
  const [boardKey, setBoardKey] = useState(0);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const activeModeBadge = useMemo(
    () => (
      <Badge variant="outline" className="text-xs uppercase tracking-wide">
        {vsAI ? "Modo contra IA" : "Modo libre"}
      </Badge>
    ),
    [vsAI],
  );

  const handleModeChange = (playAgainstAI: boolean) => {
    setVsAI(playAgainstAI);
    setBoardKey((prev) => prev + 1);
    setMoveHistory([]);
  };

  const handleReset = () => {
    setBoardKey((prev) => prev + 1);
    setMoveHistory([]);
  };

  const handleNewMove = (move: string) => {
    setMoveHistory(prev => [...prev, move]);
  };

  return (
    <div className="space-y-10">
      <section className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 text-primary">
          <Brain className="h-9 w-9 md:h-11 md:w-11" />
          <h1 className="text-4xl md:text-6xl font-bold text-balance">Aprende y practica ajedrez</h1>
          <GraduationCap className="h-9 w-9 md:h-11 md:w-11" />
        </div>
        <p className="text-lg md:text-xl text-muted-foreground text-pretty mx-auto max-w-3xl">
          Perfecciona tus jugadas con un tablero interactivo, retos contra una inteligencia artificial sencilla y un
          tutorial paso a paso con las reglas esenciales.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => handleModeChange(true)} variant={vsAI ? "default" : "outline"} size="lg" className="gap-2">
            <Bot className="h-5 w-5" /> Jugar contra IA
          </Button>
          <Button onClick={() => handleModeChange(false)} variant={!vsAI ? "default" : "outline"} size="lg" className="gap-2">
            <Users className="h-5 w-5" /> Juego libre
          </Button>
          <Button onClick={() => setTutorialMode(true)} variant="secondary" size="lg" className="gap-2">
              <BookOpenCheck className="h-5 w-5" /> Ver tutorial
          </Button>
        </div>
        {!tutorialMode && <div className="flex justify-center">{activeModeBadge}</div>}
      </section>

      {/* SECCIÓN MODIFICADA */}
      <section className="flex justify-center">
        {tutorialMode ? (
            <div className="w-full max-w-2xl">
              <InteractiveTutorial onExit={() => setTutorialMode(false)} />
            </div>
        ) : (
          // Hemos añadido un div contenedor con un ancho máximo (max-w-6xl) y centrado (mx-auto)
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,320px)] gap-8 items-start">
            <ChessBoard 
              key={`${boardKey}-${vsAI}`} 
              vsAI={vsAI} 
              onMove={handleNewMove}
              onReset={handleReset}
            />
            {vsAI && (
              <div className="hidden lg:block">
                <MoveHistoryPanel moves={moveHistory} />
              </div>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {/* ... (el resto del código se mantiene igual) ... */}
      </section>
    </div>
  )
}

export default ChessExperience;
