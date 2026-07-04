import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface Cita {
  id: number;
  pacienteNombreCompleto: string;
  servicioMedicoNombre: string;
  fechaHoraInicio: string;
  motivoConsulta?: string;
  estadoCitaNombre: 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Atendida';
  estadoColorHex: string;
}

const CITAS_FALLBACK: Cita[] = [
  {
    id: 101,
    pacienteNombreCompleto: 'Carlos Alberto Ramos',
    servicioMedicoNombre: 'Colecistectomía Laparoscópica (Cirugía de Vesícula)',
    fechaHoraInicio: '2026-07-03T08:00:00',
    motivoConsulta: 'Dolor punzante luego de comer grasas, tengo ecografía y riesgo quirúrgico listo.',
    estadoCitaNombre: 'Confirmada',
    estadoColorHex: '#0284C7'
  },
  {
    id: 102,
    pacienteNombreCompleto: 'Jorge Paredes Mendoza',
    servicioMedicoNombre: 'Reparación de Hernia Inguinal o Umbilical',
    fechaHoraInicio: '2026-07-03T11:30:00',
    motivoConsulta: 'Bulto inguinal doloroso al esfuerzo físico en el trabajo.',
    estadoCitaNombre: 'Pendiente',
    estadoColorHex: '#F59E0B'
  },
  {
    id: 103,
    pacienteNombreCompleto: 'Lucía Fernández Castro',
    servicioMedicoNombre: 'Consulta de Valoración Quirúrgica Especializada',
    fechaHoraInicio: '2026-07-03T16:00:00',
    motivoConsulta: 'Segunda opinión sobre cálculos biliares diagnosticados ayer.',
    estadoCitaNombre: 'Pendiente',
    estadoColorHex: '#F59E0B'
  },
  {
    id: 104,
    pacienteNombreCompleto: 'Roberto Gómez Silva',
    servicioMedicoNombre: 'Apendicectomía Laparoscópica',
    fechaHoraInicio: '2026-07-04T09:00:00',
    motivoConsulta: 'Dolor agudo abdominal inferior derecho.',
    estadoCitaNombre: 'Pendiente',
    estadoColorHex: '#F59E0B'
  }
];

export const CitasTable: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>(CITAS_FALLBACK);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtro, setFiltro] = useState<'todos' | 'pendiente' | 'confirmada'>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  const fetchCitas = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/citas', { timeout: 3000 });
      if (res.data && res.data.length > 0) {
        setCitas(res.data);
      }
    } catch {
      console.info('Usando agenda local optimizada (Fallback Modo Offline/Demo)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const handleCambiarEstado = async (id: number, nuevoEstado: 'Confirmada' | 'Cancelada', colorHex: string) => {
    try {
      await axios.put(`http://localhost:5000/api/citas/${id}/estado`, { nuevoEstadoNombre: nuevoEstado });
    } catch {
      console.info('Simulación de actualización de estado local');
    } finally {
      setCitas(prev => prev.map(c => c.id === id ? { ...c, estadoCitaNombre: nuevoEstado, estadoColorHex: colorHex } : c));
    }
  };

  const citasFiltradas = citas.filter(c => {
    if (filtro === 'pendiente' && c.estadoCitaNombre !== 'Pendiente') return false;
    if (filtro === 'confirmada' && c.estadoCitaNombre !== 'Confirmada') return false;
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      return c.pacienteNombreCompleto.toLowerCase().includes(termino) ||
             c.servicioMedicoNombre.toLowerCase().includes(termino);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Cabecera superior y controles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Agenda & Gestión de Citas</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administre las solicitudes entrantes del portal web y confirme horarios en quirófano.
          </p>
        </div>
        
        <button
          onClick={fetchCitas}
          disabled={loading}
          className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 hover:border-medical-500 text-slate-700 dark:text-slate-200 hover:text-medical-600 dark:hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-medical-500' : ''}`} />
          <span>Sincronizar Agenda</span>
        </button>
      </div>

      {/* Barra de filtros y búsqueda */}
      <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filtro === 'todos' ? 'bg-medical-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todas ({citas.length})
          </button>
          <button
            onClick={() => setFiltro('pendiente')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filtro === 'pendiente' ? 'bg-amber-500 text-navy-950 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pendientes ({citas.filter(c => c.estadoCitaNombre === 'Pendiente').length})
          </button>
          <button
            onClick={() => setFiltro('confirmada')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filtro === 'confirmada' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Confirmadas ({citas.filter(c => c.estadoCitaNombre === 'Confirmada').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por paciente o cirugía..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-medical-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabla de citas */}
      <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-navy-950 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="py-4 px-6 font-bold">Paciente & Procedimiento</th>
                <th className="py-4 px-6 font-bold">Fecha & Horario</th>
                <th className="py-4 px-6 font-bold">Motivo / Síntomas</th>
                <th className="py-4 px-6 font-bold">Estado</th>
                <th className="py-4 px-6 font-bold text-right">Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {citasFiltradas.map((cita) => (
                <tr key={cita.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  
                  {/* Paciente y Cirugía */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 dark:text-white text-base">{cita.pacienteNombreCompleto}</div>
                    <div className="text-xs text-medical-600 dark:text-medical-400 font-medium mt-0.5">{cita.servicioMedicoNombre}</div>
                  </td>

                  {/* Horario */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {new Date(cita.fechaHoraInicio).toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-medical-600 dark:text-medical-400" />
                      <span>{new Date(cita.fechaHoraInicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>

                  {/* Motivo */}
                  <td className="py-4 px-6">
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs line-clamp-2 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                      {cita.motivoConsulta || 'Sin observaciones especificadas.'}
                    </p>
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span 
                      style={{ backgroundColor: `${cita.estadoColorHex}15`, color: cita.estadoColorHex, borderColor: `${cita.estadoColorHex}40` }}
                      className="px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cita.estadoColorHex }} />
                      {cita.estadoCitaNombre}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {cita.estadoCitaNombre === 'Pendiente' ? (
                        <>
                          <button
                            onClick={() => handleCambiarEstado(cita.id, 'Confirmada', '#0284C7')}
                            title="Confirmar Cita Médica"
                            className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-500/20 dark:hover:bg-blue-500 dark:text-blue-400 dark:hover:text-white px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmar</span>
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(cita.id, 'Cancelada', '#EF4444')}
                            title="Cancelar o Rechazar Cita"
                            className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-500/20 text-xs font-semibold transition-colors shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Gestionada</span>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
              {citasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    No se encontraron citas que coincidan con su criterio de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
