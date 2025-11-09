import { ArrowLeftRight, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLugares } from "@/hooks/useLugares";

interface RouteControlsProps {
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onCalculateRoute: () => void;
  onSwapRoute: () => void;
  isCalculating: boolean;
  onClearRoute?: () => void;
}

export const RouteControls = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onCalculateRoute,
  onSwapRoute,
  isCalculating,
  onClearRoute,
}: RouteControlsProps) => {
  const { lugares, loading } = useLugares();

  // Filtrar lugares válidos (excluir tipo 7 y sin coordenadas)
  const lugaresValidos = (lugares || []).filter(
    l => l.id_tipo_lugar !== 7 && 
         l.x_coord !== null && 
         l.y_coord !== null
  );

  return (
    <div className="bg-card border-b border-border p-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4">
        {/* Selector de origen */}
        <div className="flex-1 min-w-[200px]">
          <Select value={origin} onValueChange={onOriginChange} disabled={loading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loading ? "Cargando..." : "Selecciona origen"} />
            </SelectTrigger>
            <SelectContent>
              {lugaresValidos.map((lugar) => (
                <SelectItem key={lugar.id} value={String(lugar.id)}>
                  {lugar.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botón de intercambio */}
        <Button
          variant="outline"
          size="icon"
          onClick={onSwapRoute}
          disabled={!origin || !destination || isCalculating}
          className="shrink-0"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        {/* Selector de destino */}
        <div className="flex-1 min-w-[200px]">
          <Select value={destination} onValueChange={onDestinationChange} disabled={loading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loading ? "Cargando..." : "Selecciona destino"} />
            </SelectTrigger>
            <SelectContent>
              {lugaresValidos.map((lugar) => (
                <SelectItem key={lugar.id} value={String(lugar.id)}>
                  {lugar.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button
            onClick={onCalculateRoute}
            disabled={!origin || !destination || isCalculating || origin === destination}
            className="shrink-0"
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                Calcular Ruta
              </>
            )}
          </Button>

          {onClearRoute && (origin || destination) && (
            <Button
              variant="outline"
              onClick={onClearRoute}
              disabled={isCalculating}
              className="shrink-0"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};