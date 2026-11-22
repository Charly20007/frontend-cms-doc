import { useEffect, useState } from 'react';
import { api } from './api';

const EVENTO = 'cms:testimonios-cambiaron';

/** Avisa al menú y al resumen que cambió algo en testimonios (para refrescar el contador). */
export const avisarCambioTestimonios = () => window.dispatchEvent(new Event(EVENTO));

/**
 * Cantidad de testimonios enviados desde la web que esperan revisión.
 * Se actualiza cada minuto y cada vez que se aprueba o rechaza uno.
 */
export function useTestimoniosPendientes(activo: boolean) {
  const [cantidad, setCantidad] = useState(0);

  useEffect(() => {
    if (!activo) return;
    let vigente = true;
    const cargar = () =>
      api.get<{ cantidad: number }>('/api/admin/testimonios/pendientes')
        .then((r) => vigente && setCantidad(r.data.cantidad))
        .catch(() => undefined);

    void cargar();
    const intervalo = window.setInterval(cargar, 60_000);
    window.addEventListener(EVENTO, cargar);
    return () => {
      vigente = false;
      window.clearInterval(intervalo);
      window.removeEventListener(EVENTO, cargar);
    };
  }, [activo]);

  return cantidad;
}
