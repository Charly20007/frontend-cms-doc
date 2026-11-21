import React, { useEffect, useState } from 'react';
import { Code, ExternalLink, Eye, Save, Trash2 } from 'lucide-react';
import { api, mensajeError } from '../../lib/api';
import { useCatalogos } from '../../lib/datos';
import { navegar, WEB_URL } from '../../lib/router';
import { vacioANull } from '../../lib/texto';
import type { Articulo, ArticuloGuardar } from '../../lib/tipos';
import { AreaTexto, Boton, Campo, EncabezadoPagina, Interruptor, MensajeError, Panel, Selector } from '../../components/ui/Formulario';
import { SeoEditor } from '../../components/seo/SeoEditor';
import { SlugInput } from '../../components/seo/SlugInput';
import { useAvisos } from '../../components/ui/Avisos';
import { LoadingFallback } from '../../components/LoadingFallback';

const VACIO: ArticuloGuardar = {
  titulo: '', slug: '', resumen: '', contenidoHtml: '', imagenPortadaUrl: '', idCategoria: 0, idServicioMedico: null,
  autor: '', tiempoLecturaMinutos: null, fechaPublicacion: null, publicadoEnWeb: false,
  seo: { metaTitulo: '', metaDescripcion: '', imagenOgUrl: '', indexable: true },
};

const aFormulario = (a: Articulo): ArticuloGuardar => ({
  titulo: a.titulo, slug: a.slug, resumen: a.resumen, contenidoHtml: a.contenidoHtml, imagenPortadaUrl: a.imagenPortadaUrl ?? '',
  idCategoria: a.categoria.id, idServicioMedico: a.servicioRelacionado?.id ?? null, autor: a.autor, tiempoLecturaMinutos: a.tiempoLectura,
  fechaPublicacion: a.fechaPublicacion, publicadoEnWeb: a.publicadoEnWeb,
  seo: { metaTitulo: a.seo.metaTitulo ?? '', metaDescripcion: a.seo.metaDescripcion ?? '', imagenOgUrl: a.seo.imagenOgUrl ?? '', indexable: a.seo.indexable },
});

/** "2026-07-02T00:00:00Z" → "2026-07-02" para <input type="date"> */
const aFechaInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');

/** Atajos para insertar etiquetas HTML básicas en el contenido. */
const ATAJOS: { texto: string; antes: string; despues: string }[] = [
  { texto: 'Subtítulo', antes: '<h2>', despues: '</h2>' },
  { texto: 'Párrafo', antes: '<p>', despues: '</p>' },
  { texto: 'Negrita', antes: '<strong>', despues: '</strong>' },
  { texto: 'Lista', antes: '<ul>\n  <li>', despues: '</li>\n</ul>' },
  { texto: 'Enlace', antes: '<a href="/procedimientos/">', despues: '</a>' },
];

export const ArticuloEditor: React.FC<{ id: number | null }> = ({ id }) => {
  const avisos = useAvisos();
  const catalogos = useCatalogos();
  const [form, setForm] = useState<ArticuloGuardar | null>(id ? null : VACIO);
  const [original, setOriginal] = useState<Articulo | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [sucio, setSucio] = useState(false);
  const areaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Articulo>(`/api/admin/blog/articulos/${id}`)
      .then(({ data }) => { setOriginal(data); setForm(aFormulario(data)); })
      .catch((e) => setErrorCarga(mensajeError(e, 'No se pudo cargar el artículo.')));
  }, [id]);

  useEffect(() => {
    if (!sucio) return;
    const alSalir = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', alSalir);
    return () => window.removeEventListener('beforeunload', alSalir);
  }, [sucio]);

  if (errorCarga) return <MensajeError mensaje={errorCarga} />;
  if (!form) return <LoadingFallback texto="Cargando artículo..." />;

  const cambiar = (c: Partial<ArticuloGuardar>) => { setForm({ ...form, ...c }); setSucio(true); };
  const volver = () => {
    if (sucio && !window.confirm('Hay cambios sin guardar. ¿Salir de todos modos?')) return;
    navegar('blog');
  };

  const insertar = (antes: string, despues: string) => {
    const area = areaRef.current;
    if (!area) return;
    const { selectionStart: i, selectionEnd: f, value } = area;
    const nuevo = value.slice(0, i) + antes + value.slice(i, f) + despues + value.slice(f);
    cambiar({ contenidoHtml: nuevo });
    requestAnimationFrame(() => { area.focus(); area.setSelectionRange(i + antes.length, f + antes.length); });
  };

  const palabras = form.contenidoHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  const guardar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.titulo.trim() || !form.resumen.trim() || !form.contenidoHtml.trim() || !form.idCategoria) {
      avisos.error('Complete título, resumen, contenido y categoría.');
      return;
    }
    setGuardando(true);
    const cuerpo: ArticuloGuardar = {
      ...form,
      slug: vacioANull(form.slug),
      imagenPortadaUrl: vacioANull(form.imagenPortadaUrl),
      autor: vacioANull(form.autor),
      fechaPublicacion: form.fechaPublicacion || null,
      seo: { ...form.seo, metaTitulo: vacioANull(form.seo.metaTitulo), metaDescripcion: vacioANull(form.seo.metaDescripcion), imagenOgUrl: vacioANull(form.seo.imagenOgUrl) },
    };
    try {
      const { data } = id
        ? await api.put<Articulo>(`/api/admin/blog/articulos/${id}`, cuerpo)
        : await api.post<Articulo>('/api/admin/blog/articulos', cuerpo);
      setSucio(false);
      if (original && original.slug !== data.slug) avisos.exito(`Guardado. Se creó una redirección desde /blog/${original.slug}.`);
      else avisos.exito(data.publicadoEnWeb ? 'Artículo guardado y publicado.' : 'Borrador guardado.');
      setOriginal(data);
      setForm(aFormulario(data));
      if (!id) navegar(`blog/${data.id}`);
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudo guardar.'));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!id || !original) return;
    if (!window.confirm(`¿Eliminar el artículo «${original.titulo}»?`)) return;
    try {
      await api.delete(`/api/admin/blog/articulos/${id}`);
      setSucio(false);
      avisos.exito('Artículo eliminado.');
      navegar('blog');
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudo eliminar.'));
    }
  };

  return (
    <form onSubmit={guardar} className="space-y-6">
      <EncabezadoPagina
        volver={volver}
        titulo={id ? form.titulo || 'Artículo' : 'Nuevo artículo'}
        acciones={
          <>
            {original?.publicadoEnWeb && (
              <a href={`${WEB_URL}/blog/${original.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">
                <ExternalLink className="w-4 h-4" /> Ver artículo
              </a>
            )}
            {id && <Boton variante="peligro" icono={<Trash2 className="w-4 h-4" />} onClick={eliminar}>Eliminar</Boton>}
            <Boton type="submit" cargando={guardando} icono={<Save className="w-4 h-4" />}>{form.publicadoEnWeb ? 'Guardar y publicar' : 'Guardar borrador'}</Boton>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Panel>
            <div className="space-y-4">
              <Campo etiqueta="Título" obligatorio maxLength={200} value={form.titulo} onChange={(e) => cambiar({ titulo: e.target.value })} ayuda="Escriba la pregunta que haría un paciente. Ej.: «¿Cómo saber si tengo cálculos en la vesícula?»" />
              <SlugInput valor={form.slug ?? ''} onCambio={(v) => cambiar({ slug: v })} prefijo="/blog/" origen={form.titulo} slugOriginal={original?.slug} />
              <AreaTexto etiqueta="Resumen" obligatorio maxLength={500} value={form.resumen} onChange={(e) => cambiar({ resumen: e.target.value })} contador={{ actual: form.resumen.length, recomendado: 250, maximo: 500 }} ayuda="Aparece en el listado del blog." />
            </div>
          </Panel>

          <Panel
            titulo="Contenido"
            descripcion={`${palabras} palabras · ~${Math.max(1, Math.ceil(palabras / 200))} min de lectura. Se recomiendan más de 600 palabras para posicionar.`}
            acciones={
              <Boton variante="secundario" icono={vistaPrevia ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />} onClick={() => setVistaPrevia((v) => !v)}>
                {vistaPrevia ? 'Editar HTML' : 'Vista previa'}
              </Boton>
            }
          >
            {vistaPrevia ? (
              // Vista previa del HTML escrito por el propio administrador
              <div className="prose-cms max-w-none text-slate-700 dark:text-slate-300 min-h-[20rem]" dangerouslySetInnerHTML={{ __html: form.contenidoHtml }} />
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ATAJOS.map((a) => (
                    <button key={a.texto} type="button" onClick={() => insertar(a.antes, a.despues)} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-medical-500/10 hover:text-medical-600 cursor-pointer">
                      {a.texto}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={areaRef}
                  aria-label="Contenido HTML"
                  value={form.contenidoHtml}
                  onChange={(e) => cambiar({ contenidoHtml: e.target.value })}
                  rows={22}
                  className="w-full font-mono text-xs bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-white/10 rounded-xl p-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-medical-500"
                  placeholder={"<h2>Subtítulo</h2>\n<p>Texto del artículo...</p>"}
                />
                <p className="text-[11px] text-slate-500 mt-1">Use subtítulos (Subtítulo = H2) con preguntas y enlace a la página del procedimiento relacionado.</p>
              </>
            )}
          </Panel>

          <SeoEditor
            seo={form.seo}
            onCambio={(seo) => cambiar({ seo })}
            ruta={`/blog/${form.slug || 'nuevo-articulo'}`}
            tituloRespaldo={form.titulo || 'Título del artículo'}
            descripcionRespaldo={form.resumen || 'Resumen del artículo'}
          />
        </div>

        <div className="space-y-6">
          <Panel titulo="Publicación">
            <div className="space-y-4">
              <Interruptor etiqueta="Publicado" descripcion={form.publicadoEnWeb ? 'Visible en la web.' : 'Borrador: solo visible aquí.'} activo={form.publicadoEnWeb} onCambio={(v) => cambiar({ publicadoEnWeb: v })} />
              <Campo etiqueta="Fecha de publicación" type="date" value={aFechaInput(form.fechaPublicacion)} onChange={(e) => cambiar({ fechaPublicacion: e.target.value ? `${e.target.value}T12:00:00Z` : null })} ayuda="Si es futura, el artículo aparecerá ese día." />
              <Campo etiqueta="Autor" maxLength={100} value={form.autor ?? ''} onChange={(e) => cambiar({ autor: e.target.value })} placeholder="Dr. Juan Carlos Marcos Enriquez" />
            </div>
          </Panel>
          <Panel titulo="Clasificación">
            <div className="space-y-4">
              <Selector etiqueta="Categoría" obligatorio vacio="Seleccione..." value={form.idCategoria || ''} onChange={(e) => cambiar({ idCategoria: Number(e.target.value) })} opciones={(catalogos?.categoriasBlog ?? []).map((c) => ({ valor: c.id, texto: c.nombre }))} />
              <Selector
                etiqueta="Procedimiento relacionado" vacio="Ninguno"
                value={form.idServicioMedico ?? ''}
                onChange={(e) => cambiar({ idServicioMedico: e.target.value ? Number(e.target.value) : null })}
                opciones={(catalogos?.servicios ?? []).map((s) => ({ valor: s.id, texto: s.nombre }))}
                ayuda="El artículo se enlazará desde la página del procedimiento (enlazado interno = mejor SEO)."
              />
            </div>
          </Panel>
          <Panel titulo="Imagen de portada">
            <Campo etiqueta="URL de la imagen" value={form.imagenPortadaUrl ?? ''} onChange={(e) => cambiar({ imagenPortadaUrl: e.target.value })} maxLength={500} placeholder="/imagenes/articulo.jpg" />
            {form.imagenPortadaUrl && <img src={form.imagenPortadaUrl.startsWith('http') ? form.imagenPortadaUrl : `${WEB_URL}${form.imagenPortadaUrl}`} alt="" className="mt-3 rounded-xl max-h-40 object-cover w-full" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />}
          </Panel>
        </div>
      </div>
    </form>
  );
};
