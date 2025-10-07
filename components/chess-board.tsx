"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king"
type PieceColor = "white" | "black"

interface Piece {
  type: PieceType
  color: PieceColor
}

type Board = (Piece | null)[][]

interface ChessBoardProps {
  vsAI?: boolean;
  initialBoard?: Board;
  highlightedSquares?: [number, number][];
  isTutorial?: boolean;
  onMove?: (moveNotation: string) => void;
  onReset?: () => void;
}

const pieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
}

const pieceNames: Record<PieceType, string> = {
  pawn: "Peón", rook: "Torre", knight: "Caballo", bishop: "Alfil", queen: "Dama", king: "Rey",
}

const pieceValues: Record<PieceType, number> = {
  pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 1000,
};

const toNotation = (row: number, col: number) => `${String.fromCharCode(97 + col)}${8 - row}`

const createInitialBoard = (): Board => [
  [{ type: "rook", color: "black" }, { type: "knight", color: "black" }, { type: "bishop", color: "black" }, { type: "queen", color: "black" }, { type: "king", color: "black" }, { type: "bishop", color: "black" }, { type: "knight", color: "black" }, { type: "rook", color: "black" }],
  Array(8).fill({ type: "pawn", color: "black" }),
  Array(8).fill(null), Array(8).fill(null), Array(8).fill(null), Array(8).fill(null),
  Array(8).fill({ type: "pawn", color: "white" }),
  [{ type: "rook", color: "white" }, { type: "knight", color: "white" }, { type: "bishop", color: "white" }, { type: "queen", color: "white" }, { type: "king", color: "white" }, { type: "bishop", color: "white" }, { type: "knight", color: "white" }, { type: "rook", color: "white" }],
]

export default function ChessBoard({ 
  vsAI = false, 
  initialBoard, 
  highlightedSquares = [], 
  isTutorial = false,
  onMove = () => {},
  onReset = () => {}
}: ChessBoardProps) {
  const [board, setBoard] = useState<Board>(() => initialBoard || createInitialBoard())
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white")
  const [validMoves, setValidMoves] = useState<[number, number][]>([])
  const [statusMessage, setStatusMessage] = useState<string>(
    vsAI ? "Juegas con blancas. Haz tu primer movimiento." : "Selecciona una pieza para moverla."
  )
  const [isAITurn, setIsAITurn] = useState(false)
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<PieceColor | null>(null);

  useEffect(() => {
    if (gameOver || !vsAI || currentPlayer !== "black") {
      setIsAITurn(false);
      return;
    }
    setIsAITurn(true);
    const timeout = setTimeout(() => makeAIMove(), 800);
    return () => clearTimeout(timeout);
  }, [vsAI, currentPlayer, board, gameOver]);

  // ... (Las funciones findKing, isSquareAttacked, isKingInCheck, etc. se mantienen igual)
  const findKing = (color: PieceColor, currentBoard: Board): [number, number] | null => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.type === "king" && piece.color === color) {
          return [r, c];
        }
      }
    }
    return null;
  };

  const isSquareAttacked = (row: number, col: number, attackerColor: PieceColor, currentBoard: Board): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.color === attackerColor) {
          if (isValidMove(r, c, row, col, piece, currentBoard)) {
            return true;
          }
        }
      }
    }
    return false;
  };
  
  const isKingInCheck = (kingColor: PieceColor, currentBoard: Board): boolean => {
    const kingPos = findKing(kingColor, currentBoard);
    if (!kingPos) return false;
    const opponentColor = kingColor === "white" ? "black" : "white";
    return isSquareAttacked(kingPos[0], kingPos[1], opponentColor, currentBoard);
  };
  
  const getAllLegalMovesForColor = (color: PieceColor, currentBoard: Board): any[] => {
    const allMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.color === color) {
          const moves = getValidMoves(r, c);
          for (const move of moves) {
            const [toRow, toCol] = move;
            const tempBoard = currentBoard.map(row => [...row]);
            tempBoard[toRow][toCol] = piece;
            tempBoard[r][c] = null;
            if (!isKingInCheck(color, tempBoard)) {
              allMoves.push({ from: [r, c], to: move });
            }
          }
        }
      }
    }
    return allMoves;
  };
  
  const isCheckmate = (kingColor: PieceColor, currentBoard: Board): boolean => {
    if (!isKingInCheck(kingColor, currentBoard)) return false;
    const legalMoves = getAllLegalMovesForColor(kingColor, currentBoard);
    return legalMoves.length === 0;
  };

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number, piece: Piece, currentBoard: Board): boolean => {
    const targetPiece = currentBoard[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) return false;
    
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    switch (piece.type) {
      case "pawn":
        const direction = piece.color === "white" ? -1 : 1;
        const startRow = piece.color === "white" ? 6 : 1;
        if (fromCol === toCol && !targetPiece) {
          if (toRow === fromRow + direction) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction && !currentBoard[fromRow + direction][fromCol]) return true;
        }
        if (colDiff === 1 && toRow === fromRow + direction && targetPiece) return true;
        return false;
      case "rook":
        return (fromRow === toRow || fromCol === toCol) && isPathClear(fromRow, fromCol, toRow, toCol, currentBoard);
      case "knight":
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      case "bishop":
        return rowDiff === colDiff && isPathClear(fromRow, fromCol, toRow, toCol, currentBoard);
      case "queen":
        return (fromRow === toRow || fromCol === toCol || rowDiff === colDiff) && isPathClear(fromRow, fromCol, toRow, toCol, currentBoard);
      case "king":
        return rowDiff <= 1 && colDiff <= 1;
      default: return false;
    }
  };

  const isPathClear = (fromRow: number, fromCol: number, toRow: number, toCol: number, currentBoard: Board): boolean => {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    while (currentRow !== toRow || currentCol !== toCol) {
      if (currentBoard[currentRow][currentCol]) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    return true;
  };

  const getValidMoves = (row: number, col: number): [number, number][] => {
    const piece = board[row][col];
    if (!piece) return [];
    const moves: [number, number][] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidMove(row, col, r, c, piece, board)) {
          moves.push([r, c]);
        }
      }
    }
    return moves;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver || isTutorial || (vsAI && isAITurn)) return;

    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      const piece = board[fromRow][fromCol];

      if (validMoves.some(([r, c]) => r === row && c === col) && piece) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = piece;
        newBoard[fromRow][fromCol] = null;

        if (isKingInCheck(currentPlayer, newBoard)) {
          setStatusMessage("Movimiento inválido: tu rey quedaría en jaque.");
          return;
        }

        const moveNotation = `${pieceNames[piece.type]}: ${toNotation(fromRow, fromCol)} → ${toNotation(row, col)}`;
        onMove(moveNotation);

        setBoard(newBoard);
        setSelectedSquare(null);
        setValidMoves([]);
        const nextPlayer: PieceColor = "black";
        
        if (isKingInCheck(nextPlayer, newBoard)) {
          if (isCheckmate(nextPlayer, newBoard)) {
            setGameOver(true);
            setWinner(currentPlayer);
            setStatusMessage(`¡Jaque mate! Las blancas ganan.`);
          } else {
            setStatusMessage(`¡Jaque a las negras!`);
            setCurrentPlayer(nextPlayer);
          }
        } else {
          setCurrentPlayer(nextPlayer);
          setStatusMessage("La IA está pensando...");
        }
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        setSelectedSquare([row, col]);
        setValidMoves(getValidMoves(row, col));
      }
    }
  };
  
  const makeAIMove = () => {
    let bestMove = null;
    let maxScore = -Infinity;
    const possibleMoves: { fromRow: number; fromCol: number; toRow: number; toCol: number }[] = [];

    board.forEach((row, fromRow) => {
      row.forEach((piece, fromCol) => {
        if (piece?.color === "black") {
          getValidMoves(fromRow, fromCol).forEach(([toRow, toCol]) => {
            const tempBoard = board.map(r => [...r]);
            tempBoard[toRow][toCol] = piece;
            tempBoard[fromRow][fromCol] = null;
            if (!isKingInCheck("black", tempBoard)) {
              possibleMoves.push({ fromRow, fromCol, toRow, toCol });
            }
          });
        }
      });
    });
  
    if (possibleMoves.length === 0) {
      setGameOver(true);
      setWinner("white");
      setStatusMessage("La IA no tiene movimientos. ¡Has ganado!");
      return;
    }
  
    for (const move of possibleMoves) {
      const targetPiece = board[move.toRow][move.toCol];
      let score = targetPiece ? pieceValues[targetPiece.type] : Math.random() * 0.5;
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
    }
  
    if (!bestMove) bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  
    const { fromRow, fromCol, toRow, toCol } = bestMove;
    const movingPiece = board[fromRow]?.[fromCol];
    if (!movingPiece) return;
  
    const moveNotation = `${pieceNames[movingPiece.type]}: ${toNotation(fromRow, fromCol)} → ${toNotation(toRow, toCol)}`;
    onMove(moveNotation);
  
    const newBoard = board.map(r => [...r]);
    newBoard[toRow][toCol] = movingPiece;
    newBoard[fromRow][fromCol] = null;
    setBoard(newBoard);
  
    if (isKingInCheck("white", newBoard)) {
      if (isCheckmate("white", newBoard)) {
        setGameOver(true);
        setWinner("black");
        setStatusMessage("¡Jaque mate! La IA ha ganado.");
      } else {
        setStatusMessage("¡Jaque! Tu turno.");
      }
    } else {
      setStatusMessage(`La IA movió ${pieceNames[movingPiece.type]}. Tu turno.`);
    }
  
    setCurrentPlayer("white");
    setIsAITurn(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl lg:max-w-none">
      <Card className="w-full space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              {isTutorial ? "Modo Tutorial" : (vsAI ? "Modo contra IA" : "Modo libre")}
            </p>
            {!isTutorial && (
              <div className="text-lg font-semibold">
                Turno: <span className="text-primary capitalize">{currentPlayer === "white" ? "Blancas" : "Negras"}</span>
              </div>
            )}
          </div>
          {!isTutorial && (
            <Button onClick={onReset} variant="outline" size="sm" className="self-start md:self-auto">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar partida
            </Button>
          )}
        </div>

        <div className="grid grid-cols-8 overflow-hidden rounded-lg border-2 border-border shadow-lg aspect-square">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare?.[0] === rowIndex && selectedSquare?.[1] === colIndex;
              const isValidMoveSquare = validMoves.some(([r, c]) => r === rowIndex && c === colIndex);
              const isHighlighted = highlightedSquares.some(([r, c]) => r === rowIndex && c === colIndex);

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  className={cn(
                    "flex aspect-square items-center justify-center text-4xl md:text-5xl lg:text-6xl transition-all duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    isLight ? "bg-accent" : "bg-primary/20",
                    isSelected ? "ring-4 ring-primary ring-inset" : "",
                    isValidMoveSquare ? "ring-4 ring-green-500/60 ring-inset" : "",
                    isHighlighted ? "ring-4 ring-blue-500/60 ring-inset" : ""
                  )}
                >
                  {piece && (
                    <span className={cn("transition-transform duration-200", piece.color === "white" ? "text-foreground" : "text-foreground/90")}>
                      {pieceSymbols[piece.color][piece.type]}
                    </span>
                  )}
                  {isValidMoveSquare && !piece && (
                    <div className="h-3 w-3 rounded-full bg-green-500/60 md:h-4 md:w-4" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {!isTutorial && (
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground min-h-[20px]">{statusMessage}</p>
            {vsAI && isAITurn && !gameOver && (
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <Spinner className="h-4 w-4" />
                <span>La IA está calculando su jugada...</span>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
