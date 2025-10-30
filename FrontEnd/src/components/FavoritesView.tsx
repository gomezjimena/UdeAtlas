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
        toast.success(`${lugarNombre} eliminado de favoritos 💔`);
        refetch(); // Recargar la lista
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

  // Si está cargando
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Si hay error
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
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto flex-1">
          {favorites.map((fav) => (
            <Card key={fav.id} className="p-4 hover:shadow-md transition relative group">
              {/* Botón de eliminar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFavorite(fav.id, fav.lugar.nombre)}
                disabled={removingId === fav.id}
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {removingId === fav.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                )}
              </Button>

              {/* Imagen del lugar (si existe) */}
              {fav.lugar.imagen && (
                <div className="w-full h-32 mb-3 rounded-md overflow-hidden">
                  <img
                    src={fav.lugar.imagen}
                    alt={fav.lugar.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h3 className="font-semibold text-primary pr-8">
                {fav.lugar.nombre}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {fav.lugar.descripcion || "Sin descripción"}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};