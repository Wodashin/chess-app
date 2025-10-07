"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king"
type PieceColor = "white" | "black"

interface Piece {
  type: PieceType
  color: PieceColor
}

type Board = (Piece | null)[][]

const pieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
}

const initialBoard: Board = [
  [
    { type: "rook", color: "black" },
    { type: "knight", color: "black" },
    { type: "bishop", color: "black" },
    { type: "queen", color: "black" },
    { type: "king", color: "black" },
    { type: "bishop", color: "black" },
    { type: "knight", color: "black" },
    { type: "rook", color: "black" },
  ],
  Array(8).fill({ type: "pawn", color: "black" }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: "pawn", color: "white" }),
  [
    { type: "rook", color: "white" },
    { type: "knight", color: "white" },
    { type: "bishop", color: "white" },
    { type: "queen", color: "white" },
    { type: "king", color: "white" },
    { type: "bishop", color: "white" },
    { type: "knight", color: "white" },
    { type: "rook", color: "white" },
  ],
]

export default function ChessBoard() {
  const [board, setBoard] = useState<Board>(initialBoard)
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white")
  const [validMoves, setValidMoves] = useState<[number, number][]>([])

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number, piece: Piece): boolean => {
    const targetPiece = board[toRow][toCol]

    // No se puede capturar una pieza del mismo color
    if (targetPiece && targetPiece.color === piece.color) {
      return false
    }

    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)

    switch (piece.type) {
      case "pawn":
        const direction = piece.color === "white" ? -1 : 1
        const startRow = piece.color === "white" ? 6 : 1

        // Movimiento hacia adelante
        if (fromCol === toCol && !targetPiece) {
          if (toRow === fromRow + direction) return true
          if (fromRow === startRow && toRow === fromRow + 2 * direction && !board[fromRow + direction][fromCol]) {
            return true
          }
        }

        // Captura diagonal
        if (colDiff === 1 && toRow === fromRow + direction && targetPiece) {
          return true
        }
        return false

      case "rook":
        if (fromRow === toRow || fromCol === toCol) {
          return isPathClear(fromRow, fromCol, toRow, toCol)
        }
        return false

      case "knight":
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)

      case "bishop":
        if (rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol)
        }
        return false

      case "queen":
        if (fromRow === toRow || fromCol === toCol || rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol)
        }
        return false

      case "king":
        return rowDiff <= 1 && colDiff <= 1

      default:
        return false
    }
  }

  const isPathClear = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0

    let currentRow = fromRow + rowStep
    let currentCol = fromCol + colStep

    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== null) {
        return false
      }
      currentRow += rowStep
      currentCol += colStep
    }

    return true
  }

  const getValidMoves = (row: number, col: number): [number, number][] => {
    const piece = board[row][col]
    if (!piece) return []

    const moves: [number, number][] = []
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidMove(row, col, r, c, piece)) {
          moves.push([r, c])
        }
      }
    }
    return moves
  }

  const handleSquareClick = (row: number, col: number) => {
    const piece = board[row][col]

    // Si hay una casilla seleccionada
    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare
      const selectedPiece = board[selectedRow][selectedCol]

      // Si se hace clic en un movimiento válido
      if (validMoves.some(([r, c]) => r === row && c === col)) {
        const newBoard = board.map((r) => [...r])
        newBoard[row][col] = selectedPiece
        newBoard[selectedRow][selectedCol] = null
        setBoard(newBoard)
        setSelectedSquare(null)
        setValidMoves([])
        setCurrentPlayer(currentPlayer === "white" ? "black" : "white")
      } else if (piece && piece.color === currentPlayer) {
        // Seleccionar otra pieza del mismo jugador
        setSelectedSquare([row, col])
        setValidMoves(getValidMoves(row, col))
      } else {
        // Deseleccionar
        setSelectedSquare(null)
        setValidMoves([])
      }
    } else if (piece && piece.color === currentPlayer) {
      // Seleccionar una pieza
      setSelectedSquare([row, col])
      setValidMoves(getValidMoves(row, col))
    }
  }

  const resetGame = () => {
    setBoard(initialBoard)
    setSelectedSquare(null)
    setValidMoves([])
    setCurrentPlayer("white")
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <Card className="p-4 md:p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">
            Turno: <span className="text-primary capitalize">{currentPlayer === "white" ? "Blancas" : "Negras"}</span>
          </div>
          <Button onClick={resetGame} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
        </div>

        <div className="aspect-square w-full grid grid-cols-8 gap-0 border-2 border-border rounded-lg overflow-hidden shadow-lg">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0
              const isSelected = selectedSquare?.[0] === rowIndex && selectedSquare?.[1] === colIndex
              const isValidMoveSquare = validMoves.some(([r, c]) => r === rowIndex && c === colIndex)

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  className={`
                    aspect-square flex items-center justify-center text-4xl md:text-5xl lg:text-6xl
                    transition-all duration-200 hover:brightness-95 active:scale-95
                    ${isLight ? "bg-accent" : "bg-primary/20"}
                    ${isSelected ? "ring-4 ring-primary ring-inset" : ""}
                    ${isValidMoveSquare ? "ring-4 ring-green-500/50 ring-inset" : ""}
                  `}
                >
                  {piece && (
                    <span className={piece.color === "white" ? "text-foreground" : "text-foreground/90"}>
                      {pieceSymbols[piece.color][piece.type]}
                    </span>
                  )}
                  {isValidMoveSquare && !piece && (
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500/60" />
                  )}
                </button>
              )
            }),
          )}
        </div>
      </Card>
    </div>
  )
}
