import React from 'react';

const claseInput =
  'w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 transition-colors disabled:opacity-60';

interface BaseProps {
  etiqueta: string;
  ayuda?: React.ReactNode;
  /** Muestra "n / max" bajo el campo. */
  contador?: { actual: number; recomendado: number; maximo: number };
  className?: string;
  obligatorio?: boolean;
}

const Envoltura: React.FC<BaseProps & { id: string; children: React.ReactNode }> = ({ etiqueta, ayuda, contador, className = '', obligatorio, id, children }) => (
  <div className={className}>
    <label htmlFor={id} className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
      {etiqueta}
      {obligatorio && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {(ayuda || contador) && (
      <div className="mt-1 flex items-start justify-between gap-3 text-[11px] leading-snug">
        <span className="text-slate-500 dark:text-slate-400">{ayuda}</span>
        {contador && <Contador {...contador} />}
      </div>
    )}
  </div>
);

export const Contador: React.FC<{ actual: number; recomendado: number; maximo: number }> = ({ actual, recomendado, maximo }) => {
  const color =
    actual === 0 ? 'text-slate-400' : actual > maximo ? 'text-red-600 font-bold' : actual > recomendado ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold';
  return <span className={`shrink-0 tabular-nums ${color}`}>{actual} / {recomendado}</span>;
};

const useId = (prefijo: string) => `${prefijo}-${React.useId()}`;

export const Campo: React.FC<BaseProps & React.InputHTMLAttributes<HTMLInputElement>> = ({ etiqueta, ayuda, contador, className, obligatorio, ...input }) => {
  const id = useId('campo');
  return (
    <Envoltura id={id} etiqueta={etiqueta} ayuda={ayuda} contador={contador} className={className} obligatorio={obligatorio}>
      <input id={id} required={obligatorio} {...input} className={claseInput} />
    </Envoltura>
  );
};

export const AreaTexto: React.FC<BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ etiqueta, ayuda, contador, className, obligatorio, ...area }) => {
  const id = useId('area');
  return (
    <Envoltura id={id} etiqueta={etiqueta} ayuda={ayuda} contador={contador} className={className} obligatorio={obligatorio}>
      <textarea id={id} required={obligatorio} rows={3} {...area} className={`${claseInput} resize-y`} />
    </Envoltura>
  );
};

export const Selector: React.FC<BaseProps & React.SelectHTMLAttributes<HTMLSelectElement> & { opciones: { valor: string | number; texto: string }[]; vacio?: string }> = ({
  etiqueta, ayuda, className, obligatorio, opciones, vacio, ...select
}) => {
  const id = useId('selector');
  return (
    <Envoltura id={id} etiqueta={etiqueta} ayuda={ayuda} className={className} obligatorio={obligatorio}>
      <select id={id} required={obligatorio} {...select} className={claseInput}>
        {vacio !== undefined && <option value="">{vacio}</option>}
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>{o.texto}</option>
        ))}
      </select>
    </Envoltura>
  );
};

export const Interruptor: React.FC<{ etiqueta: string; descripcion?: string; activo: boolean; onCambio: (v: boolean) => void }> = ({ etiqueta, descripcion, activo, onCambio }) => (
  <label className="flex items-start gap-3 cursor-pointer select-none">
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onCambio(!activo)}
      className={`mt-0.5 relative w-10 h-6 shrink-0 rounded-full transition-colors ${activo ? 'bg-medical-500' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${activo ? 'translate-x-4' : ''}`} />
    </button>
    <span>
      <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{etiqueta}</span>
      {descripcion && <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{descripcion}</span>}
    </span>
  </label>
);

type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma';
const estilosBoton: Record<VarianteBoton, string> = {
  primario: 'bg-gradient-to-r from-medical-500 to-blue-600 hover:from-medical-600 hover:to-blue-700 text-white shadow-md shadow-medical-500/20',
  secundario: 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700',
  peligro: 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20',
  fantasma: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5',
};

export const Boton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: VarianteBoton; cargando?: boolean; icono?: React.ReactNode }> = ({
  variante = 'primario', cargando, icono, children, className = '', disabled, ...boton
}) => (
  <button
    type="button"
    {...boton}
    disabled={disabled || cargando}
    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${estilosBoton[variante]} ${className}`}
  >
    {cargando ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icono}
    {children}
  </button>
);

export const Panel: React.FC<{ titulo?: string; descripcion?: string; acciones?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ titulo, descripcion, acciones, children, className = '' }) => (
  <section className={`bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm ${className}`}>
    {(titulo || acciones) && (
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          {titulo && <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{titulo}</h3>}
          {descripcion && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{descripcion}</p>}
        </div>
        {acciones}
      </div>
    )}
    {children}
  </section>
);

export const EncabezadoPagina: React.FC<{ titulo: string; descripcion?: string; acciones?: React.ReactNode; volver?: () => void }> = ({ titulo, descripcion, acciones, volver }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      {volver && (
        <button type="button" onClick={volver} className="text-xs font-semibold text-medical-600 dark:text-medical-400 hover:underline mb-2 cursor-pointer">
          ← Volver
        </button>
      )}
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{titulo}</h2>
      {descripcion && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{descripcion}</p>}
    </div>
    {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
  </div>
);

export const MensajeError: React.FC<{ mensaje: string; reintentar?: () => void }> = ({ mensaje, reintentar }) => (
  <div className="p-5 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-sm text-red-700 dark:text-red-300 flex flex-wrap items-center justify-between gap-3">
    <span>{mensaje}</span>
    {reintentar && <Boton variante="secundario" onClick={reintentar}>Reintentar</Boton>}
  </div>
);

export const Etiqueta: React.FC<{ color?: 'verde' | 'ambar' | 'gris' | 'rojo' | 'azul'; children: React.ReactNode }> = ({ color = 'gris', children }) => {
  const colores = {
    verde: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
    ambar: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
    rojo: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',
    azul: 'bg-medical-50 text-medical-700 border-medical-200 dark:bg-medical-500/10 dark:text-medical-400 dark:border-medical-500/30',
    gris: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold whitespace-nowrap ${colores[color]}`}>{children}</span>;
};
