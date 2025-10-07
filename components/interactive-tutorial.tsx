"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Card } from "./ui/card";

// Importar tipos y el tablero desde chess-board.tsx
import ChessBoard from "./chess-board";
type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
type PieceColor = "white" | "black";
interface Piece { type: PieceType; color: PieceColor; }
type Board = (Piece | null)[][];

interface TutorialStep {
    title: string;
    description: string;
    board: Board;
    highlightedSquares: [number, number][];
}

const tutorialSteps: TutorialStep[] = [
    {
        title: "El Peón",
        description: "El peón avanza una casilla (o dos en su primer movimiento). Captura una casilla en diagonal.",
        board: Array(8).fill(Array(8).fill(null)).map((row, r) =>
            row.map((_, c) => {
                if (r === 6 && c === 4) return { type: "pawn", color: "white" };
                if (r === 5 && c === 3) return { type: "pawn", color: "black" };
                return null;
            })
        ),
        highlightedSquares: [[5, 4], [4, 4], [5, 3]],
    },
    {
        title: "La Torre",
        description: "La torre se mueve cualquier número de casillas en horizontal o vertical.",
        board: Array(8).fill(Array(8).fill(null)).map((row, r) =>
            row.map((_, c) => (r === 3 && c === 3 ? { type: "rook", color: "white" } : null))
        ),
        highlightedSquares: [
            [3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 6], [3, 7],
            [0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3], [7, 3],
        ],
    },
    {
        title: "El Caballo",
        description: "El caballo se mueve en forma de 'L': dos casillas en una dirección y una en perpendicular.",
        board: Array(8).fill(Array(8).fill(null)).map((row, r) =>
            row.map((_, c) => (r === 3 && c === 3 ? { type: "knight", color: "white" } : null))
        ),
        highlightedSquares: [[1, 2], [1, 4], [2, 1], [2, 5], [4, 1], [4, 5], [5, 2], [5, 4]],
    },
    {
        title: "El Alfil",
        description: "El alfil se mueve cualquier número de casillas en diagonal.",
        board: Array(8).fill(Array(8).fill(null)).map((row, r) =>
            row.map((_, c) => (r === 3 && c === 3 ? { type: "bishop", color: "white" } : null))
        ),
        highlightedSquares: [
            [0, 0], [1, 1], [2, 2], [4, 4], [5, 5], [6, 6], [7, 7],
            [0, 6], [1, 5], [2, 4], [4, 2], [5, 1], [6, 0]
        ],
    },
    {
        title: "La Dama",
        description: "La dama combina los movimientos de la torre y el alfil.",
        board: Array(8).fill(Array(8).fill(null)).map((row, r) =>
            row.map((_, c) => (r === 3 && c === 3 ? { type: "queen", color: "white" } : null))
        ),
        highlightedSquares: [
            [3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 6], [3, 7],
            [0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3], [7, 3],
            [0, 0], [1, 1], [2, 2], [4, 4], [5, 5], [6, 6], [7, 7],
            [0, 6], [1, 5], [2, 4], [4, 2], [5, 1], [6, 0]
        ],
    },
    {
        title: "El Rey",
        description: "El rey se mueve una sola casilla en cualquier dirección. ¡Es la pieza más importante!",
        board: Array(8).fill(Array(8).fill(null)).map((row, r) =>
            row.map((_, c) => (r === 3 && c === 3 ? { type: "king", color: "white" } : null))
        ),
        highlightedSquares: [[2, 2], [2, 3], [2, 4], [3, 2], [3, 4], [4, 2], [4, 3], [4, 4]],
    },
];

export function InteractiveTutorial({ onExit }: { onExit: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const step = tutorialSteps[currentStep];

    return (
        <div className="w-full max-w-2xl space-y-4">
            <Card className="p-4 md:p-6 text-center">
                 <h2 className="text-2xl font-bold">{step.title}</h2>
                 <p className="text-muted-foreground">{step.description}</p>
            </Card>
            
            <ChessBoard
                key={`tutorial-${currentStep}`}
                isTutorial={true}
                initialBoard={step.board}
                highlightedSquares={step.highlightedSquares}
            />

            <div className="flex justify-between items-center">
                <Button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0} variant="outline">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
                </Button>
                <span>Paso {currentStep + 1} de {tutorialSteps.length}</span>
                <Button onClick={() => setCurrentStep(s => Math.min(tutorialSteps.length - 1, s + 1))} disabled={currentStep === tutorialSteps.length - 1} variant="outline">
                    Siguiente <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
             <Button onClick={onExit} variant="ghost" className="w-full">
                <X className="h-4 w-4 mr-2" /> Salir del tutorial
            </Button>
        </div>
    );
}

export default InteractiveTutorial;
