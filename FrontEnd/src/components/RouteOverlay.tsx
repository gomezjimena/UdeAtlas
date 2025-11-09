import { RutaCalculada } from "@/lib/api";

interface RouteOverlayProps {
  ruta: RutaCalculada;
  scale: number;
  position: { x: number; y: number };
}

export const RouteOverlay = ({ ruta, scale, position }: RouteOverlayProps) => {
  if (!ruta || ruta.lugares.length < 2) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
        transformOrigin: 'center center'
      }}
    >
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="markerShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Líneas de conexión entre lugares */}
        {ruta.lugares.map((lugar, i) => {
          if (i === ruta.lugares.length - 1) return null;
          
          const siguiente = ruta.lugares[i + 1];
          
          const x1 = `${lugar.x_coord}%`;
          const y1 = `${lugar.y_coord}%`;
          const x2 = `${siguiente.x_coord}%`;
          const y2 = `${siguiente.y_coord}%`;

          return (
            <g key={`route-segment-${i}`}>
              {/* Línea de borde blanco - MISMA proporción 1:1 */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#ffffff"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Línea principal azul - cubriendo casi todo el blanco */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#3b82f6"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}

        {/* Marcadores con iconos solo para origen y destino */}
        {ruta.lugares.map((lugar, i) => {
          const isOrigen = i === 0;
          const isDestino = i === ruta.lugares.length - 1;
          
          if (!isOrigen && !isDestino) return null;
          
          return (
            <g key={`marker-${lugar.id}`} filter="url(#markerShadow)">
              <g transform={`translate(calc(${lugar.x_coord}% - 12px), calc(${lugar.y_coord}% - 24px))`}>
                {/* Forma del pin */}
                <path
                  d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9z"
                  fill={isOrigen ? "#22c55e" : "#ef4444"}
                  stroke="white"
                  strokeWidth="2"
                />
                
                {/* Círculo interior blanco del pin */}
                <circle
                  cx="12"
                  cy="9"
                  r="4"
                  fill="white"
                />
                
                {/* Punto interior del pin */}
                <circle
                  cx="12"
                  cy="9"
                  r="2"
                  fill={isOrigen ? "#22c55e" : "#ef4444"}
                />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

