import React from 'react';
import { Calendar, Clock, Globe, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { WEB_URL } from '../../lib/router';
import { agruparHorarios, formatearTelefono } from '../../lib/texto';
import type { Configuracion, Horario } from '../../lib/tipos';

/**
 * Réplicas en miniatura de partes reales de la web, que se actualizan mientras se escribe.
 * Sirven para que quien edita vea exactamente dónde aparece cada dato.
 */

const urlImagen = (ruta?: string | null) => (!ruta ? null : ruta.startsWith('http') ? ruta : `${WEB_URL}${ruta}`);
const LOGO = `${WEB_URL}/imagenes/logo-dr-juan-carlos-marcos.jpg`;

/** Marco con título "Así se ve en la web: …" */
export const MarcoVista: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
  <figure>
    <figcaption className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" /> Así se ve en la web · {titulo}
    </figcaption>
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm bg-white text-slate-800" style={{ fontFamily: 'var(--font-sans)' }}>
      {children}
    </div>
  </figure>
);

/** Barra superior de la web. */
export const VistaCabecera: React.FC<{ c: Configuracion }> = ({ c }) => (
  <MarcoVista titulo="Cabecera (todas las páginas)">
    <div className="px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <img src={LOGO} alt="" className="w-8 h-8 rounded-full object-contain shrink-0" />
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-extrabold text-[#0a192f] truncate">{c.nombreCorto || c.nombreDoctor || 'Nombre corto'}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-[#0284c7]">Cirugía general y digestiva</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {c.telefonoPrincipal && (
          <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#0a192f]"><Phone className="w-3 h-3 text-[#0284c7]" />{formatearTelefono(c.telefonoPrincipal)}</span>
        )}
        <span className="flex items-center gap-1 rounded-lg bg-[#0284c7] text-white text-[10px] font-bold px-2.5 py-1.5"><Calendar className="w-3 h-3" />Agendar cita</span>
      </div>
    </div>
  </MarcoVista>
);

/** Parte superior de la portada. */
export const VistaPortada: React.FC<{ c: Configuracion }> = ({ c }) => {
  const foto = urlImagen(c.fotoDoctorUrl);
  return (
    <MarcoVista titulo="Portada">
      <div className="p-4 bg-gradient-to-b from-[#f0f9ff] to-white grid grid-cols-[1fr_6.5rem] gap-4 items-center">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#0369a1]">
            Cirujano general en {[c.distrito, c.ciudad || 'Lima'].filter(Boolean).join(', ')}
          </p>
          <p className="mt-1.5 text-base font-extrabold leading-tight text-[#0a192f]">
            Cirugía general y del aparato digestivo con <span className="text-[#0284c7]">mínima invasión</span>
          </p>
          {(c.cmp || c.rne) && (
            <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
              <ShieldCheck className="w-3 h-3 text-[#0284c7] shrink-0" />
              <span className="truncate">{c.nombreDoctor}{c.cmp && ` · CMP ${c.cmp}`}{c.rne && ` · RNE ${c.rne}`}</span>
            </p>
          )}
        </div>
        <div className="relative">
          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-200 border-2 border-white shadow">
            {foto ? <img src={foto} alt="" className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-[10px] text-slate-500">Sin foto</span>}
          </div>
          <div className="absolute -bottom-2 -left-3 right-1 bg-white rounded-lg shadow px-1.5 py-1">
            <p className="text-[8px] font-extrabold text-[#0a192f] truncate">{c.nombreDoctor}</p>
            <p className="text-[7px] text-[#0369a1] truncate">{c.especialidad}</p>
          </div>
        </div>
      </div>
    </MarcoVista>
  );
};

/** Botón verde flotante de WhatsApp. */
export const VistaWhatsapp: React.FC<{ c: Configuracion }> = ({ c }) => {
  const numero = c.whatsApp || (/^\+?(51)?\s*9/.test(c.telefonoSecundario ?? '') ? c.telefonoSecundario : null);
  return (
    <MarcoVista titulo="Botón de WhatsApp (esquina inferior)">
      <div className="p-4 flex items-center justify-between gap-3 bg-slate-50">
        <p className="text-xs text-slate-500">
          {numero ? <>Abre un chat con <strong className="text-slate-700">{formatearTelefono(numero)}</strong></> : 'Sin número: el botón no se muestra.'}
        </p>
        <span className={`flex items-center gap-1.5 rounded-full text-white text-xs font-bold px-3 py-2 ${numero ? 'bg-[#25D366]' : 'bg-slate-300'}`}>
          <MessageCircle className="w-4 h-4" /> Escríbenos
        </span>
      </div>
    </MarcoVista>
  );
};

/** Pie de página completo. */
export const VistaPie: React.FC<{ c: Configuracion; horarios: Horario[]; resaltar?: 'contacto' | 'horarios' | 'presentacion' | 'redes' }> = ({ c, horarios, resaltar }) => {
  const marca = (zona: typeof resaltar) => (resaltar === zona ? 'ring-2 ring-[#38bdf8] ring-offset-2 ring-offset-[#050d1a] rounded-lg' : '');
  const redes = [['Facebook', c.facebookUrl], ['Instagram', c.instagramUrl], ['TikTok', c.tikTokUrl], ['YouTube', c.youTubeUrl], ['LinkedIn', c.linkedInUrl]].filter(([, u]) => u);
  const direccion = [c.direccion, c.distrito, c.ciudad].filter(Boolean).join(', ');

  return (
    <MarcoVista titulo="Pie de página (todas las páginas)">
      <div className="bg-[#050d1a] text-slate-300 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[10px] leading-snug">
        <div className={`space-y-1.5 p-1 ${marca('presentacion')} ${resaltar === 'redes' ? marca('redes') : ''}`}>
          <div className="flex items-center gap-1.5">
            <img src={LOGO} alt="" className="w-6 h-6 rounded-full bg-white object-contain" />
            <span className="font-bold text-white text-[11px]">{c.nombreDoctor}</span>
          </div>
          {c.descripcionPie && <p className="text-slate-300">{c.descripcionPie}</p>}
          <p className="text-slate-400">{c.especialidad}{c.cmp && ` CMP ${c.cmp}`}{c.rne && ` · RNE ${c.rne}`}</p>
          {redes.length > 0 && <p className="text-slate-300">{redes.map(([n]) => n).join(' · ')}</p>}
        </div>
        <div className={`space-y-1.5 p-1 ${marca('contacto')}`}>
          <p className="font-bold text-white uppercase tracking-wider text-[9px]">Consultorio</p>
          {direccion && <p className="flex gap-1"><MapPin className="w-3 h-3 shrink-0 text-[#38bdf8]" />{direccion}</p>}
          {c.telefonoPrincipal && (
            <p className="flex gap-1"><Phone className="w-3 h-3 shrink-0 text-[#38bdf8]" />Citas: {formatearTelefono(c.telefonoPrincipal)}{c.telefonoSecundario && ` / ${formatearTelefono(c.telefonoSecundario)}`}</p>
          )}
          {c.correo && <p className="flex gap-1"><Mail className="w-3 h-3 shrink-0 text-[#38bdf8]" />{c.correo}</p>}
        </div>
        <div className={`space-y-1 p-1 ${marca('horarios')}`}>
          <p className="font-bold text-white uppercase tracking-wider text-[9px]">Horarios</p>
          {agruparHorarios(horarios).map((h) => (
            <p key={h.dias} className="flex gap-1"><Clock className="w-3 h-3 shrink-0 text-[#38bdf8]" /><span><span className="text-white">{h.dias}:</span> {h.horas}</span></p>
          ))}
          {c.mostrarEmergencias && c.textoEmergencias && <p className="pt-1 font-semibold text-red-300">{c.textoEmergencias}</p>}
        </div>
      </div>
    </MarcoVista>
  );
};

/** Resultado de búsqueda de Google para la portada. */
export const VistaGoogle: React.FC<{ c: Configuracion }> = ({ c }) => (
  <MarcoVista titulo="Resultado en Google">
    <div className="p-4" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><Globe className="w-3.5 h-3.5 text-slate-500" /></span>
        <div className="leading-tight">
          <p className="text-xs text-[#202124]">{c.nombreDoctor}</p>
          <p className="text-[11px] text-[#4d5156]">{(c.siteUrl || 'https://cirujanogeneral.pe').replace(/^https?:\/\//, '')}</p>
        </div>
      </div>
      <p className="text-lg text-[#1a0dab] leading-snug line-clamp-1">{c.metaTituloPorDefecto || c.nombreDoctor}</p>
      <p className="text-xs text-[#4d5156] leading-snug mt-0.5 line-clamp-2">{c.metaDescripcionPorDefecto || 'Descripción por defecto del sitio.'}</p>
    </div>
  </MarcoVista>
);
