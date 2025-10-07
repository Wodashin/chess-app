"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ListTree } from "lucide-react"

interface MoveHistoryPanelProps {
  moves: string[];
}

export function MoveHistoryPanel({ moves }: MoveHistoryPanelProps) {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ListTree className="h-5 w-5" />
          Historial de Jugadas
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-[450px] md:h-[500px]">
          <div className="p-4 text-sm">
            {moves.length === 0 ? (
              <p className="text-muted-foreground">La partida aún no ha comenzado.</p>
            ) : (
              <ol className="list-decimal list-inside space-y-2">
                {moves.map((move, index) => (
                  <li key={index} className="grid grid-cols-[auto_1fr] gap-x-2">
                    <span className="font-semibold">{Math.floor(index / 2) + 1}.</span>
                    <span>{move}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default MoveHistoryPanel;
