import { X, Heart, Send, Loader2, Pencil, Trash2, Calendar, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { addFavorito, deleteFavorito, getUserByAuthId } from "@/lib/api";
import { useComentarios } from "@/hooks/useComentarios";
import { useEventos } from "@/hooks/useEventos";

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
  onFavoriteChange?: () => void;
}

export const LugarModal = ({ lugar, isOpen, onClose, onFavoriteChange }: LugarModalProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  
  // Estados para comentarios
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // Estados para eventos
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState({
    titulo: "",
    descripcion: "",
    fecha_evento: "",
  });

  // Hooks
  const {
    comentarios,
    loading: loadingComentarios,
    addComentario,
    editComentario,
    removeComentario,
  } = useComentarios(lugar?.id || null);

  const {
    eventos,
    loading: loadingEventos,
    addEvento,
    editEvento,
    removeEvento,
  } = useEventos(lugar?.id || null);

  // Obtener usuario actual con rol
  useEffect(() => {
    const getUser = async () => {
      try {
        setIsLoadingUser(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserId(null);
          setUserRole(null);
          setIsLoadingUser(false);
          return;
        }
  
        const userResult = await getUserByAuthId(user.id);
  
        if (userResult.success && userResult.data) {
          setUserId(userResult.data.id);
          setUserRole(userResult.data.rol?.nombre || null); // Obtiene el rol directamente del backend
          console.log('Usuario:', userResult.data.nombre, 'Rol:', userResult.data.rol?.nombre); // Debug
        } else {
          setUserId(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        setUserId(null);
        setUserRole(null);
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    getUser();
  }, []);

  // Verificar si es admin
  const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin';

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

  // ========== FAVORITOS ==========
  const handleToggleFavorite = async () => {
    if (!userId || !lugar) {
      toast.error("Debes iniciar sesión para agregar a favoritos.");
      return;
    }

    setIsTogglingFavorite(true);

    try {
      if (!isFavorite) {
        const response = await addFavorito(userId, lugar.id);
        if (response.success) {
          setFavoriteId(response.data.id);
          setIsFavorite(true);
          toast.success(`${lugar.nombre} agregado a favoritos ❤️`);
          onFavoriteChange?.();
        } else {
          toast.error(response.message || "Error al agregar favorito");
        }
      } else {
        if (favoriteId) {
          const response = await deleteFavorito(favoriteId);
          if (response.success) {
            setIsFavorite(false);
            setFavoriteId(null);
            toast.success(`${lugar.nombre} eliminado de favoritos 💔`);
            onFavoriteChange?.();
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

  // ========== COMENTARIOS ==========
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!userId) {
      toast.error("Debes iniciar sesión para comentar.");
      return;
    }
    if (!lugar) return;

    const success = await addComentario(userId, lugar.id, newComment.trim());
    if (success) {
      toast.success("Comentario agregado correctamente");
      setNewComment("");
    } else {
      toast.error("Error al agregar comentario");
    }
  };

  const handleStartEdit = (comentarioId: number, currentText: string) => {
    setEditingCommentId(comentarioId);
    setEditingCommentText(currentText);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleSaveEdit = async (comentarioId: number) => {
    if (!editingCommentText.trim()) {
      toast.error("El comentario no puede estar vacío");
      return;
    }
    if (!userId) return;

    const success = await editComentario(comentarioId, userId, editingCommentText.trim());
    if (success) {
      toast.success("Comentario actualizado correctamente");
      setEditingCommentId(null);
      setEditingCommentText("");
    } else {
      toast.error("Error al actualizar comentario");
    }
  };

  const handleDeleteComment = async (comentarioId: number) => {
    if (!userId) return;
    if (!confirm("¿Estás seguro de que deseas eliminar este comentario?")) return;

    const success = await removeComentario(comentarioId, userId);
    if (success) {
      toast.success("Comentario eliminado correctamente");
    } else {
      toast.error("Error al eliminar comentario");
    }
  };

  // ========== EVENTOS ==========
  const resetEventForm = () => {
    setEventForm({ titulo: "", descripcion: "", fecha_evento: "" });
    setIsCreatingEvent(false);
    setEditingEventId(null);
  };

  const handleStartCreateEvent = () => {
    resetEventForm();
    setIsCreatingEvent(true);
  };

  const handleStartEditEvent = (evento: any) => {
    setEventForm({
      titulo: evento.titulo,
      descripcion: evento.descripcion || "",
      fecha_evento: new Date(evento.fecha_evento).toISOString().slice(0, 16),
    });
    setEditingEventId(evento.id);
    setIsCreatingEvent(false);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.titulo.trim()) {
      toast.error("El título del evento es obligatorio");
      return;
    }
    if (!eventForm.fecha_evento) {
      toast.error("La fecha del evento es obligatoria");
      return;
    }
    if (!userId || !lugar) return;

    let success = false;

    if (editingEventId) {
      // Editar evento existente
      success = await editEvento(
        editingEventId,
        userId,
        eventForm.titulo.trim(),
        eventForm.descripcion.trim() || null,
        new Date(eventForm.fecha_evento).toISOString()
      );
      if (success) {
        toast.success("Evento actualizado correctamente");
      }
    } else {
      // Crear nuevo evento
      success = await addEvento(
        userId,
        lugar.id,
        eventForm.titulo.trim(),
        eventForm.descripcion.trim() || null,
        new Date(eventForm.fecha_evento).toISOString()
      );
      if (success) {
        toast.success("Evento creado correctamente");
      }
    }

    if (success) {
      resetEventForm();
    } else {
      toast.error(editingEventId ? "Error al actualizar evento" : "Error al crear evento");
    }
  };

  const handleDeleteEvent = async (eventoId: number, eventoTitulo: string) => {
    if (!userId) return;
    if (!confirm(`¿Estás seguro de que deseas eliminar el evento "${eventoTitulo}"?`)) return;

    const success = await removeEvento(eventoId, userId);
    if (success) {
      toast.success("Evento eliminado correctamente");
    } else {
      toast.error("Error al eliminar evento");
    }
  };

  if (!lugar || lugar.id_tipo_lugar === 7) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0 overflow-hidden flex flex-col [&>button]:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <DialogTitle className="text-xl font-semibold text-foreground">
              {lugar.nombre}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite || !userId || isLoadingUser}
                className="h-9 w-9 p-0 hover:bg-accent"
                title={!userId ? "Inicia sesión para agregar a favoritos" : isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                {isTogglingFavorite ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Heart
                    className={`h-5 w-5 transition-all duration-200 ${
                      isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground hover:text-red-500 hover:scale-105"
                    }`}
                  />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 p-0 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          {/* Imagen destacada */}
          {lugar.imagen && (
            <div className="h-48 md:h-56 relative shrink-0 bg-muted">
              <img
                src={lugar.imagen}
                alt={lugar.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {lugar.tipoLugar && (
                <div className="absolute bottom-4 left-4">
                  <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-sm font-medium px-4 py-2 rounded-full shadow-lg">
                    {lugar.tipoLugar.nombre}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Contenido principal con scroll */}
          <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* Descripción */}
              <Card className="p-5 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-3 text-foreground">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  {lugar.descripcion || "Sin descripción disponible."}
                </p>
              </Card>

              {/* Interiores */}
              {lugar.interiores && lugar.interiores.length > 0 && (
                <Card className="p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-4 text-foreground">Espacios interiores</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {lugar.interiores.map((interior) => (
                      <div
                        key={interior.id}
                        className="bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-3 rounded-lg text-sm transition-colors"
                      >
                        <p className="font-medium text-foreground">{interior.nombre}</p>
                        {interior.piso !== null && interior.piso !== undefined && (
                          <p className="text-xs mt-1 opacity-75">Piso {interior.piso}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Eventos */}
              <Card className="p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Eventos
                  </h3>
                  {isAdmin && !isCreatingEvent && !editingEventId && (
                    <Button
                      size="sm"
                      onClick={handleStartCreateEvent}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Crear evento
                    </Button>
                  )}
                </div>

                {/* Formulario de crear/editar evento */}
                {isAdmin && (isCreatingEvent || editingEventId) && (
                  <Card className="p-4 mb-4 bg-muted/50">
                    <h4 className="font-medium mb-3 text-sm">
                      {editingEventId ? "Editar evento" : "Nuevo evento"}
                    </h4>
                    <div className="space-y-3">
                      <Input
                        placeholder="Título del evento *"
                        value={eventForm.titulo}
                        onChange={(e) => setEventForm({ ...eventForm, titulo: e.target.value })}
                      />
                      <Textarea
                        placeholder="Descripción (opcional)"
                        value={eventForm.descripcion}
                        onChange={(e) => setEventForm({ ...eventForm, descripcion: e.target.value })}
                        rows={2}
                      />
                      <Input
                        type="datetime-local"
                        value={eventForm.fecha_evento}
                        onChange={(e) => setEventForm({ ...eventForm, fecha_evento: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEvent}
                          disabled={!eventForm.titulo.trim() || !eventForm.fecha_evento}
                        >
                          {editingEventId ? "Guardar cambios" : "Crear evento"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={resetEventForm}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Lista de eventos */}
                {loadingEventos ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : eventos.length > 0 ? (
                  <ul className="space-y-3">
                    {eventos.map((evento) => (
                      <li
                        key={evento.id}
                        className="border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{evento.titulo}</p>
                            {evento.descripcion && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {evento.descripcion}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(evento.fecha_evento).toLocaleDateString("es-CO", {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Creado por: {evento.usuarioAdmin.nombre}
                            </p>
                          </div>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEditEvent(evento)}
                                className="h-8 w-8 p-0"
                                title="Editar evento"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(evento.id, evento.titulo)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                title="Eliminar evento"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    No hay eventos programados para este lugar.
                  </p>
                )}
              </Card>

              {/* Comentarios */}
              <Card className="p-5 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-4 text-foreground">Comentarios</h3>
                
                {loadingComentarios ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {comentarios.length > 0 ? (
                      comentarios.map((comentario) => (
                        <div key={comentario.id} className="border-l-2 border-primary/30 pl-4 py-2 hover:border-primary/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm text-foreground">
                              {comentario.usuario.nombre}
                            </p>
                            <div className="flex items-center gap-2">
                              {userId === comentario.id_usuario && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStartEdit(comentario.id, comentario.descripcion)}
                                    className="h-7 w-7 p-0"
                                    title="Editar comentario"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteComment(comentario.id)}
                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                    title="Eliminar comentario"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {editingCommentId === comentario.id ? (
                            <div className="flex gap-2 mt-2">
                              <Input
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                className="flex-1"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(comentario.id)}
                                disabled={!editingCommentText.trim()}
                              >
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {comentario.descripcion}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center py-4">
                        No hay comentarios aún. ¡Sé el primero en comentar!
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-border/50">
                  <Input
                    placeholder={userId ? "Agregar un comentario..." : "Inicia sesión para comentar"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                    className="flex-1"
                    disabled={!userId}
                  />
                  <Button
                    onClick={handleAddComment}
                    size="sm"
                    disabled={!newComment.trim() || !userId}
                    className="px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Scrollbar personalizado */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: hsl(var(--muted-foreground) / 0.3);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: hsl(var(--muted-foreground) / 0.5);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};