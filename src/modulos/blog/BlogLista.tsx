import React, { useState } from 'react';
import { ExternalLink, Eye, Plus, Tags } from 'lucide-react';
import { useDatos, invalidarCaches } from '../../lib/datos';
import { navegar, WEB_URL } from '../../lib/router';
import { api, mensajeError } from '../../lib/api';
import { formatearFecha } from '../../lib/texto';
import type { Articulo, CategoriaBlog } from '../../lib/tipos';
import { Boton, Campo, EncabezadoPagina, Etiqueta, MensajeError, Panel } from '../../components/ui/Formulario';
import { LoadingFallback } from '../../components/LoadingFallback';
import { revisarSeo } from '../../lib/seo';
import { useAvisos } from '../../components/ui/Avisos';

export const BlogLista: React.FC = () => {
  const { datos, cargando, error, recargar } = useDatos<Articulo[]>('/api/admin/blog/articulos');
  const [verCategorias, setVerCategorias] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | 'publicados' | 'borradores'>('todos');

  const ahora = Date.now();
  const estado = (a: Articulo) =>
    !a.publicadoEnWeb ? 'borrador' : new Date(a.fechaPublicacion).getTime() > ahora ? 'programado' : 'publicado';
  const lista = (datos ?? []).filter((a) => filtro === 'todos' || (filtro === 'publicados' ? estado(a) !== 'borrador' : estado(a) === 'borrador'));

  return (
    <div>
      <EncabezadoPagina
        titulo="Blog médico"
        descripcion="Los artículos atraen visitas desde Google con las preguntas que se hacen los pacientes."
        acciones={
          <>
            <Boton variante="secundario" icono={<Tags className="w-4 h-4" />} onClick={() => setVerCategorias((v) => !v)}>Categorías</Boton>
            <Boton icono={<Plus className="w-4 h-4" />} onClick={() => navegar('blog/nuevo')}>Nuevo artículo</Boton>
          </>
        }
      />

      {verCategorias && <CategoriasPanel onCambio={recargar} />}

      <div className="flex gap-2 mb-4">
        {(['todos', 'publicados', 'borradores'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFiltro(f)} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer ${filtro === f ? 'bg-medical-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {f}
          </button>
        ))}
      </div>

      {error && <MensajeError mensaje={error} reintentar={recargar} />}
      {cargando && !datos && <LoadingFallback texto="Cargando artículos..." />}

      {datos && (
        <div className="space-y-3">
          {lista.map((a) => {
            const revision = revisarSeo(a.seo);
            const e = estado(a);
            return (
              <div key={a.id} onClick={() => navegar(`blog/${a.id}`)} className="cursor-pointer bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 hover:border-medical-500/50 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Etiqueta color={e === 'publicado' ? 'verde' : e === 'programado' ? 'azul' : 'gris'}>{e === 'publicado' ? 'Publicado' : e === 'programado' ? 'Programado' : 'Borrador'}</Etiqueta>
                    <Etiqueta>{a.categoria.nombre}</Etiqueta>
                    {revision.nivel !== 'ok' && <Etiqueta color={revision.nivel === 'error' ? 'rojo' : 'ambar'}>SEO: {revision.problemas[0]}</Etiqueta>}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{a.titulo}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatearFecha(a.fechaPublicacion)} · {a.tiempoLectura} min de lectura
                    {a.servicioRelacionado && <> · Enlazado a {a.servicioRelacionado.nombre}</>}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{a.vistas}</span>
                  {e !== 'borrador' && (
                    <a href={`${WEB_URL}/blog/${a.slug}`} target="_blank" rel="noreferrer" onClick={(ev) => ev.stopPropagation()} className="p-2 rounded-lg text-slate-400 hover:text-medical-600" title="Ver en la web">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
          {lista.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No hay artículos en esta vista.</p>}
        </div>
      )}
    </div>
  );
};

const CategoriasPanel: React.FC<{ onCambio: () => void }> = ({ onCambio }) => {
  const avisos = useAvisos();
  const { datos, recargar } = useDatos<CategoriaBlog[]>('/api/admin/blog/categorias');
  const [nueva, setNueva] = useState('');

  const ejecutar = async (accion: () => Promise<unknown>, exito: string) => {
    try {
      await accion();
      invalidarCaches();
      avisos.exito(exito);
      await recargar();
      onCambio();
    } catch (e) {
      avisos.error(mensajeError(e));
    }
  };

  return (
    <Panel titulo="Categorías del blog" className="mb-6">
      <ul className="divide-y divide-slate-200 dark:divide-white/5 mb-4">
        {(datos ?? []).map((c) => (
          <li key={c.id} className="py-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-800 dark:text-slate-100">{c.nombre} <span className="text-xs text-slate-400">/{c.slug}</span></span>
            <span className="flex gap-2">
              <button type="button" className="text-xs font-semibold text-medical-600 hover:underline cursor-pointer" onClick={() => {
                const nombre = window.prompt('Nuevo nombre de la categoría', c.nombre);
                if (nombre && nombre.trim() !== c.nombre) void ejecutar(() => api.put(`/api/admin/blog/categorias/${c.id}`, { nombre, slug: c.slug }), 'Categoría renombrada.');
              }}>Renombrar</button>
              <button type="button" className="text-xs font-semibold text-red-600 hover:underline cursor-pointer" onClick={() => {
                if (window.confirm(`¿Eliminar la categoría «${c.nombre}»?`)) void ejecutar(() => api.delete(`/api/admin/blog/categorias/${c.id}`), 'Categoría eliminada.');
              }}>Eliminar</button>
            </span>
          </li>
        ))}
      </ul>
      <form className="flex gap-2 items-end" onSubmit={(e) => {
        e.preventDefault();
        if (!nueva.trim()) return;
        void ejecutar(() => api.post('/api/admin/blog/categorias', { nombre: nueva }), 'Categoría creada.').then(() => setNueva(''));
      }}>
        <Campo etiqueta="Nueva categoría" value={nueva} onChange={(e) => setNueva(e.target.value)} maxLength={100} className="flex-1" />
        <Boton type="submit">Agregar</Boton>
      </form>
    </Panel>
  );
};
