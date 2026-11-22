import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

interface OpcionesConfirmar {
  titulo: string;
  mensaje?: React.ReactNode;
  textoAceptar?: string;
  textoCancelar?: string;
  /** Acción destructiva (eliminar, cancelar, salir sin guardar): botón rojo. */
  peligro?: boolean;
}

interface OpcionesPedirTexto {
  titulo: string;
  etiqueta: string;
  valorInicial?: string;
  textoAceptar?: string;
  maxLength?: number;
}

type Pendiente =
  | { tipo: 'confirmar'; opciones: OpcionesConfirmar; resolver: (v: boolean) => void }
  | { tipo: 'texto'; opciones: OpcionesPedirTexto; resolver: (v: string | null) => void };

interface DialogosApi {
  /** Reemplaza a window.confirm: devuelve true si el usuario acepta. */
  confirmar: (opciones: OpcionesConfirmar) => Promise<boolean>;
  /** Reemplaza a window.prompt: devuelve el texto o null si cancela. */
  pedirTexto: (opciones: OpcionesPedirTexto) => Promise<string | null>;
}

const DialogosContext = createContext<DialogosApi | undefined>(undefined);

/** Diálogos de confirmación con el estilo del panel (en lugar de los nativos del navegador). */
export const DialogosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);

  const confirmar = useCallback(
    (opciones: OpcionesConfirmar) => new Promise<boolean>((resolver) => setPendiente({ tipo: 'confirmar', opciones, resolver })),
    [],
  );
  const pedirTexto = useCallback(
    (opciones: OpcionesPedirTexto) => new Promise<string | null>((resolver) => setPendiente({ tipo: 'texto', opciones, resolver })),
    [],
  );

  const cerrar = (valor: boolean | string | null) => {
    if (!pendiente) return;
    if (pendiente.tipo === 'confirmar') pendiente.resolver(valor === true);
    else pendiente.resolver(typeof valor === 'string' ? valor : null);
    setPendiente(null);
  };

  return (
    <DialogosContext.Provider value={{ confirmar, pedirTexto }}>
      {children}
      {pendiente && <Dialogo pendiente={pendiente} alCerrar={cerrar} />}
    </DialogosContext.Provider>
  );
};

const Dialogo: React.FC<{ pendiente: Pendiente; alCerrar: (valor: boolean | string | null) => void }> = ({ pendiente, alCerrar }) => {
  const { opciones } = pendiente;
  const peligro = pendiente.tipo === 'confirmar' && pendiente.opciones.peligro;
  const [texto, setTexto] = useState(pendiente.tipo === 'texto' ? pendiente.opciones.valorInicial ?? '' : '');
  const aceptarRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Foco inicial y Escape para cancelar (solo al abrir: no se repite al escribir)
  const alCerrarRef = useRef(alCerrar);
  alCerrarRef.current = alCerrar;
  useEffect(() => {
    if (pendiente.tipo === 'texto') inputRef.current?.select();
    else aceptarRef.current?.focus();
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') alCerrarRef.current(null); };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [pendiente]);

  const aceptar = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendiente.tipo === 'texto') {
      if (texto.trim()) alCerrar(texto.trim());
    } else alCerrar(true);
  };

  const textoAceptar = opciones.textoAceptar ?? 'Aceptar';
  const textoCancelar = (pendiente.tipo === 'confirmar' && pendiente.opciones.textoCancelar) || 'Cancelar';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-sm" onMouseDown={() => alCerrar(null)}>
      <form
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialogo-titulo"
        onSubmit={aceptar}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${peligro ? 'bg-red-50 text-red-600 dark:bg-red-500/10' : 'bg-medical-50 text-medical-600 dark:bg-medical-500/10'}`}>
            {peligro ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="dialogo-titulo" className="text-base font-bold text-slate-900 dark:text-white">{opciones.titulo}</h2>
            {pendiente.tipo === 'confirmar' && pendiente.opciones.mensaje && (
              <div className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{pendiente.opciones.mensaje}</div>
            )}
            {pendiente.tipo === 'texto' && (
              <label className="block mt-3">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{pendiente.opciones.etiqueta}</span>
                <input
                  ref={inputRef}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  maxLength={pendiente.opciones.maxLength}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-500"
                />
              </label>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={() => alCerrar(null)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
          >
            {textoCancelar}
          </button>
          <button
            ref={aceptarRef}
            type="submit"
            disabled={pendiente.tipo === 'texto' && !texto.trim()}
            className={`px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${peligro ? 'bg-red-600 hover:bg-red-700' : 'bg-medical-600 hover:bg-medical-700'}`}
          >
            {textoAceptar}
          </button>
        </div>
      </form>
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDialogos = () => {
  const ctx = useContext(DialogosContext);
  if (!ctx) throw new Error('useDialogos debe usarse dentro de DialogosProvider');
  return ctx;
};
