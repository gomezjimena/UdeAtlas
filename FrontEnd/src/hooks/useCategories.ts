import { useState, useEffect } from 'react';
import { getTipoLugarCategories } from '@/lib/api';

export interface Category {
  id: number;
  nombre: string;
}

export interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getTipoLugarCategories();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        setError(result.error || 'Error al cargar las categorías');
      }
    } catch (err) {
      setError('Error de conexión al cargar las categorías');
      console.error('Error in useCategories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
