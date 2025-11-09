import { useState, useEffect, useCallback } from 'react';
import { getComentariosByLugar, createComentario, updateComentario, deleteComentario } from '@/lib/api';

export interface Comentario {
  id: number;
  id_usuario: number;
  id_lugar: number;
  descripcion: string;
  usuario: {
    id: number;
    nombre: string;
  };
}

export interface UseComentariosReturn {
  comentarios: Comentario[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addComentario: (userId: number, lugarId: number, descripcion: string) => Promise<boolean>;
  editComentario: (comentarioId: number, userId: number, descripcion: string) => Promise<boolean>;
  removeComentario: (comentarioId: number, userId: number) => Promise<boolean>;
}

export const useComentarios = (lugarId: number | null): UseComentariosReturn => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComentarios = useCallback(async () => {
    if (!lugarId) {
      setComentarios([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getComentariosByLugar(lugarId);

      if (result.success) {
        setComentarios(result.data || []);
      } else {
        setError(result.error || 'Error al cargar comentarios');
        setComentarios([]);
      }
    } catch (err) {
      console.error('Error in useComentarios:', err);
      setError('Error al cargar comentarios');
      setComentarios([]);
    } finally {
      setLoading(false);
    }
  }, [lugarId]);

  useEffect(() => {
    fetchComentarios();
  }, [fetchComentarios]);

  // Agregar comentario
  const addComentario = useCallback(async (
    userId: number,
    lugarId: number,
    descripcion: string
  ): Promise<boolean> => {
    try {
      const result = await createComentario(userId, lugarId, descripcion);

      if (result.success) {
        await fetchComentarios(); // Refrescar lista
        return true;
      } else {
        setError(result.message || result.error || 'Error al agregar comentario');
        return false;
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Error al agregar comentario');
      return false;
    }
  }, [fetchComentarios]);

  // Editar comentario
  const editComentario = useCallback(async (
    comentarioId: number,
    userId: number,
    descripcion: string
  ): Promise<boolean> => {
    try {
      const result = await updateComentario(comentarioId, userId, descripcion);

      if (result.success) {
        await fetchComentarios(); // Refrescar lista
        return true;
      } else {
        setError(result.message || result.error || 'Error al editar comentario');
        return false;
      }
    } catch (err) {
      console.error('Error editing comment:', err);
      setError('Error al editar comentario');
      return false;
    }
  }, [fetchComentarios]);

  // Eliminar comentario
  const removeComentario = useCallback(async (
    comentarioId: number,
    userId: number
  ): Promise<boolean> => {
    try {
      const result = await deleteComentario(comentarioId, userId);

      if (result.success) {
        await fetchComentarios(); // Refrescar lista
        return true;
      } else {
        setError(result.message || result.error || 'Error al eliminar comentario');
        return false;
      }
    } catch (err) {
      console.error('Error removing comment:', err);
      setError('Error al eliminar comentario');
      return false;
    }
  }, [fetchComentarios]);

  return {
    comentarios,
    loading,
    error,
    refetch: fetchComentarios,
    addComentario,
    editComentario,
    removeComentario,
  };
};