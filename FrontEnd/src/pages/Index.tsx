import { useState } from "react";
import { UniversitySidebar } from "@/components/UniversitySidebar";
import { UniversityMap } from "@/components/UniversityMap";
import { RouteControls } from "@/components/RouteControls";
import { useToast } from "@/hooks/use-toast";
import { useLugares } from "@/hooks/useLugares";
import { FavoritesView } from "@/components/FavoritesView";

const Index = () => {
  const { lugares } = useLugares();
  
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [view, setView] = useState<"map" | "favorites">("map");
  
  // 🔹 Key para forzar re-render de FavoritesView
  const [favoritesKey, setFavoritesKey] = useState(0);

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

    setTimeout(() => {
      const sampleRoute = [
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
    setView(view === "favorites" ? "map" : "favorites");
  };

  const handleSwapRoute = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setRoute([]);
  };

  // 🔹 Callback para refrescar favoritos
  const handleFavoriteChange = () => {
    setFavoritesKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <UniversitySidebar
        onFavoritesClick={handleFavoritesClick}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        route={route}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <RouteControls
          origin={origin}
          destination={destination}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
          onCalculateRoute={handleCalculateRoute}
          onSwapRoute={handleSwapRoute}
          isCalculating={isCalculating}
        />

        <div className="flex-1">
          {view === "map" ? (
            <UniversityMap 
              selectedCategory={selectedCategory}
              onFavoriteChange={handleFavoriteChange}
            />
          ) : (
            <FavoritesView 
              key={favoritesKey} 
              onBackToMap={() => setView("map")} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;