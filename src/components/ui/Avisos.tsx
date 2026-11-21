import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface Aviso {
  id: number;
  tipo: 'exito' | 'error';
  texto: string;
}

const AvisosContext = createContext<{ exito: (t: string) => void; error: (t: string) => void } | undefined>(undefined);

/** Notificaciones flotantes ("Guardado", "Error al guardar..."). */
export const AvisosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const quitar = useCallback((id: number) => setAvisos((a) => a.filter((x) => x.id !== id)), []);
  const agregar = useCallback((tipo: Aviso['tipo'], texto: string) => {
    const id = Date.now() + Math.random();
    setAvisos((a) => [...a, { id, tipo, texto }]);
    window.setTimeout(() => quitar(id), tipo === 'error' ? 7000 : 3500);
  }, [quitar]);

  const exito = useCallback((t: string) => agregar('exito', t), [agregar]);
  const error = useCallback((t: string) => agregar('error', t), [agregar]);

  return (
    <AvisosContext.Provider value={{ exito, error }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2 w-[min(24rem,calc(100vw-2.5rem))]" aria-live="polite">
        {avisos.map((a) => (
          <div
            key={a.id}
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border text-sm font-medium ${
              a.tipo === 'exito'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-500/40 dark:text-emerald-200'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-500/40 dark:text-red-200'
            }`}
          >
            {a.tipo === 'exito' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="flex-1">{a.texto}</span>
            <button type="button" onClick={() => quitar(a.id)} className="opacity-60 hover:opacity-100 cursor-pointer" aria-label="Cerrar">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </AvisosContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAvisos = () => {
  const ctx = useContext(AvisosContext);
  if (!ctx) throw new Error('useAvisos debe usarse dentro de AvisosProvider');
  return ctx;
};
