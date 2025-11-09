import { useState, useEffect, useCallback } from 'react';
import { getEventosByLugar, createEvento, updateEvento, deleteEvento } from '@/lib/api';

export interface Evento {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_evento: string;
  fecha_creacion: string;
  id_usuario_admin: number;
  id_lugar: number;
  usuarioAdmin: {
    id: number;
    nombre: string;
  };
}

export interface UseEventosReturn {
  eventos: Evento[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addEvento: (
    adminId: number,
    lugarId: number,
    titulo: string,
    descripcion: string | null,
    fechaEvento: string
  ) => Promise<boolean>;
  editEvento: (
    eventoId: number,
    adminId: number,
    titulo?: string,
    descripcion?: string | null,
    fechaEvento?: string
  ) => Promise<boolean>;
  removeEvento: (eventoId: number, adminId: number) => Promise<boolean>;
}

export const useEventos = (lugarId: number | null): UseEventosReturn => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = useCallback(async () => {
    if (!lugarId) {
      setEventos([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getEventosByLugar(lugarId);

      if (result.success) {
        setEventos(result.data || []);
      } else {
        setError(result.error || 'Error al cargar eventos');
        setEventos([]);
      }
    } catch (err) {
      console.error('Error in useEventos:', err);
      setError('Error al cargar eventos');
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, [lugarId]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  // Agregar evento (solo admins)
  const addEvento = useCallback(async (
    adminId: number,
    lugarId: number,
    titulo: string,
    descripcion: string | null,
    fechaEvento: string
  ): Promise<boolean> => {
    try {
      const result = await createEvento(adminId, lugarId, titulo, descripcion, fechaEvento);

      if (result.success) {
        await fetchEventos(); // Refrescar lista
        return true;
      } else {
        setError(result.message || result.error || 'Error al agregar evento');
        return false;
      }
    } catch (err) {
      console.error('Error adding event:', err);
      setError('Error al agregar evento');
      return false;
    }
  }, [fetchEventos]);

  // Editar evento (solo admins)
  const editEvento = useCallback(async (
    eventoId: number,
    adminId: number,
    titulo?: string,
    descripcion?: string | null,
    fechaEvento?: string
  ): Promise<boolean> => {
    try {
      const result = await updateEvento(eventoId, adminId, titulo, descripcion, fechaEvento);

      if (result.success) {
        await fetchEventos(); // Refrescar lista
        return true;
      } else {
        setError(result.message || result.error || 'Error al editar evento');
        return false;
      }
    } catch (err) {
      console.error('Error editing event:', err);
      setError('Error al editar evento');
      return false;
    }
  }, [fetchEventos]);

  // Eliminar evento (solo admins)
  const removeEvento = useCallback(async (
    eventoId: number,
    adminId: number
  ): Promise<boolean> => {
    try {
      const result = await deleteEvento(eventoId, adminId);

      if (result.success) {
        await fetchEventos(); // Refrescar lista
        return true;
      } else {
        setError(result.message || result.error || 'Error al eliminar evento');
        return false;
      }
    } catch (err) {
      console.error('Error removing event:', err);
      setError('Error al eliminar evento');
      return false;
    }
  }, [fetchEventos]);

  return {
    eventos,
    loading,
    error,
    refetch: fetchEventos,
    addEvento,
    editEvento,
    removeEvento,
  };
};