import { useState } from "react";
import { UniversitySidebar } from "@/components/UniversitySidebar";
import { UniversityMap } from "@/components/UniversityMap";
import { RouteControls } from "@/components/RouteControls";
import { useToast } from "@/hooks/use-toast";
import { useLugares } from "@/hooks/useLugares";
import { useRutas } from "@/hooks/useRutas";
import { FavoritesView } from "@/components/FavoritesView";

const Index = () => {
  const { lugares } = useLugares();
  
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [view, setView] = useState<"map" | "favorites">("map");
  const [favoritesKey, setFavoritesKey] = useState(0);

  const { toast } = useToast();
  
  // Hook de rutas
  const { ruta, loading: isCalculating, error: rutaError, cached, obtenerRuta, limpiarRuta } = useRutas();

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
  
    console.log(' Iniciando cálculo de ruta');
    console.log(' Origen ID:', origin);
    console.log(' Destino ID:', destination);
  
    const success = await obtenerRuta(Number(origin), Number(destination));
  
    console.log(' Resultado obtenerRuta:', success);
    console.log(' Ruta:', ruta);
    console.log(' Error:', rutaError);
    console.log(' Cached:', cached);
  
    if (success) {
      const origenNombre = lugares.find(l => l.id === Number(origin))?.nombre || "Origen";
      const destinoNombre = lugares.find(l => l.id === Number(destination))?.nombre || "Destino";
      
      toast({
        title: cached ? " Ruta encontrada (caché)" : " Ruta calculada",
        description: `De ${origenNombre} a ${destinoNombre}`,
      });
    } else {
      toast({
        title: " Error",
        description: rutaError || "No se pudo calcular la ruta",
        variant: "destructive"
      });
    }
  };
  const handleFavoritesClick = () => {
    setView(view === "favorites" ? "map" : "favorites");
  };

  const handleSwapRoute = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    limpiarRuta();
  };

  const handleClearRoute = () => {
    setOrigin("");
    setDestination("");
    limpiarRuta();
  };

  const handleFavoriteChange = () => {
    setFavoritesKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar con información de la ruta */}
      <UniversitySidebar
        onFavoritesClick={handleFavoritesClick}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        ruta={ruta}
        isCalculating={isCalculating}
        cached={cached}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <RouteControls
          origin={origin}
          destination={destination}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
          onCalculateRoute={handleCalculateRoute}
          onSwapRoute={handleSwapRoute}
          onClearRoute={handleClearRoute}
          isCalculating={isCalculating}
        />

        <div className="flex-1 overflow-hidden">
          {view === "map" ? (
            <UniversityMap 
              selectedCategory={selectedCategory}
              onFavoriteChange={handleFavoriteChange}
              ruta={ruta}
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