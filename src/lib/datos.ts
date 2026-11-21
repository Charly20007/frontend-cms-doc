import { useCallback, useEffect, useState } from 'react';
import { api, mensajeError } from './api';
import type { Catalogos, Configuracion } from './tipos';

/** Carga un recurso GET de la API con estados de carga y error. */
export function useDatos<T>(url: string | null) {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState<boolean>(!!url);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!url) return;
    setCargando(true);
    setError(null);
    try {
      const { data } = await api.get<T>(url);
      setDatos(data);
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los datos.'));
    } finally {
      setCargando(false);
    }
  }, [url]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { datos, setDatos, cargando, error, recargar };
}

// Cachés compartidas: la configuración y los catálogos cambian poco
let configCache: Promise<Configuracion> | null = null;
let catalogosCache: Promise<Catalogos> | null = null;

export function invalidarCaches() {
  configCache = null;
  catalogosCache = null;
}

function useCacheado<T>(obtener: () => Promise<T>) {
  const [valor, setValor] = useState<T | null>(null);
  useEffect(() => {
    let activo = true;
    obtener().then((v) => activo && setValor(v)).catch(() => undefined);
    return () => {
      activo = false;
    };
  }, [obtener]);
  return valor;
}

const obtenerConfig = () => (configCache ??= api.get<Configuracion>('/api/configuracion').then((r) => r.data).catch((e) => { configCache = null; throw e; }));
const obtenerCatalogos = () => (catalogosCache ??= api.get<Catalogos>('/api/admin/catalogos').then((r) => r.data).catch((e) => { catalogosCache = null; throw e; }));

export const useConfigSitio = () => useCacheado(obtenerConfig);
export const useCatalogos = () => useCacheado(obtenerCatalogos);
