import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Ejecuta fetchFn al montar y cada `intervalMs` (default 30s).
 * Devuelve segundos desde la última actualización exitosa.
 */
export function usePolling(fetchFn, intervalMs = 30000, deps = []) {
  const [segundosDesdeUpdate, setSegundosDesdeUpdate] = useState(0);
  const [loading, setLoading] = useState(true);
  const lastUpdateRef = useRef(Date.now());
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const ejecutar = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      await fetchRef.current();
      lastUpdateRef.current = Date.now();
      setSegundosDesdeUpdate(0);
    } catch (err) {
      console.error('Polling error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    ejecutar();
    const pollInterval = setInterval(() => ejecutar(true), intervalMs);
    const tickInterval = setInterval(() => {
      setSegundosDesdeUpdate(Math.floor((Date.now() - lastUpdateRef.current) / 1000));
    }, 1000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(tickInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ejecutar, ...deps]);

  return { segundosDesdeUpdate, loading, refrescar: ejecutar };
}
