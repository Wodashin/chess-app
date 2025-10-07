"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type PieceType = "queen" | "rook" | "bishop" | "knight";

interface PromotionDialogProps {
  color: "white" | "black";
  onSelectPiece: (piece: PieceType) => void;
}

const pieceSymbols = {
  white: { queen: "♕", rook: "♖", bishop: "♗", knight: "♘" },
  black: { queen: "♛", rook: "♜", bishop: "♝", knight: "♞" },
};

export function PromotionDialog({ color, onSelectPiece }: PromotionDialogProps) {
  const promotionPieces: PieceType[] = ["queen", "rook", "bishop", "knight"];

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]" hideCloseButton={true}>
        <DialogHeader>
          <DialogTitle>¡Promoción de Peón!</DialogTitle>
          <DialogDescription>
            Tu peón ha llegado al final del tablero. Elige una nueva pieza.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          {promotionPieces.map((piece) => (
            <Button
              key={piece}
              variant="outline"
              className="h-20 w-full text-5xl"
              onClick={() => onSelectPiece(piece)}
            >
              {pieceSymbols[color][piece]}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
