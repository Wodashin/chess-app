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
  vsAI?: boolean;
  initialBoard?: Board;
  highlightedSquares?: [number, number][];
  isTutorial?: boolean;
}

const pieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
}

const pieceNames: Record<PieceType, string> = {
  pawn: "peón", rook: "torre", knight: "caballo", bishop: "alfil", queen: "dama", king: "rey",
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

export default function ChessBoard({ vsAI = false, initialBoard, highlightedSquares = [], isTutorial = false }: ChessBoardProps) {
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
    const timeout = setTimeout(() => makeAIMove(), 600);
    return () => clearTimeout(timeout);
  }, [vsAI, currentPlayer, board, gameOver]);

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
    if (gameOver || isTutorial || (vsAI && isAITurn)) {
      return;
    }

    const piece = board[row][col];

    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      const selectedPiece = board[selectedRow][selectedCol];

      if (validMoves.some(([r, c]) => r === row && c === col) && selectedPiece) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = selectedPiece;
        newBoard[selectedRow][selectedCol] = null;
        
        if (isKingInCheck(currentPlayer, newBoard)) {
            setStatusMessage("Movimiento inválido: tu rey quedaría en jaque.");
            return;
        }

        setBoard(newBoard);
        setSelectedSquare(null);
        setValidMoves([]);

        const nextPlayer: PieceColor = currentPlayer === "white" ? "black" : "white";
        
        if (isKingInCheck(nextPlayer, newBoard)) {
            if (isCheckmate(nextPlayer, newBoard)) {
                setGameOver(true);
                setWinner(currentPlayer);
                setStatusMessage(`¡Jaque mate! Las ${currentPlayer === "white" ? "blancas" : "negras"} ganan.`);
            } else {
                setStatusMessage(`¡Jaque a las ${nextPlayer}!`);
                setCurrentPlayer(nextPlayer);
            }
        } else {
            setCurrentPlayer(nextPlayer);
            setStatusMessage(
              vsAI && nextPlayer === "black"
                ? "La
