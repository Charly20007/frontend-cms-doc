import React from 'react';
import { Clock, ExternalLink, Plus, Star } from 'lucide-react';
import { useDatos } from '../../lib/datos';
import { navegar, WEB_URL } from '../../lib/router';
import type { ServicioDetalle } from '../../lib/tipos';
import { Boton, EncabezadoPagina, Etiqueta, MensajeError } from '../../components/ui/Formulario';
import { LoadingFallback } from '../../components/LoadingFallback';
import { api } from '../../lib/api';
import { revisarSeo } from '../../lib/seo';

export const ProcedimientosLista: React.FC = () => {
  // Se cargan los detalles para poder mostrar el estado SEO de cada procedimiento
  const { datos, cargando, error, recargar } = useDatos<{ id: number }[]>('/api/admin/servicios');
  const [detalles, setDetalles] = React.useState<ServicioDetalle[] | null>(null);

  React.useEffect(() => {
    if (!datos) return;
    Promise.all(datos.map((s) => api.get<ServicioDetalle>(`/api/admin/servicios/${s.id}`).then((r) => r.data)))
      .then(setDetalles)
      .catch(() => setDetalles([]));
  }, [datos]);

  return (
    <div>
      <EncabezadoPagina
        titulo="Procedimientos"
        descripcion="Cada procedimiento tiene su propia página en la web. Edite su contenido y cómo aparece en Google."
        acciones={<Boton icono={<Plus className="w-4 h-4" />} onClick={() => navegar('procedimientos/nuevo')}>Nuevo procedimiento</Boton>}
      />

      {error && <MensajeError mensaje={error} reintentar={recargar} />}
      {(cargando || (datos && !detalles)) && !error && <LoadingFallback texto="Cargando procedimientos..." />}

      {detalles && (
        <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-navy-950 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="text-left py-3 px-5">Procedimiento</th>
                <th className="text-left py-3 px-5 hidden md:table-cell">Contenido</th>
                <th className="text-left py-3 px-5">SEO</th>
                <th className="py-3 px-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {detalles.map((s) => {
                const revision = revisarSeo(s.seo);
                const bloques = s.introduccion.length + s.indicaciones.length + s.pasos.length + s.recuperacion.length + s.preguntas.length;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer" onClick={() => navegar(`procedimientos/${s.id}`)}>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {s.destacadoEnWeb && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" aria-label="Destacado" />}
                        {s.nombre}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3">
                        <span>/procedimientos/{s.slug}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.tiempoEstimadoMinutos} min</span>
                        {s.precioReferencial != null && <span>S/ {s.precioReferencial.toLocaleString('es-PE')}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-5 hidden md:table-cell text-xs text-slate-600 dark:text-slate-300">
                      {bloques} bloques · {s.preguntas.length} preguntas
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col items-start gap-1">
                        {revision.nivel === 'ok' ? <Etiqueta color="verde">Completo</Etiqueta> : (
                          <Etiqueta color={revision.nivel === 'error' ? 'rojo' : 'ambar'}>{revision.problemas[0]}</Etiqueta>
                        )}
                        {!s.seo.indexable && <Etiqueta color="gris">Oculto en Google</Etiqueta>}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <a
                        href={`${WEB_URL}/procedimientos/${s.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Ver en la web"
                        className="inline-flex p-2 rounded-lg text-slate-400 hover:text-medical-600"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {detalles.length === 0 && <p className="py-12 text-center text-sm text-slate-500">Aún no hay procedimientos.</p>}
        </div>
      )}
    </div>
  );
};
