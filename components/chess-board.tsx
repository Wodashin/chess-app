"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { RotateCcw } from "lucide-react"

type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king"
type PieceColor = "white" | "black"

interface Piece {
  type: PieceType
  color: PieceColor
}

type Board = (Piece | null)[][]

interface ChessBoardProps {
  vsAI?: boolean
}

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

const pieceNames: Record<PieceType, string> = {
  pawn: "peón",
  rook: "torre",
  knight: "caballo",
  bishop: "alfil",
  queen: "dama",
  king: "rey",
}

const toNotation = (row: number, col: number) => `${String.fromCharCode(97 + col)}${8 - row}`

const createInitialBoard = (): Board => [
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
  Array.from({ length: 8 }, () => ({ type: "pawn", color: "black" })),
  Array.from({ length: 8 }, () => null),
  Array.from({ length: 8 }, () => null),
  Array.from({ length: 8 }, () => null),
  Array.from({ length: 8 }, () => null),
  Array.from({ length: 8 }, () => ({ type: "pawn", color: "white" })),
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

export default function ChessBoard({ vsAI = false }: ChessBoardProps) {
  const [board, setBoard] = useState<Board>(() => createInitialBoard())
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white")
  const [validMoves, setValidMoves] = useState<[number, number][]>([])
  const [statusMessage, setStatusMessage] = useState<string>(
    vsAI
      ? "Juegas con blancas. Haz tu primer movimiento para que la IA responda."
      : "Haz clic en una pieza para seleccionarla y luego en una casilla válida para moverla.",
  )
  const [isAITurn, setIsAITurn] = useState(false)

  useEffect(() => {
    if (!vsAI) {
      setIsAITurn(false)
      return
    }

    if (currentPlayer === "black") {
      setIsAITurn(true)
      const timeout = setTimeout(() => {
        makeAIMove()
      }, 600)

      return () => clearTimeout(timeout)
    }

    setIsAITurn(false)
  }, [vsAI, currentPlayer, board])

  const isValidMove = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    piece: Piece,
  ): boolean => {
    const targetPiece = board[toRow][toCol]

    if (targetPiece && targetPiece.color === piece.color) {
      return false
    }

    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)

    switch (piece.type) {
      case "pawn": {
        const direction = piece.color === "white" ? -1 : 1
        const startRow = piece.color === "white" ? 6 : 1

        if (fromCol === toCol && !targetPiece) {
          if (toRow === fromRow + direction) return true
          if (fromRow === startRow && toRow === fromRow + 2 * direction && !board[fromRow + direction][fromCol]) {
            return true
          }
        }

        if (colDiff === 1 && toRow === fromRow + direction && targetPiece) {
          return true
        }
        return false
      }

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
    if (vsAI && isAITurn) {
      return
    }

    const piece = board[row][col]

    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare
      const selectedPiece = board[selectedRow][selectedCol]

      if (validMoves.some(([r, c]) => r === row && c === col) && selectedPiece) {
        const newBoard = board.map((r) => [...r])
        newBoard[row][col] = selectedPiece
        newBoard[selectedRow][selectedCol] = null

        const nextPlayer: PieceColor = currentPlayer === "white" ? "black" : "white"

        setBoard(newBoard)
        setSelectedSquare(null)
        setValidMoves([])
        setCurrentPlayer(nextPlayer)
        setStatusMessage(
          vsAI && nextPlayer === "black"
            ? "Buen movimiento. La IA está pensando su respuesta..."
            : `Turno de las ${nextPlayer === "white" ? "blancas" : "negras"}.`,
        )
      } else if (piece && piece.color === currentPlayer) {
        setSelectedSquare([row, col])
        const moves = getValidMoves(row, col)
        setValidMoves(moves)
        setStatusMessage(
          moves.length > 0
            ? "Movimientos disponibles resaltados en verde."
            : "Esta pieza no tiene movimientos válidos, prueba con otra.",
        )
      } else {
        setSelectedSquare(null)
        setValidMoves([])
        setStatusMessage("Selecciona una pieza de tu color para continuar.")
      }
    } else if (piece && piece.color === currentPlayer) {
      setSelectedSquare([row, col])
      const moves = getValidMoves(row, col)
      setValidMoves(moves)
      setStatusMessage(
        moves.length > 0
          ? "Movimientos disponibles resaltados en verde."
          : "Esta pieza no tiene movimientos válidos, prueba con otra.",
      )
    } else {
      setStatusMessage("Espera tu turno y selecciona una pieza de tu color.")
    }
  }

  const makeAIMove = () => {
    const possibleMoves: { fromRow: number; fromCol: number; toRow: number; toCol: number }[] = []

    board.forEach((row, fromRow) => {
      row.forEach((piece, fromCol) => {
        if (piece?.color === "black") {
          const moves = getValidMoves(fromRow, fromCol)
          moves.forEach(([toRow, toCol]) => {
            possibleMoves.push({ fromRow, fromCol, toRow, toCol })
          })
        }
      })
    })

    if (possibleMoves.length === 0) {
      setStatusMessage("La IA no tiene movimientos disponibles. Reinicia la partida para empezar de nuevo.")
      setCurrentPlayer("white")
      setIsAITurn(false)
      return
    }

    const captures = possibleMoves.filter(({ toRow, toCol }) => board[toRow][toCol])
    const candidateMoves = captures.length > 0 ? captures : possibleMoves
    const chosenMove = candidateMoves[Math.floor(Math.random() * candidateMoves.length)]
    const movingPiece = board[chosenMove.fromRow]?.[chosenMove.fromCol]

    if (!movingPiece) {
      setCurrentPlayer("white")
      setIsAITurn(false)
      return
    }

    setBoard((prevBoard) => {
      const updatedBoard = prevBoard.map((r) => [...r])
      updatedBoard[chosenMove.toRow][chosenMove.toCol] = movingPiece
      updatedBoard[chosenMove.fromRow][chosenMove.fromCol] = null
      return updatedBoard
    })
    setSelectedSquare(null)
    setValidMoves([])
    setCurrentPlayer("white")
    setIsAITurn(false)

    const destinationNotation = toNotation(chosenMove.toRow, chosenMove.toCol)
    const pieceLabel = pieceNames[movingPiece.type]
    setStatusMessage(`La IA movió su ${pieceLabel} a ${destinationNotation}. Tu turno.`)
  }

  const resetGame = () => {
    setBoard(createInitialBoard())
    setSelectedSquare(null)
    setValidMoves([])
    setCurrentPlayer("white")
    setIsAITurn(false)
    setStatusMessage(
      vsAI
        ? "Juegas con blancas. Haz tu primer movimiento para que la IA responda."
        : "Haz clic en una pieza para seleccionarla y luego en una casilla válida para moverla.",
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <Card className="w-full space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              {vsAI ? "Modo contra inteligencia artificial" : "Modo libre"}
            </p>
            <div className="text-lg font-semibold">
              Turno: <span className="text-primary capitalize">{currentPlayer === "white" ? "Blancas" : "Negras"}</span>
            </div>
          </div>
          <Button onClick={resetGame} variant="outline" size="sm" className="self-start md:self-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar partida
          </Button>
        </div>

        <div className="grid grid-cols-8 overflow-hidden rounded-lg border-2 border-border shadow-lg">
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
                    flex aspect-square items-center justify-center text-4xl md:text-5xl lg:text-6xl
                    transition-all duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
                    ${isLight ? "bg-accent" : "bg-primary/20"}
                    ${isSelected ? "ring-4 ring-primary ring-inset" : ""}
                    ${isValidMoveSquare ? "ring-4 ring-green-500/60 ring-inset" : ""}
                  `}
                >
                  {piece && (
                    <span className={piece.color === "white" ? "text-foreground" : "text-foreground/90"}>
                      {pieceSymbols[piece.color][piece.type]}
                    </span>
                  )}
                  {isValidMoveSquare && !piece && (
                    <div className="h-3 w-3 rounded-full bg-green-500/60 md:h-4 md:w-4" />
                  )}
                </button>
              )
            }),
          )}
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">{statusMessage}</p>
          {vsAI && isAITurn && (
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <Spinner className="h-4 w-4" />
              <span>La IA está calculando su jugada...</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
