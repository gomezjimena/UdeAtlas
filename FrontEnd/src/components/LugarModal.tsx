import { X, Heart, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Lugar {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  id_tipo_lugar: number;
  tipoLugar?: {        // ✅ Cambiado
    id: number;
    nombre: string;
  };
  comentarios?: {      // ✅ Cambiado
    id: number;
    descripcion: string;
    fecha: string;
    id_usuario: number;
  }[];
  eventos?: {          // ✅ Cambiado
    id: number;
    titulo: string;
    fecha_evento: string;
  }[];
  interiores?: {       // ✅ Cambiado
    id: number;
    nombre: string;
    descripcion?: string;
    piso?: number;
  }[];
  favoritos?: {        // ✅ Cambiado
    id: number;
    id_usuario: number;
  }[];
}

interface LugarModalProps {
  lugar: Lugar | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LugarModal = ({ lugar, isOpen, onClose }: LugarModalProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [newComment, setNewComment] = useState("");

  console.log("Datos del lugar:", lugar);
  console.log("Interiores:", lugar?.interiores);
  console.log("Eventos:", lugar?.eventos);
  console.log("Comentarios:", lugar?.comentarios);

  if (!lugar || lugar.id_tipo_lugar === 7) return null;

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Aquí podrías llamar a tu endpoint para crear comentario
      setNewComment("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[90vw] h-[85vh] p-0 overflow-hidden flex flex-col [&>button]:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b shrink-0">
            <DialogTitle className="text-xl font-semibold text-foreground">
              {lugar.nombre}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className="h-8 w-8 p-0"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Imagen y tipo */}
          {lugar.imagen && (
            <div className="h-48 relative shrink-0">
              <img
                src={lugar.imagen}
                alt={lugar.nombre}
                className="w-full h-full object-cover"
              />
              {lugar.tipoLugar && (
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full shadow-md">
                    {lugar.tipoLugar.nombre}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Contenido principal scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 space-y-6">
              {/* Descripción */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2 text-foreground">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {lugar.descripcion || "Sin descripción disponible."}
                </p>
              </Card>

              {/* Interiores */}
              {lugar.interiores && lugar.interiores.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-foreground">Espacios interiores</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {lugar.interiores.map((interior) => (
                      <div
                        key={interior.id}
                        className="bg-muted text-muted-foreground px-3 py-2 rounded-md text-sm"
                      >
                        <p className="font-medium">{interior.nombre}</p>
                        {interior.piso !== null && interior.piso !== undefined && (
                          <p className="text-xs mt-1 opacity-75">Piso {interior.piso}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Eventos */}
              {lugar.eventos && lugar.eventos.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-foreground">Eventos</h3>
                  <ul className="space-y-2">
                    {lugar.eventos.map((evento) => (
                      <li
                        key={evento.id}
                        className="flex items-center justify-between text-sm text-muted-foreground border-b pb-1"
                      >
                        <span>{evento.titulo}</span>
                        <span className="text-xs">
                          {new Date(evento.fecha_evento).toLocaleDateString("es-CO")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Comentarios */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 text-foreground">Comentarios</h3>
                
                {/* Lista de comentarios */}
                <div className="space-y-4 mb-4">
                  {lugar.comentarios && lugar.comentarios.length > 0 ? (
                    lugar.comentarios.map((comentario) => (
                      <div
                        key={comentario.id}
                        className="border-l-2 border-primary/20 pl-4"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm text-foreground">
                            Usuario {comentario.id_usuario}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comentario.fecha).toLocaleDateString("es-CO")}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {comentario.descripcion}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No hay comentarios aún.
                    </p>
                  )}
                </div>

                {/* Nuevo comentario */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddComment}
                    size="sm"
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};