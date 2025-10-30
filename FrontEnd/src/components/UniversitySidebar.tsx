import { useEffect, useState } from "react";
import { Heart, User, Building, Loader2, Route, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/lib/supabaseClient";
import { getUsuarioById } from "@/lib/api"; 
import { toast } from "sonner";

interface UniversitySidebarProps {
  onFavoritesClick: () => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  route: any[];
}

export const UniversitySidebar = ({
  onFavoritesClick,
  selectedCategory,
  onCategoryChange,
  route
}: UniversitySidebarProps) => {
  const { categories, loading, error } = useCategories();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // --- 1️⃣ Obtener sesión actual y datos del usuario ---
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // --- 2️⃣ Obtener perfil completo desde la API ---
        setLoadingProfile(true);
        try {
          const response = await getUsuarioById(session.user.id);
          
          console.log('Response completa:', response); // 🔍 Debug
          
          if (response.success && response.data) {
            console.log('✅ Datos del usuario:', response.data);
            console.log('✅ Nombre:', response.data.nombre);
            console.log('✅ Rol:', response.data.rol);
            setUserProfile(response.data);
          } else {
            console.error('❌ Error al obtener perfil:', response.error);
            toast.error('No se pudo cargar el perfil del usuario');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          toast.error('Error al cargar el perfil');
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    getUser();

    // --- 3️⃣ Escuchar cambios de sesión (login/logout) ---
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // Cargar perfil cuando hay nueva sesión
        setLoadingProfile(true);
        try {
          const response = await getUsuarioById(session.user.id);
          if (response.success && response.data) {
            const userData = response.data.data || response.data;
            setUserProfile(userData);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
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

  // --- 4️⃣ Cerrar sesión ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada correctamente");
    setUser(null);
    setUserProfile(null);
  };

  // 🔍 Debug: Ver el estado actual
  console.log('Estado userProfile:', userProfile);

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
              <SelectItem value="all"> Ninguna</SelectItem>
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
      <div className="flex-1 p-4 pt-2 space-y-4 min-h-0">
        <Card className="p-4 shadow-sm h-full flex flex-col min-h-0">
          <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2 flex-shrink-0">
            <Route className="h-4 w-4 text-primary" />
            Indicaciones de Ruta
          </h3>
          
          {route.length > 0 ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                {route.map((node, index) => (
                  <div key={node.id} className="flex items-start gap-3 p-2 rounded-lg bg-secondary/50 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      {node.type === 'building' ? (
                        <div>
                          <div className="font-medium text-sm">{node.name}</div>
                          <div className="text-xs text-muted-foreground">Edificio</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-sm">Punto de paso {index}</div>
                          <div className="text-xs text-muted-foreground">Continúa por esta dirección</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-2 border-t border-border mt-2 flex-shrink-0">
                <div className="text-xs text-muted-foreground">
                  Tiempo estimado: {Math.ceil(route.length * 2)} minutos
                </div>
                <div className="text-xs text-muted-foreground">
                  Distancia aproximada: {Math.ceil(route.length * 50)} metros
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="text-center">
                <Route className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Selecciona origen y destino arriba para ver las indicaciones de ruta
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
                
                {/* Tooltip */}
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