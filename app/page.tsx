import ChessBoard from "@/components/chess-board"
import { Crown } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center gap-8">
          <header className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <Crown className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold text-balance">Ajedrez Clásico</h1>
              <Crown className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Disfruta de una partida de ajedrez con movimientos válidos y una interfaz elegante
            </p>
          </header>

          <ChessBoard />

          <footer className="text-center text-sm text-muted-foreground mt-8">
            <p>Haz clic en una pieza para seleccionarla y luego en una casilla válida para moverla</p>
          </footer>
        </div>
      </div>
    </main>
  )
}
