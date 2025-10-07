"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { PromotionDialog } from "./ui/promotion-dialog"

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
  const [promotionSquare, setPromotionSquare] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    if (gameOver || !vsAI || currentPlayer !== "black" || promotionSquare) {
      setIsAITurn(false);
      return;
    }
    setIsAITurn(true);
    const timeout = setTimeout(() => makeAIMove(), 800);
    return () => clearTimeout(timeout);
  }, [vsAI, currentPlayer, board, gameOver, promotionSquare]);

  const findKing = (color: PieceColor, currentBoard: Board): [number, number] | null => {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (currentBoard[r][c]?.type === "king" && currentBoard[r][c]?.color === color) return [r, c];
    return null;
  };

  const isSquareAttacked = (row: number, col: number, attackerColor: PieceColor, currentBoard: Board): boolean => {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (currentBoard[r][c]?.color === attackerColor && isValidMove(r, c, row, col, currentBoard[r][c]!, currentBoard)) return true;
    return false;
  };
  
  const isKingInCheck = (kingColor: PieceColor, currentBoard: Board): boolean => {
    const kingPos = findKing(kingColor, currentBoard);
    if (!kingPos) return false;
    return isSquareAttacked(kingPos[0], kingPos[1], kingColor === "white" ? "black" : "white", currentBoard);
  };
  
  const getAllLegalMovesForColor = (color: PieceColor, currentBoard: Board): { from: [number, number], to: [number, number] }[] => {
    const allMoves: { from: [number, number], to: [number, number] }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece?.color === color) {
          getValidMoves(r, c).forEach(move => {
            const tempBoard = currentBoard.map(row => [...row]);
            tempBoard[move[0]][move[1]] = piece;
            tempBoard[r][c] = null;
            if (!isKingInCheck(color, tempBoard)) allMoves.push({ from: [r, c], to: move });
          });
        }
      }
    }
    return allMoves;
  };
  
  const isCheckmate = (kingColor: PieceColor, currentBoard: Board): boolean => {
    return isKingInCheck(kingColor, currentBoard) && getAllLegalMovesForColor(kingColor, currentBoard).length === 0;
  };

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number, piece: Piece, currentBoard: Board): boolean => {
    const targetPiece = currentBoard[toRow][toCol];
    if (targetPiece?.color === piece.color) return false;
    const rowDiff = Math.abs(toRow - fromRow), colDiff = Math.abs(toCol - fromCol);
    switch (piece.type) {
      case "pawn":
        const dir = piece.color === "white" ? -1 : 1, startRow = piece.color === "white" ? 6 : 1;
        if (fromCol === toCol && !targetPiece) {
          if (toRow === fromRow + dir) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * dir && !currentBoard[fromRow + dir][fromCol]) return true;
        }
        return colDiff === 1 && toRow === fromRow + dir && !!targetPiece;
      case "rook": return (fromRow === toRow || fromCol === toCol) && isPathClear(fromRow, fromCol, toRow, toCol, currentBoard);
      case "knight": return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      case "bishop": return rowDiff === colDiff && isPathClear(fromRow, fromCol, toRow, toCol, currentBoard);
      case "queen": return (fromRow === toRow || fromCol === toCol || rowDiff === colDiff) && isPathClear(fromRow, fromCol, toRow, toCol, currentBoard);
      case "king": return rowDiff <= 1 && colDiff <= 1;
      default: return false;
    }
  };

  const isPathClear = (fromRow: number, fromCol: number, toRow: number, toCol: number, currentBoard: Board): boolean => {
    const rowStep = Math.sign(toRow - fromRow), colStep = Math.sign(toCol - fromCol);
    let r = fromRow + rowStep, c = fromCol + colStep;
    while (r !== toRow || c !== toCol) {
      if (currentBoard[r][c]) return false;
      r += rowStep; c += colStep;
    }
    return true;
  };

  const getValidMoves = (row: number, col: number): [number, number][] => {
    const piece = board[row][col];
    if (!piece) return [];
    const moves: [number, number][] = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (isValidMove(row, col, r, c, piece, board)) moves.push([r, c]);
    return moves;
  };

  const finishMove = (finalBoard: Board) => {
    const nextPlayer = currentPlayer === "white" ? "black" : "white";
    setBoard(finalBoard);
    if (isKingInCheck(nextPlayer, finalBoard)) {
        if (isCheckmate(nextPlayer, finalBoard)) {
            setGameOver(true);
            setWinner(currentPlayer);
            setStatusMessage(`¡Jaque mate! Las ${currentPlayer}s ganan.`);
        } else {
            setStatusMessage(`¡Jaque a las ${nextPlayer}s!`);
            setCurrentPlayer(nextPlayer);
        }
    } else {
        setCurrentPlayer(nextPlayer);
        setStatusMessage(vsAI && nextPlayer === "black" ? "La IA está pensando..." : `Turno de las ${nextPlayer}s.`);
    }
    setSelectedSquare(null);
    setValidMoves([]);
  };

  const handlePromote = (pieceType: PieceType) => {
    if (!promotionSquare) return;
    const { row, col } = promotionSquare;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = { type: pieceType, color: currentPlayer };
    setPromotionSquare(null);
    finishMove(newBoard);
  };
  
  const handleSquareClick = (row: number, col: number) => {
    if (gameOver || isTutorial || (vsAI && isAITurn) || promotionSquare) return;

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

        const promotionRank = currentPlayer === "white" ? 0 : 7;
        if (piece.type === "pawn" && row === promotionRank) {
          setBoard(newBoard);
          setPromotionSquare({ row, col });
          return;
        }

        finishMove(newBoard);
      }
      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      const piece = board[row][col];
      if (piece?.color === currentPlayer) {
        setSelectedSquare([row, col]);
        setValidMoves(getValidMoves(row, col));
      }
    }
  };

  const makeAIMove = () => {
    let bestMove: any = null, maxScore = -Infinity;
    const possibleMoves = getAllLegalMovesForColor("black", board);

    if (possibleMoves.length === 0) {
        setGameOver(true);
        setWinner(isKingInCheck("black", board) ? "white" : null); 
        setStatusMessage(isKingInCheck("black", board) ? "La IA está en jaque mate. ¡Has ganado!" : "¡Ahogado! La partida es un empate.");
        return;
    }

    for (const move of possibleMoves) {
        // LA LÍNEA DE ABAJO ES LA CORRECCIÓN. 
        // Antes era `board[move.to.r][move.to.c]`, pero `move.to` es un array.
        const targetPiece = board[move.to[0]][move.to[1]];
        let score = targetPiece ? pieceValues[targetPiece.type] : Math.random() * 0.1;
        if (score > maxScore) { maxScore = score; bestMove = move; }
    }

    if (!bestMove) bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    const { from, to } = bestMove;
    const [fromRow, fromCol] = from, [toRow, toCol] = to;
    const movingPiece = board[fromRow][fromCol]!;
    
    const moveNotation = `${pieceNames[movingPiece.type]}: ${toNotation(fromRow, fromCol)} → ${toNotation(toRow, toCol)}`;
    onMove(moveNotation);

    const newBoard = board.map(r => [...r]);
    newBoard[toRow][toCol] = movingPiece;
    newBoard[fromRow][fromCol] = null;

    if (movingPiece.type === 'pawn' && toRow === 7) {
        newBoard[toRow][toCol] = { type: 'queen', color: 'black' };
    }

    setBoard(newBoard);
    setCurrentPlayer("white");
    setIsAITurn(false);
    
    if (isKingInCheck("white", newBoard)) {
        if (isCheckmate("white", newBoard)) {
            setGameOver(true); setWinner("black");
            setStatusMessage("¡Jaque mate! La IA ha ganado.");
        } else {
            setStatusMessage("¡Jaque! Tu turno.");
        }
    } else {
        setStatusMessage(`La IA movió ${pieceNames[movingPiece.type]}. Tu turno.`);
    }
  };

  const resetGame = () => {
    onReset(); // Llama a la función del padre para limpiar el historial
    setBoard(createInitialBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentPlayer("white");
    setIsAITurn(false);
    setGameOver(false);
    setWinner(null);
    setPromotionSquare(null);
    setStatusMessage(
      vsAI ? "Juegas con blancas. Haz tu primer movimiento." : "Selecciona una pieza para moverla."
    );
  };
  
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {promotionSquare && <PromotionDialog color={currentPlayer} onSelectPiece={handlePromote} />}
      <Card className="w-full space-y-4 p-2 sm:p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
              {isTutorial ? "Modo Tutorial" : (vsAI ? "Modo contra IA" : "Modo libre")}
            </p>
            {!isTutorial && <div className="text-base md:text-lg font-semibold">Turno: <span className="text-primary capitalize">{currentPlayer}</span></div>}
          </div>
          {!isTutorial && <Button onClick={resetGame} variant="outline" size="sm" className="self-start md:self-auto"><RotateCcw className="mr-2 h-4 w-4" />Reiniciar</Button>}
        </div>

        <div className="grid grid-cols-8 overflow-hidden rounded-md border shadow-lg aspect-square">
          {board.map((row, rowIndex) => row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedSquare?.[0] === rowIndex && selectedSquare?.[1] === colIndex;
            const isValidMoveSquare = validMoves.some(([r, c]) => r === rowIndex && c === colIndex);
            const isHighlighted = highlightedSquares.some(([r, c]) => r === rowIndex && c === colIndex);
            return (
              <button key={`${rowIndex}-${colIndex}`} onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={cn("flex aspect-square items-center justify-center text-3xl sm:text-4xl lg:text-5xl", isLight ? "bg-accent" : "bg-primary/20", isSelected && "ring-2 md:ring-4 ring-primary ring-inset", isValidMoveSquare && "ring-2 md:ring-4 ring-green-500/60 ring-inset", isHighlighted && "ring-2 md:ring-4 ring-blue-500/60 ring-inset")}>
                {piece && <span className={cn("transition-transform duration-200", piece.color === "white" ? "text-foreground" : "text-foreground/90")}>{pieceSymbols[piece.color][piece.type]}</span>}
                {isValidMoveSquare && !piece && <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-500/60" />}
              </button>
            );
          }))}
        </div>

        {!isTutorial && (
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground min-h-[20px]">{statusMessage}</p>
            {vsAI && isAITurn && !gameOver && <div className="flex items-center justify-center gap-2 text-sm text-primary"><Spinner className="h-4 w-4" /><span>La IA está pensando...</span></div>}
          </div>
        )}
      </Card>
    </div>
  );
}
