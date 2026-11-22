import React, { useEffect, useState } from 'react';
import { ExternalLink, Save, Trash2 } from 'lucide-react';
import { api, mensajeError } from '../../lib/api';
import { useCatalogos } from '../../lib/datos';
import { navegar, WEB_URL } from '../../lib/router';
import { vacioANull } from '../../lib/texto';
import type { Articulo, ArticuloGuardar } from '../../lib/tipos';
import { AreaTexto, Boton, Campo, EncabezadoPagina, Interruptor, MensajeError, Panel, Selector } from '../../components/ui/Formulario';
import { SeoEditor } from '../../components/seo/SeoEditor';
import { SlugInput } from '../../components/seo/SlugInput';
import { useAvisos } from '../../components/ui/Avisos';
import { useDialogos } from '../../components/ui/Dialogos';
import { EditorVisual } from '../../components/ui/EditorVisual';
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

export const ArticuloEditor: React.FC<{ id: number | null }> = ({ id }) => {
  const avisos = useAvisos();
  const { confirmar } = useDialogos();
  const catalogos = useCatalogos();
  const [form, setForm] = useState<ArticuloGuardar | null>(id ? null : VACIO);
  const [original, setOriginal] = useState<Articulo | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [sucio, setSucio] = useState(false);

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
  const volver = async () => {
    if (sucio && !(await confirmar({ titulo: 'Hay cambios sin guardar', mensaje: 'Si sales ahora, se perderán los cambios que hiciste.', textoAceptar: 'Salir sin guardar', textoCancelar: 'Seguir editando', peligro: true }))) return;
    navegar('blog');
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
    if (!(await confirmar({ titulo: `¿Eliminar el artículo «${original.titulo}»?`, mensaje: 'Dejará de verse en la web. Si alguien entra a su dirección, verá un error 404.', textoAceptar: 'Eliminar', peligro: true }))) return;
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
          >
            <EditorVisual valor={form.contenidoHtml} onCambio={(html) => cambiar({ contenidoHtml: html })} />
            <p className="text-[11px] text-slate-500 mt-1">Usa subtítulos con las preguntas que haría un paciente y enlaza la página del procedimiento relacionado. Puedes pegar texto desde Word o Google Docs.</p>
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
