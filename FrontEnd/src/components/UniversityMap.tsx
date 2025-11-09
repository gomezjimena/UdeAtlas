import { useState, useRef } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import universityMapImage from "@/assets/mapa3.jpg";
import { useLugares } from "@/hooks/useLugares";
import { getLugarById, RutaCalculada } from "@/lib/api"; 
import { LugarModal } from "@/components/LugarModal"; 
import { MapPin } from "lucide-react";
import { RouteOverlay } from "@/components/RouteOverlay";

interface MapNode {
  id: string;
  x: number;
  y: number;
  id_tipo_lugar: number;
  name?: string;
}

interface UniversityMapProps {
  selectedCategory?: string;
  onFavoriteChange?: () => void;
  ruta?: RutaCalculada | null;
}

export const UniversityMap = ({ selectedCategory, onFavoriteChange, ruta }: UniversityMapProps) => {
  const { lugares, loading, error } = useLugares();

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [selectedLugar, setSelectedLugar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMarkerClick = async (id: string) => {
    console.log("🔹 Clic en marcador, ID:", id);
    
    try {
      console.log("📡 Llamando a getLugarById...");
      const response = await getLugarById(Number(id));
      
      console.log(" Respuesta recibida:", response);
      
      if (response.success) {
        console.log(" Datos del lugar:", response.data);
        setSelectedLugar(response.data);
        setIsModalOpen(true);
        console.log(" Modal debería abrirse ahora");
      } else {
        console.error(" Error al cargar lugar:", response.error);
      }
    } catch (err) {
      console.error(" Error al obtener lugar:", err);
    }
  };

  // Convertir lugares a nodos (solo los que tengan coords válidas y NO sean tipo 7)
  const mapNodes: MapNode[] = (lugares || [])
    .filter(l => 
      l.x_coord !== null && 
      l.x_coord !== undefined && 
      l.y_coord !== null && 
      l.y_coord !== undefined &&
      l.id_tipo_lugar !== 7
    )
    .map(l => ({
      id: String(l.id),
      x: Number(l.x_coord),
      y: Number(l.y_coord),
      id_tipo_lugar: Number(l.id_tipo_lugar),
      name: l.nombre
    }));

  // IDs de lugares que están en la ruta (para resaltarlos)
  const rutaLugarIds = new Set(ruta?.lugares.map(l => String(l.id)) || []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando mapa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm text-red-500">Error cargando lugares: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full h-full bg-secondary overflow-hidden shadow-lg">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
          <Button size="sm" variant="secondary" onClick={handleZoomIn} className="w-10 h-10 p-0 shadow-md">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={handleZoomOut} className="w-10 h-10 p-0 shadow-md">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" onClick={handleReset} className="w-10 h-10 p-0 shadow-md">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Map Container */}
        <div ref={mapRef} className="relative w-full h-full">
          {/* Base Map Image */}
          <img
            src={universityMapImage}
            alt="Mapa de la Universidad"
            className="absolute inset-0 w-full h-full object-fill transition-transform duration-200"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: 'center center'
            }}
            draggable={false}
          />

          {/* Route Overlay */}
          {ruta && (
            <RouteOverlay 
              ruta={ruta} 
              scale={scale} 
              position={position} 
            />
          )}

          {/* Markers */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: 'center center'
            }}
          >
            {mapNodes.map(node => {
              const shouldShowIcon = selectedCategory !== "all" && 
                                    node.id_tipo_lugar === parseInt(selectedCategory);
              
              const isInRoute = rutaLugarIds.has(node.id);
              
              return (
                <div
                  key={node.id}
                  className="absolute pointer-events-auto flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${node.x}%`,   
                    top: `${node.y}%`,    
                  }}
                  onClick={() => handleMarkerClick(node.id)} 
                  title={node.name}
                >
                  {/* Punto del marcador */}
                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow-lg ${
                    isInRoute ? 'bg-purple-500 scale-125' : 
                    shouldShowIcon ? 'bg-accent' : 'bg-primary'
                  }`} />
                  
                  {/* Icono flotante cuando coincide con categoría */}
                  {shouldShowIcon && !isInRoute && (
                    <div className="absolute -top-8 bg-accent rounded-full p-2 shadow-lg animate-bounce">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal fuera del contenedor del mapa */}
      <LugarModal 
        lugar={selectedLugar}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFavoriteChange={onFavoriteChange}
      />
    </>
  );
};