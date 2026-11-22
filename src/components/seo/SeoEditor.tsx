import React from 'react';
import { Globe, Image as ImageIcon } from 'lucide-react';
import { AreaTexto, Campo, Interruptor, Panel } from '../ui/Formulario';
import { useConfigSitio } from '../../lib/datos';
import type { Seo } from '../../lib/tipos';
import { SEO_LIMITES } from '../../lib/seo';


interface SeoEditorProps {
  seo: Seo;
  onCambio: (seo: Seo) => void;
  /** Ruta pública de la página, ej. "/procedimientos/cirugia-de-vesicula". */
  ruta: string;
  /** Valores que usa la web si los campos SEO quedan vacíos. */
  tituloRespaldo: string;
  descripcionRespaldo: string;
  /** Si es false, se oculta el interruptor de indexación. */
  permitirNoIndex?: boolean;
}

/** Editor de SEO con contadores y vista previa del resultado en Google. */
export const SeoEditor: React.FC<SeoEditorProps> = ({ seo, onCambio, ruta, tituloRespaldo, descripcionRespaldo, permitirNoIndex = true }) => {
  const config = useConfigSitio();
  // Igual que el título de la web: «Título | Nombre corto del doctor»
  const marca = config?.nombreCorto || config?.nombreDoctor;
  const sufijo = marca ? ` | ${marca}` : '';
  // La portada y el perfil del doctor no llevan sufijo (ya incluyen el nombre)
  const sinSufijo = ruta === '/' || ruta === '/dr-juan-carlos-marcos';
  const titulo = (seo.metaTitulo?.trim() || tituloRespaldo) + (sinSufijo ? '' : sufijo);
  const descripcion = seo.metaDescripcion?.trim() || descripcionRespaldo;
  const dominio = (config?.siteUrl ?? 'https://cirujanogeneral.pe').replace(/^https?:\/\//, '');
  const migas = [dominio, ...ruta.split('/').filter(Boolean)].join(' › ');

  const cambiar = (c: Partial<Seo>) => onCambio({ ...seo, ...c });
  const largoTitulo = seo.metaTitulo?.length ?? 0;
  const largoDesc = seo.metaDescripcion?.length ?? 0;

  return (
    <Panel titulo="SEO: cómo aparece en Google" descripcion="Si deja un campo vacío, la web usa el nombre y el resumen de la página.">
      {/* Dos columnas solo si el panel es ancho (no la pantalla): dentro de un editor
          con barra lateral el panel es angosto y los campos van a lo ancho, con la vista previa debajo */}
      <div className="@container">
        <div className="grid grid-cols-1 @3xl:grid-cols-2 gap-6">
          <div className="space-y-4 min-w-0">
            <Campo
              etiqueta="Meta título"
              value={seo.metaTitulo ?? ''}
              onChange={(e) => cambiar({ metaTitulo: e.target.value })}
              maxLength={SEO_LIMITES.titulo.maximo}
              placeholder={tituloRespaldo}
              ayuda="Incluya la palabra clave principal y la ciudad. Ej.: «Cirugía de Vesícula Laparoscópica en Lima»."
              contador={{ actual: largoTitulo, ...SEO_LIMITES.titulo }}
            />
            <AreaTexto
              etiqueta="Meta descripción"
              value={seo.metaDescripcion ?? ''}
              onChange={(e) => cambiar({ metaDescripcion: e.target.value })}
              maxLength={SEO_LIMITES.descripcion.maximo}
              rows={4}
              placeholder={descripcionRespaldo}
              ayuda="Resuma la página e invite a actuar (agendar, llamar). Es el texto gris bajo el título."
              contador={{ actual: largoDesc, ...SEO_LIMITES.descripcion }}
            />
            <Campo
              etiqueta="Imagen para redes sociales (opcional)"
              value={seo.imagenOgUrl ?? ''}
              onChange={(e) => cambiar({ imagenOgUrl: e.target.value })}
              maxLength={500}
              placeholder="/imagenes/vesicula.jpg o https://..."
              ayuda="Se muestra al compartir el enlace por WhatsApp o Facebook. Tamaño ideal: 1200 × 630 px."
            />
            {permitirNoIndex && (
              <Interruptor
                etiqueta="Mostrar en Google"
                descripcion={seo.indexable ? 'La página puede aparecer en los resultados de búsqueda.' : 'Oculta: la página lleva «noindex» y no entra en el sitemap.'}
                activo={seo.indexable}
                onCambio={(v) => cambiar({ indexable: v })}
              />
            )}
          </div>

          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Vista previa en Google</span>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white p-5 font-[Arial,sans-serif]">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 shrink-0 rounded-full bg-slate-100 flex items-center justify-center"><Globe className="w-4 h-4 text-slate-500" /></span>
                <div className="leading-tight min-w-0">
                  <div className="text-sm text-[#202124]">{config?.nombreDoctor ?? 'Dr. Juan Carlos Marcos'}</div>
                  <div className="text-xs text-[#4d5156] truncate">{migas}</div>
                </div>
              </div>
              <div className="text-xl text-[#1a0dab] leading-snug line-clamp-1">{titulo}</div>
              <div className="text-sm text-[#4d5156] leading-snug mt-1 line-clamp-2">{descripcion}</div>
            </div>
            {sufijo && !sinSufijo && (
              <p className={`mt-3 text-xs ${titulo.length > SEO_LIMITES.titulo.recomendado ? 'text-amber-600 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                Título completo en Google: {titulo.length} caracteres (la web añade «{sufijo.trim()}» al final).
                {titulo.length > SEO_LIMITES.titulo.recomendado && ' Google mostrará solo el inicio: ponga lo importante al principio.'}
              </p>
            )}
            {!seo.indexable && (
              <p className="mt-3 text-xs font-semibold text-amber-600">Esta página no aparecerá en Google mientras «Mostrar en Google» esté desactivado.</p>
            )}
            {seo.imagenOgUrl && (
              <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Imagen para compartir configurada.</p>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
};
