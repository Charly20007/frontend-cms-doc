import React, { useState } from 'react';
import { CalendarOff, Plus, Trash2 } from 'lucide-react';
import { api, mensajeError } from '../../lib/api';
import { useDatos } from '../../lib/datos';
import type { Bloqueo } from '../../lib/tipos';
import { Boton, Campo, Panel } from '../../components/ui/Formulario';
import { useAvisos } from '../../components/ui/Avisos';
import { useDialogos } from '../../components/ui/Dialogos';

const formato = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Bloqueos de agenda: en esos periodos la web no ofrece turnos. */
export const BloqueosPanel: React.FC = () => {
  const avisos = useAvisos();
  const { confirmar } = useDialogos();
  const { datos, recargar } = useDatos<Bloqueo[]>('/api/admin/agenda/bloqueos');
  const [abierto, setAbierto] = useState(false);
  const [diaCompleto, setDiaCompleto] = useState(true);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    // Día completo: desde las 00:00 del primer día hasta las 00:00 del día siguiente al último
    const inicio = diaCompleto ? `${desde}T00:00:00` : `${desde}:00`;
    const fin = diaCompleto
      ? new Date(new Date(`${hasta || desde}T00:00:00`).getTime() + 86400000).toISOString().slice(0, 10) + 'T00:00:00'
      : `${hasta}:00`;
    setGuardando(true);
    try {
      await api.post('/api/admin/agenda/bloqueos', { fechaInicio: inicio, fechaFin: fin, motivo });
      avisos.exito('Horario bloqueado. La web ya no ofrece esos turnos.');
      setAbierto(false); setDesde(''); setHasta(''); setMotivo('');
      await recargar();
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudo bloquear.'));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (b: Bloqueo) => {
    if (!(await confirmar({ titulo: `¿Quitar el bloqueo «${b.motivo}»?`, mensaje: 'Esos turnos volverán a ofrecerse en la web.', textoAceptar: 'Quitar bloqueo' }))) return;
    try {
      await api.delete(`/api/admin/agenda/bloqueos/${b.id}`);
      avisos.exito('Bloqueo eliminado.');
      await recargar();
    } catch (err) {
      avisos.error(mensajeError(err));
    }
  };

  return (
    <Panel
      titulo="Horarios bloqueados"
      descripcion="Vacaciones, congresos o días de quirófano: en esos periodos la web no ofrece turnos."
      className="mb-6"
      acciones={!abierto && <Boton variante="secundario" icono={<Plus className="w-4 h-4" />} onClick={() => setAbierto(true)}>Bloquear horario</Boton>}
    >
      {abierto && (
        <form onSubmit={guardar} className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/40 border border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <button key={String(v)} type="button" onClick={() => { setDiaCompleto(v); setDesde(''); setHasta(''); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${diaCompleto === v ? 'bg-medical-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'}`}>
                {v ? 'Días completos' : 'Unas horas'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Campo etiqueta={diaCompleto ? 'Desde el día' : 'Desde'} type={diaCompleto ? 'date' : 'datetime-local'} value={desde} onChange={(e) => setDesde(e.target.value)} obligatorio />
            <Campo etiqueta={diaCompleto ? 'Hasta el día (incluido)' : 'Hasta'} type={diaCompleto ? 'date' : 'datetime-local'} value={hasta} onChange={(e) => setHasta(e.target.value)} obligatorio={!diaCompleto} ayuda={diaCompleto ? 'Vacío = solo un día.' : undefined} />
            <Campo etiqueta="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={255} placeholder="Vacaciones, congreso, quirófano…" obligatorio ayuda="Solo lo ve el consultorio." />
          </div>
          <div className="flex justify-end gap-2">
            <Boton variante="secundario" onClick={() => setAbierto(false)}>Cancelar</Boton>
            <Boton type="submit" cargando={guardando}>Bloquear</Boton>
          </div>
        </form>
      )}

      {datos && datos.length === 0 && !abierto && <p className="text-sm text-slate-500">No hay horarios bloqueados.</p>}
      {datos && datos.length > 0 && (
        <ul className="divide-y divide-slate-200 dark:divide-white/5">
          {datos.map((b) => (
            <li key={b.id} className="py-3 flex items-center justify-between gap-3">
              <span className="flex items-start gap-3">
                <CalendarOff className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">{b.motivo}</span>
                  <span className="block text-xs text-slate-500">{formato(b.fechaInicio)} → {formato(b.fechaFin)}</span>
                </span>
              </span>
              <button type="button" title="Quitar bloqueo" onClick={() => eliminar(b)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};
