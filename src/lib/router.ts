import { useEffect, useState } from 'react';

/**
 * Enrutador mínimo basado en el hash (#/procedimientos/5).
 * Permite recargar la página sin perder la pantalla y enlazar desde el dashboard.
 */
export function useRuta(): string[] {
  const leer = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [ruta, setRuta] = useState<string[]>(leer);

  useEffect(() => {
    const alCambiar = () => setRuta(leer());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  return ruta;
}

export function navegar(ruta: string) {
  window.location.hash = ruta.startsWith('/') ? ruta : `/${ruta}`;
}

export const WEB_URL = ((import.meta.env.VITE_WEB_URL as string | undefined) ?? 'http://localhost:3000').replace(/\/$/, '');
