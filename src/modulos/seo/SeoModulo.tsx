import React, { useState } from 'react';
import { ArrowRight, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { api, mensajeError } from '../../lib/api';
import { useDatos } from '../../lib/datos';
import { WEB_URL } from '../../lib/router';
import type { PaginaSeo, Redireccion, RedireccionGuardar, Seo } from '../../lib/tipos';
import { Boton, Campo, EncabezadoPagina, Etiqueta, Interruptor, MensajeError, Panel } from '../../components/ui/Formulario';
import { SeoEditor } from '../../components/seo/SeoEditor';
import { revisarSeo } from '../../lib/seo';
import { useAvisos } from '../../components/ui/Avisos';
import { LoadingFallback } from '../../components/LoadingFallback';

export const SeoModulo: React.FC = () => {
  const [pestana, setPestana] = useState<'paginas' | 'redirecciones'>('paginas');
  return (
    <div>
      <EncabezadoPagina titulo="SEO y redirecciones" descripcion="Cómo aparecen en Google las páginas fijas de la web, y las direcciones antiguas que redirigen a las nuevas." />
      <div role="tablist" className="flex gap-1 p-1 mb-6 rounded-2xl bg-slate-100 dark:bg-navy-900/60 w-fit">
        {([['paginas', 'Páginas principales'], ['redirecciones', 'Redirecciones']] as const).map(([id, texto]) => (
          <button key={id} type="button" role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)} className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer ${pestana === id ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>
            {texto}
          </button>
        ))}
      </div>
      {pestana === 'paginas' ? <PaginasSeo /> : <Redirecciones />}
    </div>
  );
};

const PaginasSeo: React.FC = () => {
  const { datos, setDatos, cargando, error, recargar } = useDatos<PaginaSeo[]>('/api/admin/seo/paginas');
  const [editando, setEditando] = useState<string | null>(null);
  const [borrador, setBorrador] = useState<Seo | null>(null);
  const [guardando, setGuardando] = useState(false);
  const avisos = useAvisos();

  if (error) return <MensajeError mensaje={error} reintentar={recargar} />;
  if (cargando && !datos) return <LoadingFallback texto="Cargando páginas..." />;

  const guardar = async (clave: string) => {
    if (!borrador) return;
    setGuardando(true);
    try {
      const { data } = await api.put<PaginaSeo>(`/api/admin/seo/paginas/${clave}`, {
        ...borrador,
        metaTitulo: borrador.metaTitulo?.trim() || null,
        metaDescripcion: borrador.metaDescripcion?.trim() || null,
        imagenOgUrl: borrador.imagenOgUrl?.trim() || null,
      });
      setDatos((datos ?? []).map((p) => (p.clave === clave ? data : p)));
      setEditando(null);
      avisos.exito(`SEO de «${data.nombrePagina}» guardado.`);
    } catch (e) {
      avisos.error(mensajeError(e, 'No se pudo guardar.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">El SEO de cada procedimiento y artículo se edita en su propia pantalla.</p>
      {(datos ?? []).map((p) => {
        const revision = revisarSeo(p.seo);
        if (editando === p.clave && borrador) {
          return (
            <div key={p.clave} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 dark:text-white">{p.nombrePagina} <span className="text-xs font-medium text-slate-400">{p.ruta}</span></h3>
                <div className="flex gap-2">
                  <Boton variante="secundario" onClick={() => setEditando(null)}>Cancelar</Boton>
                  <Boton cargando={guardando} icono={<Save className="w-4 h-4" />} onClick={() => guardar(p.clave)}>Guardar</Boton>
                </div>
              </div>
              <SeoEditor seo={borrador} onCambio={setBorrador} ruta={p.ruta} tituloRespaldo={p.nombrePagina} descripcionRespaldo="(descripción por defecto del sitio)" permitirNoIndex={p.clave !== 'inicio'} />
            </div>
          );
        }
        return (
          <div key={p.clave} className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-900 dark:text-white">{p.nombrePagina}</h3>
                <a href={`${WEB_URL}${p.ruta}`} target="_blank" rel="noreferrer" className="text-xs text-medical-600 hover:underline">{p.ruta}</a>
                {revision.nivel === 'ok' ? <Etiqueta color="verde">Completo</Etiqueta> : <Etiqueta color={revision.nivel === 'error' ? 'rojo' : 'ambar'}>{revision.problemas.join(' · ')}</Etiqueta>}
                {!p.seo.indexable && <Etiqueta>Oculta en Google</Etiqueta>}
              </div>
              <p className="text-sm text-[#1a0dab] dark:text-medical-300 truncate">{p.seo.metaTitulo || '(sin título)'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.seo.metaDescripcion || '(sin descripción)'}</p>
            </div>
            <Boton variante="secundario" icono={<Pencil className="w-4 h-4" />} onClick={() => { setEditando(p.clave); setBorrador({ ...p.seo }); }}>Editar</Boton>
          </div>
        );
      })}
    </div>
  );
};

const VACIA: RedireccionGuardar = { rutaOrigen: '', rutaDestino: '', esPermanente: true, activa: true, nota: '' };

const Redirecciones: React.FC = () => {
  const { datos, cargando, error, recargar } = useDatos<Redireccion[]>('/api/admin/seo/redirecciones');
  const [form, setForm] = useState<RedireccionGuardar | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const avisos = useAvisos();

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setGuardando(true);
    try {
      const cuerpo = { ...form, nota: form.nota?.trim() || null };
      if (editandoId) await api.put(`/api/admin/seo/redirecciones/${editandoId}`, cuerpo);
      else await api.post('/api/admin/seo/redirecciones', cuerpo);
      avisos.exito('Redirección guardada.');
      setForm(null);
      setEditandoId(null);
      await recargar();
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudo guardar.'));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (r: Redireccion) => {
    if (!window.confirm(`¿Eliminar la redirección desde ${r.rutaOrigen}? Quien entre a esa dirección verá un error 404.`)) return;
    try {
      await api.delete(`/api/admin/seo/redirecciones/${r.id}`);
      avisos.exito('Redirección eliminada.');
      await recargar();
    } catch (err) {
      avisos.error(mensajeError(err));
    }
  };

  return (
    <div className="space-y-4">
      <Panel
        titulo="Redirecciones 301"
        descripcion="Se crean solas cuando cambia la URL de un procedimiento o artículo. Agregue una manualmente si una página antigua (por ejemplo, de una web anterior) debe llevar a una nueva."
        acciones={!form && <Boton icono={<Plus className="w-4 h-4" />} onClick={() => { setForm(VACIA); setEditandoId(null); }}>Nueva redirección</Boton>}
      >
        {form && (
          <form onSubmit={guardar} className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/40 border border-slate-200 dark:border-white/10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo etiqueta="Desde (dirección antigua)" obligatorio value={form.rutaOrigen} onChange={(e) => setForm({ ...form, rutaOrigen: e.target.value })} placeholder="/servicios/vesicula" maxLength={300} />
              <Campo etiqueta="Hacia (dirección nueva)" obligatorio value={form.rutaDestino} onChange={(e) => setForm({ ...form, rutaDestino: e.target.value })} placeholder="/procedimientos/cirugia-de-vesicula-laparoscopica" maxLength={300} />
              <Campo etiqueta="Nota (opcional)" value={form.nota ?? ''} onChange={(e) => setForm({ ...form, nota: e.target.value })} maxLength={200} className="md:col-span-2" />
            </div>
            <div className="flex flex-wrap gap-6">
              <Interruptor etiqueta="Activa" activo={form.activa} onCambio={(v) => setForm({ ...form, activa: v })} />
              <Interruptor etiqueta="Permanente (301)" descripcion="Recomendado: transfiere el posicionamiento a la nueva dirección." activo={form.esPermanente} onCambio={(v) => setForm({ ...form, esPermanente: v })} />
            </div>
            <div className="flex gap-2 justify-end">
              <Boton variante="secundario" onClick={() => { setForm(null); setEditandoId(null); }}>Cancelar</Boton>
              <Boton type="submit" cargando={guardando}>Guardar</Boton>
            </div>
          </form>
        )}

        {error && <MensajeError mensaje={error} reintentar={recargar} />}
        {cargando && !datos && <LoadingFallback texto="Cargando redirecciones..." />}
        {datos && datos.length === 0 && <p className="text-sm text-slate-500 py-6 text-center">No hay redirecciones.</p>}
        {datos && datos.length > 0 && (
          <ul className="divide-y divide-slate-200 dark:divide-white/5">
            {datos.map((r) => (
              <li key={r.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 text-sm">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className={r.activa ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 line-through'}>{r.rutaOrigen}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-medical-600 dark:text-medical-400">{r.rutaDestino}</span>
                    {!r.activa && <Etiqueta>Inactiva</Etiqueta>}
                    {!r.esPermanente && <Etiqueta color="ambar">Temporal</Etiqueta>}
                  </div>
                  {r.nota && <p className="text-[11px] text-slate-500 mt-0.5">{r.nota}</p>}
                </div>
                <div className="flex gap-1">
                  <button type="button" title="Editar" onClick={() => { setEditandoId(r.id); setForm({ rutaOrigen: r.rutaOrigen, rutaDestino: r.rutaDestino, esPermanente: r.esPermanente, activa: r.activa, nota: r.nota ?? '' }); }} className="p-2 rounded-lg text-slate-400 hover:text-medical-600 cursor-pointer"><Pencil className="w-4 h-4" /></button>
                  <button type="button" title="Eliminar" onClick={() => eliminar(r)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};
