import { useState, useCallback } from 'react';
import { getRutaExistente, calcularRuta, guardarRuta, RutaCalculada } from '@/lib/api';

export interface UseRutasReturn {
  ruta: RutaCalculada | null;
  loading: boolean;
  error: string | null;
  cached: boolean;
  obtenerRuta: (origenId: number, destinoId: number) => Promise<boolean>;
  limpiarRuta: () => void;
}

export const useRutas = (): UseRutasReturn => {
  const [ruta, setRuta] = useState<RutaCalculada | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  /**
   * Obtiene una ruta entre dos lugares
   * 1. Busca en BD si existe (caché)
   * 2. Si no existe, calcula con Dijkstra
   * 3. Guarda la ruta calculada en BD
   */
  const obtenerRuta = useCallback(async (
    origenId: number,
    destinoId: number
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setCached(false);
  
      console.log(' [useRutas] Buscando ruta en caché...');
      console.log('   Origen:', origenId);
      console.log('   Destino:', destinoId);
    
      // 1️ Intentar obtener ruta desde caché
      const rutaCache = await getRutaExistente(origenId, destinoId);
      console.log(' [useRutas] Resultado caché:', rutaCache);
  
      if (rutaCache.success && rutaCache.cached) {
        console.log(' [useRutas] Ruta encontrada en caché');
        setRuta(rutaCache.data);
        setCached(true);
        setLoading(false);
        return true;
      }
  
      console.log('[useRutas] Calculando nueva ruta...');
  
      // 2️ Calcular nueva ruta con Dijkstra
      const rutaCalculadaResult = await calcularRuta(origenId, destinoId);
      console.log('📊 [useRutas] Resultado cálculo:', rutaCalculadaResult);
  
      if (!rutaCalculadaResult.success) {
        const errorMsg = rutaCalculadaResult.message || rutaCalculadaResult.error || 'No se pudo calcular la ruta';
        console.error(' [useRutas] Error al calcular:', errorMsg);
        setError(errorMsg);
        setRuta(null);
        setLoading(false);
        return false;
      }
  
      const rutaCalculadaData = rutaCalculadaResult.data;
      console.log(' [useRutas] Ruta calculada exitosamente');
      console.log('   Lugares:', rutaCalculadaData.lugares);
      console.log('   Conexiones:', rutaCalculadaData.conexiones);
      console.log('   Distancia total:', rutaCalculadaData.distanciaTotal);
      
      setRuta(rutaCalculadaData);
      setCached(false);
  
      // 3️ Guardar ruta en BD para futuros usos
      const conexionesIds = rutaCalculadaData.conexiones.map(c => c.id);
      
      console.log(' [useRutas] Guardando ruta en BD...');
      guardarRuta(
        origenId,
        destinoId,
        rutaCalculadaData.distanciaTotal,
        conexionesIds
      ).then(result => {
        if (result.success) {
          console.log('[useRutas] Ruta guardada en caché');
        } else {
          console.warn(' [useRutas] No se pudo guardar en caché:', result);
        }
      }).catch(err => {
        console.warn(' [useRutas] Error guardando en caché:', err);
      });
  
      setLoading(false);
      return true;
  
    } catch (err) {
      console.error(' [useRutas] Error crítico:', err);
      setError('Error al obtener la ruta');
      setRuta(null);
      setLoading(false);
      return false;
    }
  }, []);

  /**
   * Limpia la ruta actual
   */
  const limpiarRuta = useCallback(() => {
    setRuta(null);
    setError(null);
    setCached(false);
  }, []);

  return {
    ruta,
    loading,
    error,
    cached,
    obtenerRuta,
    limpiarRuta,
  };
};