import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpRight, CalendarCheck, CheckCircle2, Clock, Newspaper, Scissors } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { navegar } from '../../lib/router';
import type { Articulo, Cita, PaginaSeo, ServicioDetalle } from '../../lib/tipos';
import { Panel } from '../../components/ui/Formulario';
import { revisarSeo } from '../../lib/seo';

interface Alerta {
  texto: string;
  detalle: string;
  ruta: string;
  nivel: 'error' | 'aviso';
}

export const Dashboard: React.FC = () => {
  const { usuario, puedeEditarContenido } = useAuth();
  const [citas, setCitas] = useState<Cita[] | null>(null);
  const [servicios, setServicios] = useState<ServicioDetalle[] | null>(null);
  const [articulos, setArticulos] = useState<Articulo[] | null>(null);
  const [paginas, setPaginas] = useState<PaginaSeo[] | null>(null);

  useEffect(() => {
    api.get<Cita[]>('/api/citas').then((r) => setCitas(r.data)).catch(() => setCitas([]));
    if (!puedeEditarContenido) return;
    api.get<{ id: number }[]>('/api/admin/servicios')
      .then((r) => Promise.all(r.data.map((s) => api.get<ServicioDetalle>(`/api/admin/servicios/${s.id}`).then((d) => d.data))))
      .then(setServicios).catch(() => setServicios([]));
    api.get<Articulo[]>('/api/admin/blog/articulos').then((r) => setArticulos(r.data)).catch(() => setArticulos([]));
    api.get<PaginaSeo[]>('/api/admin/seo/paginas').then((r) => setPaginas(r.data)).catch(() => setPaginas([]));
  }, [puedeEditarContenido]);

  const hoy = new Date().toDateString();
  const citasHoy = (citas ?? []).filter((c) => new Date(c.fechaHoraInicio).toDateString() === hoy && c.estadoCitaNombre !== 'Cancelada');
  const pendientes = (citas ?? []).filter((c) => c.estadoCitaNombre === 'Pendiente');
  const publicados = (articulos ?? []).filter((a) => a.publicadoEnWeb);

  const alertas: Alerta[] = [
    ...(paginas ?? []).flatMap((p) => {
      const r = revisarSeo(p.seo);
      return r.nivel === 'ok' ? [] : [{ texto: p.nombrePagina, detalle: r.problemas.join(' · '), ruta: 'seo', nivel: r.nivel }];
    }),
    ...(servicios ?? []).flatMap((s) => {
      const r = revisarSeo(s.seo);
      const extra = s.preguntas.length === 0 ? ['Sin preguntas frecuentes'] : [];
      const problemas = [...r.problemas, ...extra];
      return problemas.length === 0 ? [] : [{ texto: s.nombre, detalle: problemas.join(' · '), ruta: `procedimientos/${s.id}`, nivel: r.nivel === 'error' ? 'error' as const : 'aviso' as const }];
    }),
    ...publicados.flatMap((a) => {
      const r = revisarSeo(a.seo);
      return r.nivel === 'ok' ? [] : [{ texto: a.titulo, detalle: r.problemas.join(' · '), ruta: `blog/${a.id}`, nivel: r.nivel }];
    }),
  ].sort((a, b) => (a.nivel === b.nivel ? 0 : a.nivel === 'error' ? -1 : 1));

  const tarjeta = (titulo: string, valor: React.ReactNode, icono: React.ReactNode, pie: string, ruta: string) => (
    <button type="button" onClick={() => navegar(ruta)} className="text-left bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 hover:border-medical-500/50 p-5 rounded-3xl cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{titulo}</span>
        <span className="w-9 h-9 rounded-xl bg-medical-500/10 text-medical-600 dark:text-medical-400 flex items-center justify-center">{icono}</span>
      </div>
      <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{valor ?? '—'}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pie}</div>
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 p-8 rounded-3xl text-white">
        <div>
          <span className="text-xs font-bold text-medical-400 uppercase tracking-widest block mb-1">Panel de control</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Hola, {usuario?.nombreCompleto?.split(' ').slice(0, 3).join(' ')}</h2>
          <p className="text-sm text-slate-300 mt-1">
            {citas === null ? 'Cargando agenda...' : pendientes.length === 0 ? 'No hay citas pendientes por confirmar.' : `Tiene ${pendientes.length} ${pendientes.length === 1 ? 'cita pendiente' : 'citas pendientes'} por confirmar.`}
          </p>
        </div>
        <button type="button" onClick={() => navegar('citas')} className="bg-gradient-to-r from-medical-500 to-blue-600 font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm cursor-pointer">
          Revisar agenda <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjeta('Citas hoy', citas ? citasHoy.length : null, <CalendarCheck className="w-5 h-5" />, 'Sin contar canceladas', 'citas')}
        {tarjeta('Por confirmar', citas ? pendientes.length : null, <Clock className="w-5 h-5" />, 'Requieren llamada', 'citas')}
        {puedeEditarContenido && tarjeta('Procedimientos', servicios?.length, <Scissors className="w-5 h-5" />, 'Páginas en la web', 'procedimientos')}
        {puedeEditarContenido && tarjeta('Artículos', articulos ? publicados.length : null, <Newspaper className="w-5 h-5" />, articulos ? `${articulos.length - publicados.length} borradores` : '', 'blog')}
      </div>

      {puedeEditarContenido && (
        <Panel titulo="Salud SEO" descripcion="Páginas a las que les falta algo para posicionar bien en Google. Haga clic para corregir.">
          {servicios === null || articulos === null || paginas === null ? (
            <p className="text-sm text-slate-500">Revisando páginas...</p>
          ) : alertas.length === 0 ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="w-5 h-5" /> Todo en orden: todas las páginas tienen título y descripción adecuados.</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-white/5">
              {alertas.map((a, i) => (
                <li key={i}>
                  <button type="button" onClick={() => navegar(a.ruta)} className="w-full py-3 flex items-start gap-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl px-2 cursor-pointer">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${a.nivel === 'error' ? 'text-red-500' : 'text-amber-500'}`} />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">{a.texto}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">{a.detalle}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
};
