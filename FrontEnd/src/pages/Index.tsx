import { useState } from "react";
import { UniversitySidebar } from "@/components/UniversitySidebar";
import { UniversityMap } from "@/components/UniversityMap";
import { RouteInstructions } from "@/components/RouteInstructions";
import { BuildingModal } from "@/components/BuildingModal";
import { useToast } from "@/hooks/use-toast";

interface Building {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  facilities: string[];
  hours: string;
  contact: string;
}

interface MapNode {
  id: string;
  x: number;
  y: number;
  type: 'pass' | 'building';
  name?: string;
}

const Index = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState<MapNode[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const { toast } = useToast();

  const handleCalculateRoute = async () => {
    if (!origin || !destination) {
      toast({
        title: "Error",
        description: "Por favor selecciona origen y destino",
        variant: "destructive"
      });
      return;
    }

    if (origin === destination) {
      toast({
        title: "Error", 
        description: "El origen y destino no pueden ser iguales",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    // Simulate route calculation
    setTimeout(() => {
      // Sample route nodes for demo
      const sampleRoute: MapNode[] = [
        { id: '1', x: 200, y: 150, type: 'building', name: origin },
        { id: 'p1', x: 300, y: 175, type: 'pass' },
        { id: 'p2', x: 400, y: 200, type: 'pass' },
        { id: '2', x: 400, y: 200, type: 'building', name: destination },
      ];
      
      setRoute(sampleRoute);
      setIsCalculating(false);
      
      toast({
        title: "Ruta calculada",
        description: `Ruta de ${origin} a ${destination} encontrada`,
      });
    }, 2000);
  };

  const handleFavoritesClick = () => {
    toast({
      title: "Favoritos",
      description: "Funcionalidad disponible después de conectar Supabase",
    });
  };

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
    setIsBuildingModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <UniversitySidebar
        origin={origin}
        destination={destination}
        onOriginChange={setOrigin}
        onDestinationChange={setDestination}
        onCalculateRoute={handleCalculateRoute}
        onFavoritesClick={handleFavoritesClick}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Map */}
      <div className="flex-1">
        <UniversityMap
          route={route}
          onBuildingClick={handleBuildingClick}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* Building Modal */}
      <BuildingModal
        building={selectedBuilding}
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
      />
    </div>
  );
};

export default Index;
