import { useState, useEffect } from 'react';
import { getAllLugares } from '@/lib/api';

export interface Lugares {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  x_coord?: number | null;
  y_coord?: number | null;
  id_tipo_lugar?: number;
}

export interface UseLugaresReturn {
  lugares: Lugares[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useLugares = (): UseLugaresReturn => {
  const [lugares, setLugares] = useState<Lugares[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLugares = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAllLugares();
      
      if (result.success) {
        setLugares(result.data);
      } else {
        setError(result.error || 'Error al cargar los lugares');
      }
    } catch (err) {
      setError('Error de conexión al cargar los lugares');
      console.error('Error in useLugares:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLugares();
  }, []);

  return {
    lugares,
    loading,
    error,
    refetch: fetchLugares,
  };
};
