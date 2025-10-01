import { Clock, MapPin, Navigation, Route } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RouteStep {
  id: string;
  instruction: string;
  distance: string;
  duration: string;
  type: 'start' | 'turn' | 'straight' | 'destination';
}

interface RouteInstructionsProps {
  origin?: string;
  destination?: string;
  isCalculating?: boolean;
  routeSteps?: RouteStep[];
  totalDistance?: string;
  totalDuration?: string;
}

const sampleSteps: RouteStep[] = [
  {
    id: '1',
    instruction: 'Inicia en Edificio A - Ingeniería',
    distance: '0m',
    duration: '0min',
    type: 'start'
  },
  {
    id: '2', 
    instruction: 'Camina hacia el sur por el sendero principal',
    distance: '120m',
    duration: '2min',
    type: 'straight'
  },
  {
    id: '3',
    instruction: 'Gira a la izquierda hacia la plaza central',
    distance: '80m', 
    duration: '1min',
    type: 'turn'
  },
  {
    id: '4',
    instruction: 'Continúa recto hasta llegar a la Biblioteca Central',
    distance: '150m',
    duration: '2min',
    type: 'destination'
  }
];

export const RouteInstructions = ({
  origin,
  destination,
  isCalculating = false,
  routeSteps = sampleSteps,
  totalDistance = "350m",
  totalDuration = "5min"
}: RouteInstructionsProps) => {
  
  const getStepIcon = (type: RouteStep['type']) => {
    switch (type) {
      case 'start':
        return <MapPin className="h-4 w-4 text-green-600" />;
      case 'destination':
        return <MapPin className="h-4 w-4 text-accent" />;
      case 'turn':
        return <Navigation className="h-4 w-4 text-primary" />;
      default:
        return <Route className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!origin || !destination) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="p-8 text-center max-w-md">
          <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Selecciona tu ruta</h3>
          <p className="text-muted-foreground">
            Elige un punto de origen y destino en el panel lateral para calcular la mejor ruta.
          </p>
        </Card>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Calculando ruta...</h3>
          <p className="text-muted-foreground">
            Estamos encontrando la mejor ruta para ti.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Route Summary */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Instrucciones de Ruta</h2>
          <div className="flex gap-2">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {totalDuration}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Route className="h-3 w-3" />
              {totalDistance}
            </Badge>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{origin}</span>
          <span className="mx-2">→</span>
          <span className="font-medium text-foreground">{destination}</span>
        </div>
      </Card>

      {/* Route Steps */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {routeSteps.map((step, index) => (
            <Card key={step.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getStepIcon(step.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Paso {index + 1}
                    </span>
                    <div className="flex gap-2 text-xs">
                      <span className="text-muted-foreground">{step.distance}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{step.duration}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium">
                    {step.instruction}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <Card className="mt-4 p-3 bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          💡 Tip: Haz clic en cualquier edificio del mapa para ver más información
        </p>
      </Card>
    </div>
  );
};