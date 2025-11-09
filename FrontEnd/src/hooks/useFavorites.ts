import { useState, useEffect, useCallback } from 'react';
import { getFavoritosByUser, getUserByAuthId } from '@/lib/api';
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
      
      // Obtener usuario autenticado de Supabase
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 Usuario de Supabase:', user);
      
      if (!user) {
        setFavorites([]);
        setUserId(null);
        setLoading(false);
        return;
      }

      // 🔥 CAMBIO: Obtener usuario desde tu backend en lugar de Supabase
      const userResult = await getUserByAuthId(user.id);
      console.log('🔍 Resultado del backend:', userResult);

      if (!userResult.success || !userResult.data) {
        console.log('Usuario no encontrado en el backend');
        setFavorites([]);
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(userResult.data.id);
      console.log('🔍 userId final:', userResult.data.id);

      // Obtener favoritos del usuario
      const result = await getFavoritosByUser(userResult.data.id);
      console.log('🔍 Resultado de favoritos:', result);
      
      if (result.success) {
        setFavorites(result.data || []);
      } else {
        setError(result.error || 'Error al cargar los favoritos');
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error in useFavorites:', err);
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