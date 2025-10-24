import { ArrowLeftRight, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLugares } from "@/hooks/useLugares";

interface RouteControlsProps {
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onCalculateRoute: () => void;
  onSwapRoute: () => void;
  isCalculating: boolean;
}

export const RouteControls = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onCalculateRoute,
  onSwapRoute,
  isCalculating
}: RouteControlsProps) => {
  const { lugares, loading, error } = useLugares();
  return (
    <div className="p-5 shadow-sm my-0 border-b border-border bg-background">
      <div className="flex items-end gap-6 h-16 max-w-6xl mx-auto px-20">
        {/* Origen */}
        <div className="flex-1 flex flex-col justify-center text-center">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">
            Origen
          </label>

          {/* Mostrar los lugares disponibles */}
          <Select value={origin} onValueChange={onOriginChange}>
            <SelectTrigger className="w-full h-8">
              <SelectValue placeholder="Selecciona el punto de origen" />
            </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] max-h-64 overflow-y-auto">
              {loading ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando lugares...
                  </div>
                </SelectItem>
              ) : error ? (
                <SelectItem value="error" disabled>
                  Error al cargar los lugares
                </SelectItem>
              ) : (
                lugares.map((lugar) => (
                  <SelectItem
                    key={lugar.id}
                    value={lugar.id.toString()}
                    className="truncate max-w-full"
                    title={lugar.nombre} 
                  >
                    {lugar.nombre}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Botón de intercambio */}
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onSwapRoute}
            className="w-8 h-8 p-0 rounded-full hover:bg-primary/10"
            disabled={!origin || !destination}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Destino */}
        <div className="flex-1 flex flex-col justify-center text-center">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">
            Destino
          </label>
          <Select value={destination} onValueChange={onDestinationChange}>
            <SelectTrigger className="w-full h-8">
              <SelectValue placeholder="Selecciona el punto de destino" />
            </SelectTrigger>
            <SelectContent className="w-[var(--radix-select-trigger-width)] max-h-64 overflow-y-auto">
              {loading ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando lugares...
                  </div>
                </SelectItem>
              ) : error ? (
                <SelectItem value="error" disabled>
                  Error al cargar los lugares
                </SelectItem>
              ) : (
                lugares.map((lugar) => (
                  <SelectItem
                    key={lugar.id}
                    value={lugar.id.toString()}
                    className="truncate max-w-full"
                    title={lugar.nombre} 
                  >
                    {lugar.nombre}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Botón calcular ruta */}
        <div className="flex items-center justify-center">
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md w-28 h-8 text-sm"
            onClick={onCalculateRoute}
            disabled={!origin || !destination || isCalculating}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Calcular
          </Button>
        </div>
      </div>
    </div>
  );
};
