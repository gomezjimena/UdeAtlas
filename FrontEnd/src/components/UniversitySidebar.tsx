import { Heart, MapPin, User, Navigation, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";

const buildings = [
  "Edificio A - Ingeniería",
  "Edificio B - Ciencias",
  "Edificio C - Humanidades", 
  "Biblioteca Central",
  "Cafetería Principal",
  "Auditorio Magna",
  "Centro Deportivo",
  "Laboratorios",
  "Rectoría",
  "Entrada Principal"
];

// Las categorías ahora se obtienen dinámicamente de la base de datos

interface UniversitySidebarProps {
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onCalculateRoute: () => void;
  onFavoritesClick: () => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export const UniversitySidebar = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onCalculateRoute,
  onFavoritesClick,
  selectedCategory,
  onCategoryChange
}: UniversitySidebarProps) => {
  const { categories, loading, error } = useCategories();
  return (
    <div className="w-80 h-screen bg-gradient-to-b from-background to-secondary border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          UdeAtlass
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
      <div className="px-4 pb-4">
        <Card className="p-4 shadow-sm">
          <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            Categorías
          </h3>
          
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
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

      {/* Route Selection */}
      <div className="flex-1 p-4 space-y-4">
        <Card className="p-4 shadow-sm">
          <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            Calcular Ruta
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Origen
              </label>
              <Select value={origin} onValueChange={onOriginChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el origen" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building} value={building}>
                      {building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Destino
              </label>
              <Select value={destination} onValueChange={onDestinationChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el destino" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building} value={building}>
                      {building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              onClick={onCalculateRoute}
              disabled={!origin || !destination}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Calcular Ruta
            </Button>
          </div>
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