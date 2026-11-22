import React, { useEffect, useState } from 'react';
import { ExternalLink, FileText, Save } from 'lucide-react';
import { api, mensajeError } from '../../lib/api';
import { useDatos } from '../../lib/datos';
import { navegar, WEB_URL } from '../../lib/router';
import { formatearFecha } from '../../lib/texto';
import type { PaginaLegal, PaginaLegalResumen, Seo } from '../../lib/tipos';
import { Boton, Campo, EncabezadoPagina, Etiqueta, Interruptor, MensajeError, Panel } from '../../components/ui/Formulario';
import { SeoEditor } from '../../components/seo/SeoEditor';
import { useAvisos } from '../../components/ui/Avisos';
import { useDialogos } from '../../components/ui/Dialogos';
import { EditorVisual } from '../../components/ui/EditorVisual';
import { LoadingFallback } from '../../components/LoadingFallback';

const AVISO_LEGAL = 'Estos textos son una base general. Revíselos con un asesor legal antes de publicar la web.';

export const LegalesLista: React.FC = () => {
  const { datos, cargando, error, recargar } = useDatos<PaginaLegalResumen[]>('/api/admin/paginas-legales');
  return (
    <div>
      <EncabezadoPagina titulo="Páginas legales" descripcion="Se enlazan desde el pie de página y el formulario de citas. La política de privacidad es obligatoria porque la web recoge datos de salud." />
      <p className="mb-5 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">{AVISO_LEGAL}</p>
      {error && <MensajeError mensaje={error} reintentar={recargar} />}
      {cargando && !datos && <LoadingFallback texto="Cargando páginas..." />}
      <div className="space-y-3">
        {(datos ?? []).map((p) => (
          <button key={p.clave} type="button" onClick={() => navegar(`legales/${p.clave}`)} className="w-full text-left bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 hover:border-medical-500/50 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer">
            <span className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-medical-500/10 text-medical-600 dark:text-medical-400 flex items-center justify-center"><FileText className="w-5 h-5" /></span>
              <span>
                <span className="block font-bold text-slate-900 dark:text-white">{p.titulo}</span>
                <span className="block text-xs text-slate-500">{p.ruta} · Modificada el {formatearFecha(p.fechaModificacion)}</span>
              </span>
            </span>
            {p.publicada ? <Etiqueta color="verde">Publicada</Etiqueta> : <Etiqueta>Oculta</Etiqueta>}
          </button>
        ))}
      </div>
    </div>
  );
};

export const LegalEditor: React.FC<{ clave: string }> = ({ clave }) => {
  const avisos = useAvisos();
  const { confirmar } = useDialogos();
  const [pagina, setPagina] = useState<PaginaLegal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [sucio, setSucio] = useState(false);

  useEffect(() => {
    api.get<PaginaLegal>(`/api/admin/paginas-legales/${clave}`)
      .then(({ data }) => setPagina({ ...data, seo: { ...data.seo, metaTitulo: data.seo.metaTitulo ?? '', metaDescripcion: data.seo.metaDescripcion ?? '', imagenOgUrl: data.seo.imagenOgUrl ?? '' } }))
      .catch((e) => setError(mensajeError(e, 'No se pudo cargar la página.')));
  }, [clave]);

  if (error) return <MensajeError mensaje={error} />;
  if (!pagina) return <LoadingFallback texto="Cargando página..." />;

  const cambiar = (c: Partial<PaginaLegal>) => { setPagina({ ...pagina, ...c }); setSucio(true); };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    const seo: Seo = { ...pagina.seo, metaTitulo: pagina.seo.metaTitulo?.trim() || null, metaDescripcion: pagina.seo.metaDescripcion?.trim() || null, imagenOgUrl: pagina.seo.imagenOgUrl?.trim() || null };
    try {
      const { data } = await api.put<PaginaLegal>(`/api/admin/paginas-legales/${clave}`, { titulo: pagina.titulo, contenidoHtml: pagina.contenidoHtml, publicada: pagina.publicada, seo });
      setPagina({ ...data, seo: { ...data.seo, metaTitulo: data.seo.metaTitulo ?? '', metaDescripcion: data.seo.metaDescripcion ?? '', imagenOgUrl: data.seo.imagenOgUrl ?? '' } });
      setSucio(false);
      avisos.exito('Página guardada.');
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudo guardar.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={guardar} className="space-y-6">
      <EncabezadoPagina
        volver={() => { if (!sucio) navegar('legales'); else void confirmar({ titulo: 'Hay cambios sin guardar', mensaje: 'Si sales ahora, se perderán los cambios que hiciste.', textoAceptar: 'Salir sin guardar', textoCancelar: 'Seguir editando', peligro: true }).then((ok) => ok && navegar('legales')); }}
        titulo={pagina.titulo || 'Página legal'}
        descripcion={`Dirección fija en la web: ${pagina.ruta}`}
        acciones={
          <>
            {pagina.publicada && (
              <a href={`${WEB_URL}${pagina.ruta}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">
                <ExternalLink className="w-4 h-4" /> Ver página
              </a>
            )}
            <Boton type="submit" cargando={guardando} icono={<Save className="w-4 h-4" />}>Guardar</Boton>
          </>
        }
      />
      <p className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">{AVISO_LEGAL}</p>

      <Panel>
        <div className="space-y-4">
          <Campo etiqueta="Título" obligatorio maxLength={150} value={pagina.titulo} onChange={(e) => cambiar({ titulo: e.target.value })} />
          <Interruptor etiqueta="Publicada" descripcion={pagina.publicada ? 'Visible en la web y enlazada desde el pie de página.' : 'Oculta: no aparece en el pie de página.'} activo={pagina.publicada} onCambio={(v) => cambiar({ publicada: v })} />
        </div>
      </Panel>

      <Panel titulo="Contenido">
        <EditorVisual valor={pagina.contenidoHtml} onCambio={(html) => cambiar({ contenidoHtml: html })} alturaMinima="26rem" />
      </Panel>

      <SeoEditor seo={pagina.seo} onCambio={(seo) => cambiar({ seo })} ruta={pagina.ruta} tituloRespaldo={pagina.titulo} descripcionRespaldo={pagina.titulo} />
    </form>
  );
};
