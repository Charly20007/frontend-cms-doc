import React, { useState } from 'react';
import { ExternalLink, Eye, Plus, Star, Tags, Type } from 'lucide-react';
import { useDatos, invalidarCaches } from '../../lib/datos';
import { navegar, WEB_URL } from '../../lib/router';
import { api, mensajeError } from '../../lib/api';
import { formatearFecha } from '../../lib/texto';
import type { Articulo, CategoriaBlog, PaginaSeo } from '../../lib/tipos';
import { AreaTexto, Boton, Campo, EncabezadoPagina, Etiqueta, MensajeError, Panel } from '../../components/ui/Formulario';
import { LoadingFallback } from '../../components/LoadingFallback';
import { revisarSeo } from '../../lib/seo';
import { useAvisos } from '../../components/ui/Avisos';
import { useDialogos } from '../../components/ui/Dialogos';

export const BlogLista: React.FC = () => {
  const avisos = useAvisos();
  const { datos, cargando, error, recargar } = useDatos<Articulo[]>('/api/admin/blog/articulos');
  const [verCategorias, setVerCategorias] = useState(false);
  const [verTextos, setVerTextos] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | 'publicados' | 'borradores'>('todos');

  const ahora = Date.now();
  const estado = (a: Articulo) =>
    !a.publicadoEnWeb ? 'borrador' : new Date(a.fechaPublicacion).getTime() > ahora ? 'programado' : 'publicado';
  // El que sale en grande en la web: el destacado o, si no hay, el más reciente publicado
  const visibles = (datos ?? []).filter((a) => estado(a) === 'publicado');
  const portada = visibles.find((a) => a.destacado) ?? visibles[0];
  const portadaAutomatica = !!portada && !portada.destacado;

  const destacar = async (a: Articulo) => {
    try {
      await api.put(`/api/admin/blog/articulos/${a.id}/destacado`, { destacado: !a.destacado });
      invalidarCaches();
      avisos.exito(a.destacado ? 'Se quitó el destacado. La portada será el artículo más reciente.' : `«${a.titulo}» ahora sale en grande en el blog.`);
      await recargar();
    } catch (e) {
      avisos.error(mensajeError(e));
    }
  };

  const lista = (datos ?? []).filter((a) => filtro === 'todos' || (filtro === 'publicados' ? estado(a) !== 'borrador' : estado(a) === 'borrador'));

  return (
    <div>
      <EncabezadoPagina
        titulo="Blog médico"
        descripcion="Los artículos atraen visitas desde Google con las preguntas que se hacen los pacientes."
        acciones={
          <>
            <Boton variante="secundario" icono={<Type className="w-4 h-4" />} onClick={() => setVerTextos((v) => !v)}>Textos de la página</Boton>
            <Boton variante="secundario" icono={<Tags className="w-4 h-4" />} onClick={() => setVerCategorias((v) => !v)}>Categorías</Boton>
            <Boton icono={<Plus className="w-4 h-4" />} onClick={() => navegar('blog/nuevo')}>Nuevo artículo</Boton>
          </>
        }
      />

      {verTextos && <TextosPanel />}
      {verCategorias && <CategoriasPanel onCambio={recargar} />}

      {portada && (
        <p className="mb-4 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl px-4 py-3">
          <Star className="w-4 h-4 mt-0.5 shrink-0 fill-amber-400 text-amber-500" />
          <span>
            En la web sale en grande <strong className="text-slate-900 dark:text-white">«{portada.titulo}»</strong>
            {portadaAutomatica ? ' porque es el más reciente. Para elegir otro, toca la estrella de ese artículo.' : '. Para quitarlo, toca su estrella.'}
          </span>
        </p>
      )}

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
                    {a.id === portada?.id && <Etiqueta color="ambar"><Star className="w-3 h-3 fill-current" />Portada del blog</Etiqueta>}
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
                  {e === 'publicado' && (
                    <button
                      type="button"
                      onClick={(ev) => { ev.stopPropagation(); void destacar(a); }}
                      className={`p-2 rounded-lg cursor-pointer ${a.destacado ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
                      title={a.destacado ? 'Quitar de la portada del blog' : 'Mostrar en grande en el blog'}
                      aria-pressed={a.destacado}
                    >
                      <Star className={`w-4 h-4 ${a.destacado ? 'fill-current' : ''}`} />
                    </button>
                  )}
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
  const { confirmar, pedirTexto } = useDialogos();
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
                void pedirTexto({ titulo: 'Renombrar categoría', etiqueta: 'Nuevo nombre', valorInicial: c.nombre, textoAceptar: 'Guardar', maxLength: 100 }).then((nombre) => {
                  if (nombre && nombre !== c.nombre) void ejecutar(() => api.put(`/api/admin/blog/categorias/${c.id}`, { nombre, slug: c.slug }), 'Categoría renombrada.');
                });
              }}>Renombrar</button>
              <button type="button" className="text-xs font-semibold text-red-600 hover:underline cursor-pointer" onClick={() => {
                void confirmar({ titulo: `¿Eliminar la categoría «${c.nombre}»?`, textoAceptar: 'Eliminar', peligro: true }).then((ok) => { if (ok) void ejecutar(() => api.delete(`/api/admin/blog/categorias/${c.id}`), 'Categoría eliminada.'); });
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

/** Textos por defecto de la web: se muestran como ejemplo si el campo está vacío. */
const TEXTOS_POR_DEFECTO = {
  titulo: 'Blog de salud digestiva',
  descripcion: 'Síntomas, prevención y cuidados antes y después de una cirugía, explicados con claridad.',
  tituloSecundario: 'También te puede interesar',
};

const TextosPanel: React.FC = () => {
  const avisos = useAvisos();
  const { datos } = useDatos<PaginaSeo[]>('/api/admin/seo/paginas');
  const pagina = datos?.find((p) => p.clave === 'blog');
  const [textos, setTextos] = useState<{ titulo: string; descripcion: string; tituloSecundario: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const valores = textos ?? {
    titulo: pagina?.titulo ?? '',
    descripcion: pagina?.descripcion ?? '',
    tituloSecundario: pagina?.tituloSecundario ?? '',
  };
  const cambiar = (campo: keyof typeof valores, valor: string) => setTextos({ ...valores, [campo]: valor });

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.put('/api/admin/seo/paginas/blog/textos', valores);
      invalidarCaches();
      avisos.exito('Textos del blog guardados. La web se actualiza en unos segundos.');
    } catch (err) {
      avisos.error(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Panel titulo="Textos de la página del blog" descripcion="Si dejas un campo vacío, la web usa el texto de ejemplo." className="mb-6">
      {!pagina ? (
        <LoadingFallback texto="Cargando textos..." />
      ) : (
        <form onSubmit={guardar} className="space-y-4">
          <Campo etiqueta="Título principal" placeholder={TEXTOS_POR_DEFECTO.titulo} value={valores.titulo} onChange={(e) => cambiar('titulo', e.target.value)} maxLength={150} />
          <AreaTexto etiqueta="Descripción bajo el título" placeholder={TEXTOS_POR_DEFECTO.descripcion} value={valores.descripcion} onChange={(e) => cambiar('descripcion', e.target.value)} maxLength={300} rows={2} />
          <Campo
            etiqueta="Título de la columna junto a la portada"
            ayuda="Encabeza la lista de artículos que aparece al lado del artículo grande."
            placeholder={TEXTOS_POR_DEFECTO.tituloSecundario}
            value={valores.tituloSecundario}
            onChange={(e) => cambiar('tituloSecundario', e.target.value)}
            maxLength={100}
          />
          <div className="flex justify-end">
            <Boton type="submit" cargando={guardando}>Guardar textos</Boton>
          </div>
        </form>
      )}
    </Panel>
  );
};
