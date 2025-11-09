import { RutaCalculada } from "@/lib/api";
import { Navigation, MapPin, Clock, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RouteInstructionsProps {
  ruta: RutaCalculada;
  cached?: boolean;
}

export const RouteInstructions = ({ ruta, cached }: RouteInstructionsProps) => {
  if (!ruta) return null;

  const tiempoEstimado = Math.ceil((ruta.distanciaTotal / 80) * 60); // 80m/min velocidad promedio caminando

  return (
    <Card className="mx-4 my-2 p-3 bg-card border shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {ruta.lugares.length} {ruta.lugares.length === 1 ? 'lugar' : 'lugares'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {ruta.distanciaTotal.toFixed(0)}m
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              ~{tiempoEstimado} min
            </span>
          </div>

          {cached && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Caché
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 text-green-500" />
          <span className="font-medium">{ruta.lugares[0]?.nombre}</span>
          <span>→</span>
          <MapPin className="h-3 w-3 text-red-500" />
          <span className="font-medium">{ruta.lugares[ruta.lugares.length - 1]?.nombre}</span>
        </div>
      </div>
    </Card>
  );
};