import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, ArrowLeft, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { deleteFavorito } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

interface FavoritesViewProps {
  onBackToMap: () => void;
}

export const FavoritesView = ({ onBackToMap }: FavoritesViewProps) => {
  const { favorites, loading, error, refetch } = useFavorites();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemoveFavorite = async (favoritoId: number, lugarNombre: string) => {
    setRemovingId(favoritoId);

    try {
      const response = await deleteFavorito(favoritoId);

      if (response.success) {
        toast.success(`${lugarNombre} eliminado de favoritos `);
        refetch();
      } else {
        toast.error("Error al eliminar de favoritos");
      }
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      toast.error("Hubo un problema al eliminar el favorito");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive">
        <p className="mb-4">{error}</p>
        <Button onClick={refetch}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado con botón Volver */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
          <MapPin className="h-5 w-5" /> Tus favoritos
        </h2>

        <Button 
          variant="outline"
          onClick={onBackToMap}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al mapa
        </Button>
      </div>

      {/* Lista de favoritos */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
          <MapPin className="h-12 w-12 mb-3 opacity-50" />
          <p>No tienes lugares favoritos aún</p>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto flex-1">
          {favorites.map((fav) => (
            <Card 
              key={fav.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-80"
            >
              {/* Contenedor de imagen con botón de favorito */}
              <div className="relative h-48 bg-muted">
                {fav.lugar.imagen ? (
                  <img
                    src={fav.lugar.imagen}
                    alt={fav.lugar.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Botón de eliminar - siempre visible */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRemoveFavorite(fav.id, fav.lugar.nombre)}
                  disabled={removingId === fav.id}
                  className="absolute top-3 left-3 h-9 w-9 p-0 rounded-full shadow-md bg-white/90 hover:bg-white backdrop-blur-sm"
                >
                  {removingId === fav.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  )}
                </Button>
              </div>

              {/* Contenido de la card */}
              <div className="p-4 flex flex-col flex-1 min-h-0">
                <h3 className="font-semibold text-primary text-lg mb-2 line-clamp-2">
                  {fav.lugar.nombre}
                </h3>
                
                {/* Descripción con scroll */}
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {fav.lugar.descripcion || "Sin descripción disponible"}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Estilos para el scrollbar personalizado */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  );
};