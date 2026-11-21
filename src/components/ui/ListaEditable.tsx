import React from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { ContenidoItem } from '../../lib/tipos';

interface ListaEditableProps {
  titulo: string;
  descripcion?: string;
  items: ContenidoItem[];
  onCambio: (items: ContenidoItem[]) => void;
  /** Si se define, cada bloque tiene un campo de título (ej. "Pregunta"). */
  etiquetaTitulo?: string;
  etiquetaTexto: string;
  textoBoton: string;
  filasTexto?: number;
}

/** Editor de listas ordenables: síntomas, pasos, preguntas frecuentes, párrafos... */
export const ListaEditable: React.FC<ListaEditableProps> = ({ titulo, descripcion, items, onCambio, etiquetaTitulo, etiquetaTexto, textoBoton, filasTexto = 2 }) => {
  const actualizar = (i: number, cambio: Partial<ContenidoItem>) => onCambio(items.map((it, j) => (j === i ? { ...it, ...cambio } : it)));
  const mover = (i: number, d: -1 | 1) => {
    const copia = [...items];
    [copia[i], copia[i + d]] = [copia[i + d], copia[i]];
    onCambio(copia);
  };

  const claseInput = 'w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-medical-500';

  return (
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{titulo} <span className="text-slate-400 font-medium">({items.length})</span></h4>
        {descripcion && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{descripcion}</p>}
      </div>

      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950/40">
            <span className="w-6 h-6 shrink-0 rounded-lg bg-medical-500/10 text-medical-600 dark:text-medical-400 text-xs font-bold flex items-center justify-center mt-1">{i + 1}</span>
            <div className="flex-1 space-y-2">
              {etiquetaTitulo && (
                <input
                  aria-label={`${etiquetaTitulo} ${i + 1}`}
                  placeholder={etiquetaTitulo}
                  value={item.titulo ?? ''}
                  onChange={(e) => actualizar(i, { titulo: e.target.value })}
                  maxLength={200}
                  className={`${claseInput} font-semibold`}
                />
              )}
              <textarea
                aria-label={`${etiquetaTexto} ${i + 1}`}
                placeholder={etiquetaTexto}
                value={item.texto}
                onChange={(e) => actualizar(i, { texto: e.target.value })}
                maxLength={2000}
                rows={filasTexto}
                className={`${claseInput} resize-y`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <button type="button" disabled={i === 0} onClick={() => mover(i, -1)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 cursor-pointer" aria-label="Subir">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button type="button" disabled={i === items.length - 1} onClick={() => mover(i, 1)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 cursor-pointer" aria-label="Bajar">
                <ArrowDown className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => onCambio(items.filter((_, j) => j !== i))} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer" aria-label="Eliminar">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => onCambio([...items, { titulo: etiquetaTitulo ? '' : null, texto: '' }])}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-medical-600 dark:text-medical-400 hover:underline cursor-pointer"
      >
        <Plus className="w-4 h-4" /> {textoBoton}
      </button>
    </div>
  );
};
