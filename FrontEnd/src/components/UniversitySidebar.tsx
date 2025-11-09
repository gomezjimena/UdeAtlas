import { useEffect, useState } from "react";
import { Heart, User, Building, Loader2, Route, LogOut, Navigation, Clock, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/lib/supabaseClient";
import { getUsuarioById, RutaCalculada } from "@/lib/api"; 
import { toast } from "sonner";

interface UniversitySidebarProps {
  onFavoritesClick: () => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  ruta: RutaCalculada | null;
  isCalculating: boolean;
  cached?: boolean;
}

export const UniversitySidebar = ({
  onFavoritesClick,
  selectedCategory,
  onCategoryChange,
  ruta,
  isCalculating,
  cached = false
}: UniversitySidebarProps) => {
  const { categories, loading, error } = useCategories();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Obtener sesión actual y datos del usuario
  useEffect(() => {
    const getUser = async () => {
      try {
        setLoadingProfile(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setUser(null);
          setUserProfile(null);
          setLoadingProfile(false);
          return;
        }
  
        setUser(session.user);
  
        // Obtener el perfil del usuario
        const userResult = await getUsuarioById(session.user.id);
        
        if (userResult.success && userResult.data) {
          console.log('✅ Perfil cargado:', userResult.data);
          setUserProfile(userResult.data);
        } else {
          console.error('❌ Error al cargar perfil:', userResult.error);
          toast.error('No se pudo cargar el perfil del usuario');
          setUserProfile(null);
        }
      } catch (error) {
        console.error('💥 Error en getUser:', error);
        toast.error('Error al cargar el perfil');
        setUserProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    getUser();
  
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        setLoadingProfile(true);
        try {
          const response = await getUsuarioById(session.user.id);
          if (response.success && response.data) {
            setUserProfile(response.data);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });
  
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada correctamente");
    setUser(null);
    setUserProfile(null);
  };

  // Calcular tiempo estimado (80m/min velocidad promedio caminando)
  const tiempoEstimado = ruta ? Math.ceil(ruta.distanciaTotal / 80) : 0;

  return (
    <div className="w-80 h-screen bg-gradient-to-b from-background to-secondary border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          UdeAtlas
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
      <div className="px-4 pb-2">
        <Card className="p-4 shadow-sm">
          <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            Categorías
          </h3>
          
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ninguna</SelectItem>
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

      {/* Route Instructions */}
      <div className="flex-1 p-4 pt-2 space-y-4 min-h-0 overflow-hidden">
        <Card className="p-4 shadow-sm h-full flex flex-col min-h-0">
          <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2 flex-shrink-0">
            <Route className="h-4 w-4 text-primary" />
            Indicaciones de Ruta
          </h3>
          
          {isCalculating ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Calculando la mejor ruta...
                </p>
              </div>
            </div>
          ) : ruta && ruta.lugares.length > 0 ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Resumen de la ruta */}
              <div className="bg-primary/5 rounded-lg p-3 mb-3 flex-shrink-0">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Navigation className="h-3 w-3" />
                    </div>
                    <div className="text-xs font-semibold">{ruta.lugares.length}</div>
                    <div className="text-[10px] text-muted-foreground">Paradas</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                    <div className="text-xs font-semibold">{ruta.distanciaTotal.toFixed(0)}m</div>
                    <div className="text-[10px] text-muted-foreground">Distancia</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Clock className="h-3 w-3" />
                    </div>
                    <div className="text-xs font-semibold">~{tiempoEstimado} min</div>
                    <div className="text-[10px] text-muted-foreground">Tiempo</div>
                  </div>
                </div>
                
                {cached && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] text-green-600 font-medium">Ruta guardada en caché</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de lugares en la ruta */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                {ruta.lugares.map((lugar, index) => {
                  const isOrigen = index === 0;
                  const isDestino = index === ruta.lugares.length - 1;
                  const distanciaSegmento = index < ruta.conexiones.length 
                    ? ruta.conexiones[index].distancia 
                    : null;

                  return (
                    <div key={lugar.id} className="flex-shrink-0">
                      <div className="flex items-start gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0 ${
                          isOrigen ? 'bg-green-500 text-white' :
                          isDestino ? 'bg-red-500 text-white' :
                          'bg-primary text-primary-foreground'
                        }`}>
                          {isOrigen ? <MapPin className="h-3 w-3" /> :
                           isDestino ? <MapPin className="h-3 w-3" /> :
                           index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{lugar.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {isOrigen ? 'Punto de inicio' :
                             isDestino ? 'Destino final' :
                             'Punto intermedio'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Indicador de distancia al siguiente punto */}
                      {distanciaSegmento !== null && !isDestino && (
                        <div className="flex items-center gap-2 pl-9 py-1">
                          <div className="w-0.5 h-4 bg-primary/30"></div>
                          <span className="text-[10px] text-muted-foreground">
                            ↓ {distanciaSegmento.toFixed(0)}m
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="text-center px-4">
                <Route className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Selecciona origen y destino arriba para calcular tu ruta
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <Card className="p-4">
          {loadingProfile ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Cargando...</p>
                <p className="text-xs text-muted-foreground">Obteniendo perfil</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors relative group"
                onClick={user ? handleLogout : undefined}
                title={user ? "Cerrar sesión" : "Usuario invitado"}
              >
                {user ? <LogOut className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-primary" />}
                
                {user && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border">
                    Cerrar sesión
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {user ? (userProfile?.nombre || "Sin nombre") : "Usuario Invitado"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user 
                    ? (userProfile?.rol?.nombre || "Sin rol asignado") 
                    : "Click para iniciar sesión"
                  }
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};