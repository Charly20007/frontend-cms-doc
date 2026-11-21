import React, { useMemo, useState } from 'react';
import { Clock, Mail, Phone, RefreshCw, Search } from 'lucide-react';
import { api, mensajeError } from '../../lib/api';
import { useDatos } from '../../lib/datos';
import type { Cita } from '../../lib/tipos';
import { Boton, EncabezadoPagina, MensajeError } from '../../components/ui/Formulario';
import { useAvisos } from '../../components/ui/Avisos';
import { LoadingFallback } from '../../components/LoadingFallback';

const ESTADOS = ['Pendiente', 'Confirmada', 'Atendida', 'Cancelada'] as const;
type Filtro = 'proximas' | 'todas' | (typeof ESTADOS)[number];

export const CitasModulo: React.FC = () => {
  const avisos = useAvisos();
  const { datos, setDatos, cargando, error, recargar } = useDatos<Cita[]>('/api/citas');
  const [filtro, setFiltro] = useState<Filtro>('proximas');
  const [busqueda, setBusqueda] = useState('');
  const [actualizando, setActualizando] = useState<number | null>(null);

  const citas = useMemo(() => {
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    const termino = busqueda.trim().toLowerCase();
    return (datos ?? [])
      .filter((c) => {
        if (filtro === 'proximas') return new Date(c.fechaHoraInicio) >= inicioHoy && c.estadoCitaNombre !== 'Cancelada';
        if (filtro === 'todas') return true;
        return c.estadoCitaNombre === filtro;
      })
      .filter((c) => !termino || [c.pacienteNombreCompleto, c.servicioMedicoNombre, c.pacienteCorreo, c.pacienteTelefono].some((v) => v?.toLowerCase().includes(termino)))
      .sort((a, b) => (filtro === 'proximas' ? 1 : -1) * (new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime()));
  }, [datos, filtro, busqueda]);

  const cambiarEstado = async (cita: Cita, estado: string) => {
    if (estado === 'Cancelada' && !window.confirm(`¿Cancelar la cita de ${cita.pacienteNombreCompleto}?`)) return;
    setActualizando(cita.id);
    try {
      const { data } = await api.put<{ estado: string; colorHex: string }>(`/api/citas/${cita.id}/estado`, { nuevoEstadoNombre: estado });
      setDatos((datos ?? []).map((c) => (c.id === cita.id ? { ...c, estadoCitaNombre: data.estado, estadoColorHex: data.colorHex } : c)));
      avisos.exito(`Cita ${data.estado.toLowerCase()}.`);
    } catch (e) {
      avisos.error(mensajeError(e, 'No se pudo actualizar la cita.'));
    } finally {
      setActualizando(null);
    }
  };

  const contar = (f: Filtro) => (datos ?? []).filter((c) => (f === 'todas' ? true : c.estadoCitaNombre === f)).length;

  return (
    <div>
      <EncabezadoPagina
        titulo="Agenda y citas"
        descripcion="Solicitudes que llegan desde el formulario de la web."
        acciones={<Boton variante="secundario" icono={<RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />} onClick={recargar}>Actualizar</Boton>}
      />

      <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {(['proximas', ...ESTADOS, 'todas'] as Filtro[]).map((f) => (
            <button key={f} type="button" onClick={() => setFiltro(f)} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${filtro === f ? 'bg-medical-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {f === 'proximas' ? 'Próximas' : f === 'todas' ? `Todas (${contar('todas')})` : `${f}s (${contar(f)})`}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="search"
            aria-label="Buscar"
            placeholder="Buscar paciente, teléfono o cirugía..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-medical-500"
          />
        </div>
      </div>

      {error && <MensajeError mensaje={error} reintentar={recargar} />}
      {cargando && !datos && <LoadingFallback texto="Cargando agenda..." />}

      {datos && (
        <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-navy-950 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-5">Paciente</th>
                  <th className="py-3 px-5">Fecha</th>
                  <th className="py-3 px-5">Motivo</th>
                  <th className="py-3 px-5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {citas.map((c) => (
                  <tr key={c.id} className="align-top">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 dark:text-white">{c.pacienteNombreCompleto}</div>
                      <div className="text-xs text-medical-600 dark:text-medical-400 mt-0.5">{c.servicioMedicoNombre}</div>
                      <div className="mt-1.5 flex flex-col gap-0.5 text-xs">
                        {c.pacienteTelefono && <a href={`tel:${c.pacienteTelefono.replace(/[^\d+]/g, '')}`} className="flex items-center gap-1 hover:text-medical-600"><Phone className="w-3 h-3" />{c.pacienteTelefono}</a>}
                        {c.pacienteCorreo && <a href={`mailto:${c.pacienteCorreo}`} className="flex items-center gap-1 hover:text-medical-600"><Mail className="w-3 h-3" />{c.pacienteCorreo}</a>}
                      </div>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{new Date(c.fechaHoraInicio).toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{new Date(c.fechaHoraInicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-xs max-w-xs whitespace-pre-line">{c.motivoConsulta || '—'}</p>
                    </td>
                    <td className="py-4 px-5">
                      <select
                        aria-label={`Estado de la cita de ${c.pacienteNombreCompleto}`}
                        value={c.estadoCitaNombre}
                        disabled={actualizando === c.id}
                        onChange={(e) => cambiarEstado(c, e.target.value)}
                        style={{ color: c.estadoColorHex, borderColor: `${c.estadoColorHex}66`, backgroundColor: `${c.estadoColorHex}12` }}
                        className="px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none"
                      >
                        {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {citas.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No hay citas en esta vista.</p>}
        </div>
      )}
    </div>
  );
};
