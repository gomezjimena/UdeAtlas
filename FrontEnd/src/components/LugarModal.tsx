import { X, Heart, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { addFavorito, deleteFavorito } from "@/lib/api"; // 🔹 Importa tus funciones

interface Lugar {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  id_tipo_lugar: number;
  tipoLugar?: {
    id: number;
    nombre: string;
  };
  comentarios?: {
    id: number;
    descripcion: string;
    fecha: string;
    id_usuario: number;
  }[];
  eventos?: {
    id: number;
    titulo: string;
    fecha_evento: string;
  }[];
  interiores?: {
    id: number;
    nombre: string;
    descripcion?: string;
    piso?: number;
  }[];
  favoritos?: {
    id: number;
    id_usuario: number;
  }[];
}

interface LugarModalProps {
  lugar: Lugar | null;
  isOpen: boolean;
  onClose: () => void;
  onFavoriteChange?: () => void; // 🔹 Callback opcional para refrescar vista de favoritos
}

export const LugarModal = ({ lugar, isOpen, onClose, onFavoriteChange }: LugarModalProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [userId, setUserId] = useState<number | null>(null); // 🔹 Cambio a number
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      // 🔹 Aquí necesitas obtener el id numérico de tu tabla de usuarios
      // Si tienes una tabla tbl_Usuario que relaciona auth.users con un id numérico:
      if (data.user) {
        const { data: userData } = await supabase
          .from('tbl_Usuario')
          .select('id')
          .eq('auth_user_id', data.user.id)
          .single();
        
        setUserId(userData?.id || null);
      } else {
        setUserId(null);
      }
    };
    getUser();
  }, []);

  // Verificar si ya es favorito
  useEffect(() => {
    if (lugar?.favoritos && userId) {
      const fav = lugar.favoritos.find((f) => f.id_usuario === userId);
      setIsFavorite(!!fav);
      setFavoriteId(fav?.id || null);
    } else {
      setIsFavorite(false);
      setFavoriteId(null);
    }
  }, [lugar, userId]);

  const handleToggleFavorite = async () => {
    if (!userId || !lugar) {
      toast.error("Debes iniciar sesión para agregar a favoritos.");
      return;
    }

    setIsTogglingFavorite(true);

    try {
      if (!isFavorite) {
        // ➕ Agregar a favoritos
        const response = await addFavorito(userId, lugar.id);

        if (response.success) {
          setFavoriteId(response.data.id);
          setIsFavorite(true);
          toast.success("Agregado a favoritos ❤️");
          onFavoriteChange?.(); // 🔹 Notificar cambio
        } else {
          toast.error(response.message || "Error al agregar favorito");
        }
      } else {
        // ❌ Eliminar de favoritos
        if (favoriteId) {
          const response = await deleteFavorito(favoriteId);

          if (response.success) {
            setIsFavorite(false);
            setFavoriteId(null);
            toast.success("Eliminado de favoritos 💔");
            onFavoriteChange?.(); // 🔹 Notificar cambio
          } else {
            toast.error("Error al eliminar favorito");
          }
        }
      }
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
      toast.error("Hubo un problema al actualizar tus favoritos.");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Aquí podrías llamar a tu endpoint para crear comentario
      setNewComment("");
    }
  };

  if (!lugar || lugar.id_tipo_lugar === 7) return null;

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
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite || !userId}
                className="h-8 w-8 p-0"
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
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

          {/* Contenido principal */}
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
                <div className="space-y-4 mb-4">
                  {lugar.comentarios && lugar.comentarios.length > 0 ? (
                    lugar.comentarios.map((comentario) => (
                      <div key={comentario.id} className="border-l-2 border-primary/20 pl-4">
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
                    <p className="text-sm text-muted-foreground italic">No hay comentarios aún.</p>
                  )}
                </div>

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