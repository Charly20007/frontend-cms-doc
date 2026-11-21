import React from 'react';
import { RefreshCw } from 'lucide-react';
import { generarSlug } from '../../lib/texto';

interface SlugInputProps {
  valor: string;
  onCambio: (v: string) => void;
  /** Prefijo de la URL, ej. "/procedimientos/". */
  prefijo: string;
  /** Texto desde el que se genera el slug (nombre o título). */
  origen: string;
  /** Slug guardado actualmente (si la página ya existe). */
  slugOriginal?: string;
}

export const SlugInput: React.FC<SlugInputProps> = ({ valor, onCambio, prefijo, origen, slugOriginal }) => {
  const cambiado = !!slugOriginal && valor !== slugOriginal;
  const invalido = valor !== '' && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(valor);

  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Dirección (URL) de la página</label>
      <div className="flex items-stretch rounded-xl border border-slate-300 dark:border-white/10 overflow-hidden focus-within:border-medical-500 focus-within:ring-2 focus-within:ring-medical-500/20">
        <span className="px-3 flex items-center bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{prefijo}</span>
        <input
          aria-label="Slug"
          value={valor}
          onChange={(e) => onCambio(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
          placeholder={generarSlug(origen) || 'se-genera-del-nombre'}
          maxLength={150}
          className="flex-1 min-w-0 bg-white dark:bg-navy-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onCambio(generarSlug(origen))}
          title="Generar desde el nombre"
          className="px-3 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-medical-600 border-l border-slate-300 dark:border-white/10 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <p className="mt-1 text-[11px] leading-snug">
        {invalido ? (
          <span className="text-red-600 font-semibold">Use solo minúsculas sin tildes, números y guiones.</span>
        ) : cambiado ? (
          <span className="text-amber-600 font-semibold">
            Al guardar, la dirección anterior ({prefijo}{slugOriginal}) redirigirá automáticamente a la nueva (301). Cambie la URL solo si es necesario.
          </span>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">Corta, en minúsculas y con la palabra clave. Ej.: cirugia-de-vesicula-laparoscopica</span>
        )}
      </p>
    </div>
  );
};
