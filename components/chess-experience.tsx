"use client"

import { useMemo, useState } from "react"
import ChessBoard from "@/components/chess-board"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Brain, BookOpenCheck, Bot, GraduationCap, Users } from "lucide-react"

const tutorialSections = [
  {
    id: "movimientos-basicos",
    title: "Movimientos básicos de cada pieza",
    content: (
      <ul className="list-disc pl-5 space-y-1 text-left">
        <li>
          <span className="font-semibold">Peón:</span> avanza una casilla (dos desde su posición inicial) y captura en
          diagonal.
        </li>
        <li>
          <span className="font-semibold">Torre:</span> se mueve cualquier número de casillas en fila o columna.
        </li>
        <li>
          <span className="font-semibold">Alfil:</span> avanza en diagonal tantas casillas como quiera.
        </li>
        <li>
          <span className="font-semibold">Caballo:</span> mueve en “L”: dos casillas en una dirección y una perpendicular.
        </li>
        <li>
          <span className="font-semibold">Dama:</span> combina los movimientos de torre y alfil.
        </li>
        <li>
          <span className="font-semibold">Rey:</span> se desplaza una casilla en cualquier dirección; protégelo siempre.
        </li>
      </ul>
    ),
  },
  {
    id: "reglas-especiales",
    title: "Reglas especiales que debes conocer",
    content: (
      <div className="space-y-3 text-left">
        <p>
          <span className="font-semibold">Promoción:</span> cuando un peón llega al otro extremo del tablero puede
          transformarse en dama, torre, alfil o caballo. La promoción a dama es la opción más poderosa.
        </p>
        <p>
          <span className="font-semibold">Enroque:</span> movimiento defensivo que involucra al rey y una torre. Asegúrate de
          que ninguna de las dos piezas se haya movido, que no haya piezas entre ellas y que el rey no esté en jaque ni
          atraviese casillas atacadas.
        </p>
        <p>
          <span className="font-semibold">Captura al paso:</span> si un peón rival avanza dos casillas desde su posición
          inicial y queda a tu lado, puedes capturarlo como si solo hubiese avanzado una casilla, pero debes hacerlo en el
          movimiento inmediatamente siguiente.
        </p>
      </div>
    ),
  },
  {
    id: "plan-de-juego",
    title: "Cómo planificar tus jugadas",
    content: (
      <div className="space-y-3 text-left">
        <p>
          <span className="font-semibold">Control del centro:</span> ocupa o controla las casillas centrales (d4, d5, e4, e5)
          para dar libertad a tus piezas.
        </p>
        <p>
          <span className="font-semibold">Desarrollo rápido:</span> moviliza tus caballos y alfiles antes de mover la dama o las
          torres.
        </p>
        <p>
          <span className="font-semibold">Seguridad del rey:</span> enrócate pronto y mantén un escudo de peones frente a tu
          rey.
        </p>
      </div>
    ),
  },
]

export function ChessExperience() {
  const [showTutorial, setShowTutorial] = useState(false)
  const [vsAI, setVsAI] = useState(true)
  const [boardKey, setBoardKey] = useState(0)

  const activeModeBadge = useMemo(
    () => (
      <Badge variant="outline" className="text-xs uppercase tracking-wide">
        {vsAI ? "Modo contra IA" : "Modo libre"}
      </Badge>
    ),
    [vsAI],
  )

  const handleModeChange = (playAgainstAI: boolean) => {
    setVsAI(playAgainstAI)
    setBoardKey((prev) => prev + 1)
  }

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
          <Button
            onClick={() => handleModeChange(true)}
            variant={vsAI ? "default" : "outline"}
            size="lg"
            className="gap-2"
          >
            <Bot className="h-5 w-5" />
            Jugar contra IA
          </Button>
          <Button
            onClick={() => handleModeChange(false)}
            variant={!vsAI ? "default" : "outline"}
            size="lg"
            className="gap-2"
          >
            <Users className="h-5 w-5" />
            Juego libre
          </Button>
          <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="lg" className="gap-2">
                <BookOpenCheck className="h-5 w-5" />
                Ver tutorial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="space-y-1">
                <DialogTitle>Guía rápida para dominar el tablero</DialogTitle>
                <DialogDescription>
                  Repasa las reglas imprescindibles antes de volver a la partida o consúltalas mientras juegas.
                </DialogDescription>
              </DialogHeader>
              <Accordion type="single" collapsible className="text-left">
                {tutorialSections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="text-base font-semibold">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed">
                      {section.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex justify-center">{activeModeBadge}</div>
      </section>

      <section className="flex justify-center">
        <ChessBoard key={`${boardKey}-${vsAI}`} vsAI={vsAI} />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="rounded-xl border bg-card p-6 text-left shadow-sm transition hover:shadow-md">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Bot className="h-5 w-5 text-primary" />
            Practica con la IA
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            La inteligencia artificial realiza movimientos válidos automáticamente para que practiques tácticas básicas,
            aprendas a anticiparte y ganes confianza.
          </p>
        </article>
        <article className="rounded-xl border bg-card p-6 text-left shadow-sm transition hover:shadow-md">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BookOpenCheck className="h-5 w-5 text-primary" />
            Reglas claras
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Consulta la guía en cualquier momento para recordar cómo se mueven las piezas, cuándo enrocar o de qué forma
            aprovechar la promoción de peones.
          </p>
        </article>
        <article className="rounded-xl border bg-card p-6 text-left shadow-sm transition hover:shadow-md">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <GraduationCap className="h-5 w-5 text-primary" />
            Avanza paso a paso
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Experimenta, reinicia la partida cuando lo necesites y combina teoría con práctica para construir hábitos de
            juego sólidos desde el primer día.
          </p>
        </article>
      </section>
    </div>
  )
}

export default ChessExperience
