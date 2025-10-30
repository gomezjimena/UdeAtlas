import { useState, useEffect, useCallback } from 'react';
import { getFavoritosByUser } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';

export interface Favorito {
  id: number;
  id_usuario: number;
  id_lugar: number;
  lugar: {
    id: number;
    nombre: string;
    descripcion: string | null;
    imagen: string | null;
  };
}

export interface UseFavoritesReturn {
  favorites: Favorito[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  userId: number | null;
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setFavorites([]);
        setUserId(null);
        setLoading(false);
        return;
      }

      // Obtener el id numérico del usuario desde tu tabla tbl_Usuario
      const { data: userData, error: userError } = await supabase
        .from('tbl_Usuario')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        console.log('Usuario no encontrado en tbl_Usuario, posiblemente no está logueado');
        setFavorites([]);
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(userData.id);

      // Obtener favoritos del usuario
      const result = await getFavoritosByUser(userData.id);
      
      if (result.success) {
        setFavorites(result.data || []);
      } else {
        setError(result.error || 'Error al cargar los favoritos');
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error in useFavorites:', err);
      // No mostrar error si simplemente no hay usuario
      setFavorites([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    refetch: fetchFavorites,
    userId,
  };
};