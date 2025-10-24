import { Heart, MapPin, User, Navigation, Building, Loader2, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";

// Las categorías ahora se obtienen dinámicamente de la base de datos

interface UniversitySidebarProps {
  onFavoritesClick: () => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  route: any[];
  origin: string;
  destination: string;
}

export const UniversitySidebar = ({
  onFavoritesClick,
  selectedCategory,
  onCategoryChange,
  route
}: UniversitySidebarProps) => {
  const { categories, loading, error } = useCategories();
  return (
    <div className="w-80 h-screen bg-gradient-to-b from-background to-secondary border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          UdeAtlas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Navegación Universitaria
        </p>
      </div>

      {/* Favorites Button */}
      <div className="p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 border-primary/20 hover:bg-primary/5"
          onClick={onFavoritesClick}
        >
          <Heart className="h-5 w-5 text-accent" />
          Lugares Favoritos
        </Button>
      </div>

      {/* Category Filter */}
      <div className="px-4 pb-2">
        <Card className="p-4 shadow-sm">
          <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            Categorías
          </h3>
          
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all"> Ninguna</SelectItem>
              {loading ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando categorías...
                  </div>
                </SelectItem>
              ) : error ? (
                <SelectItem value="error" disabled>
                  Error al cargar categorías
                </SelectItem>
              ) : (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.nombre}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Card>
      </div>

      {/* Route Instructions */}
      <div className="flex-1 p-4 pt-2 space-y-4 min-h-0">
        <Card className="p-4 shadow-sm h-full flex flex-col min-h-0">
          <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2 flex-shrink-0">
            <Route className="h-4 w-4 text-primary" />
            Indicaciones de Ruta
          </h3>
          
          {route.length > 0 ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                {route.map((node, index) => (
                  <div key={node.id} className="flex items-start gap-3 p-2 rounded-lg bg-secondary/50 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      {node.type === 'building' ? (
                        <div>
                          <div className="font-medium text-sm">{node.name}</div>
                          <div className="text-xs text-muted-foreground">Edificio</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-sm">Punto de paso {index}</div>
                          <div className="text-xs text-muted-foreground">Continúa por esta dirección</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-2 border-t border-border mt-2 flex-shrink-0">
                <div className="text-xs text-muted-foreground">
                  Tiempo estimado: {Math.ceil(route.length * 2)} minutos
                </div>
                <div className="text-xs text-muted-foreground">
                  Distancia aproximada: {Math.ceil(route.length * 50)} metros
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="text-center">
                <Route className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Selecciona origen y destino arriba para ver las indicaciones de ruta
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Usuario Invitado</p>
              <p className="text-xs text-muted-foreground">Click para iniciar sesión</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};