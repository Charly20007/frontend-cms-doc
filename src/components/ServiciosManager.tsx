import React, { useState } from 'react';
import { Scissors, Edit3, Check, DollarSign, Clock, Plus, ShieldAlert } from 'lucide-react';

interface ServicioEditor {
  id: number;
  nombre: string;
  slug: string;
  resumen: string;
  tiempoEstimadoMinutos: number;
  precioReferencial: number;
  especialidadNombre: string;
  destacadoEnWeb: boolean;
}

const SERVICIOS_INIT: ServicioEditor[] = [
  {
    id: 1,
    nombre: 'Colecistectomía Laparoscópica (Cirugía de Vesícula)',
    slug: 'cirugia-de-vesicula-laparoscopica',
    resumen: 'Extirpación de la vesícula biliar por mínima invasión. Rápida recuperación en 24 a 48 horas sin cicatrices visibles.',
    tiempoEstimadoMinutos: 60,
    precioReferencial: 3500.00,
    especialidadNombre: 'Cirugía Laparoscópica',
    destacadoEnWeb: true
  },
  {
    id: 2,
    nombre: 'Reparación de Hernia Inguinal o Umbilical',
    slug: 'cirugia-de-hernia-inguinal-umbilical',
    resumen: 'Corrección quirúrgica con colocación de malla biocompatible de alta calidad para evitar recurrencias.',
    tiempoEstimadoMinutos: 60,
    precioReferencial: 3000.00,
    especialidadNombre: 'Cirugía de Pared Abdominal',
    destacadoEnWeb: true
  },
  {
    id: 3,
    nombre: 'Apendicectomía Laparoscópica (Cirugía de Apéndice)',
    slug: 'cirugia-de-apendice-laparoscopica',
    resumen: 'Tratamiento seguro y oportuno para la apendicitis aguda con incisiones milimétricas, mínima estancia y recuperación inmediata.',
    tiempoEstimadoMinutos: 45,
    precioReferencial: 3200.00,
    especialidadNombre: 'Cirugía Laparoscópica',
    destacadoEnWeb: true
  },
  {
    id: 4,
    nombre: 'Consulta de Valoración Quirúrgica Especializada',
    slug: 'consulta-valoracion-quirurgica',
    resumen: 'Evaluación médica integral para diagnóstico preciso, revisión ecográfica/tomográfica y planificación personalizada de cirugía.',
    tiempoEstimadoMinutos: 30,
    precioReferencial: 200.00,
    especialidadNombre: 'Cirugía General',
    destacadoEnWeb: true
  }
];

export const ServiciosManager: React.FC = () => {
  const [servicios, setServicios] = useState<ServicioEditor[]>(SERVICIOS_INIT);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [precioTemp, setPrecioTemp] = useState<number>(0);
  const [tiempoTemp, setTiempoTemp] = useState<number>(0);
  const [notificacion, setNotificacion] = useState<string>('');

  const handleStartEdit = (servicio: ServicioEditor) => {
    setEditandoId(servicio.id);
    setPrecioTemp(servicio.precioReferencial);
    setTiempoTemp(servicio.tiempoEstimadoMinutos);
  };

  const handleSaveEdit = (id: number) => {
    setServicios(servicios.map(s => s.id === id ? { ...s, precioReferencial: precioTemp, tiempoEstimadoMinutos: tiempoTemp } : s));
    setEditandoId(null);
    setNotificacion('¡Precios y duraciones actualizados para el portal público y de reservas!');
    setTimeout(() => setNotificacion(''), 4000);
  };

  const handleToggleDestacado = (id: number) => {
    setServicios(servicios.map(s => s.id === id ? { ...s, destacadoEnWeb: !s.destacadoEnWeb } : s));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Catálogo de Procedimientos Quirúrgicos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Modifique honorarios referenciales y tiempos estimados que se publican en su página web</p>
        </div>
        <button
          onClick={() => alert('Para agregar nuevos procedimientos complejos, por favor regístrelos en el módulo completo de catálogos o base de datos.')}
          className="bg-gradient-to-r from-medical-500 to-blue-600 hover:from-medical-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Procedimiento</span>
        </button>
      </div>

      {notificacion && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-fade-in shadow-sm">
          <Check className="w-5 h-5 shrink-0" />
          <span>{notificacion}</span>
        </div>
      )}

      {/* Tarjetas editables de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servicios.map((s) => {
          const isEditing = editandoId === s.id;
          return (
            <div 
              key={s.id}
              className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none transition-colors relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                    {s.especialidadNombre}
                  </span>
                  <button
                    onClick={() => handleToggleDestacado(s.id)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                      s.destacadoEnWeb 
                        ? 'bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-500/30' 
                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {s.destacadoEnWeb ? '★ Destacado en Web' : 'Oculto en Inicio'}
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-medical-600 dark:text-medical-400 shrink-0" />
                  <span>{s.nombre}</span>
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {s.resumen}
                </p>
              </div>

              {/* Sección editable de honorarios y tiempos */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950/40 -mx-6 -mb-6 p-6 rounded-b-3xl transition-colors">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Honorario Ref. (S/)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-medical-600 dark:text-medical-400" />
                          <input
                            type="number"
                            value={precioTemp}
                            onChange={(e) => setPrecioTemp(Number(e.target.value))}
                            className="w-full bg-white dark:bg-navy-900 border border-medical-500 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-900 dark:text-white font-bold focus:outline-none shadow-inner"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Duración (Minutos)</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-2.5 w-4 h-4 text-medical-600 dark:text-medical-400" />
                          <input
                            type="number"
                            value={tiempoTemp}
                            onChange={(e) => setTiempoTemp(Number(e.target.value))}
                            className="w-full bg-white dark:bg-navy-900 border border-medical-500 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-900 dark:text-white font-bold focus:outline-none shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        onClick={() => setEditandoId(null)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(s.id)}
                        className="bg-medical-500 hover:bg-medical-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center space-x-1 shadow-sm transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar Cambios</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-bold">Honorario Referencial</span>
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white">S/ {s.precioReferencial.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-bold">Duración Est.</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.tiempoEstimadoMinutos} min</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartEdit(s)}
                      className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white p-2.5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-sm"
                    >
                      <Edit3 className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                      <span>Editar Precios</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-start space-x-4 transition-colors">
        <ShieldAlert className="w-6 h-6 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-slate-900 dark:text-white">Aviso Legal & Transparencia:</span> Los precios referenciales mostrados aquí se reflejan de inmediato en la calculadora del portal web para el paciente. Si una cirugía requiere instrumental especial (como bisturí armónico o estancia en UCI por complicaciones previas), el honorario final será determinado tras la consulta presencial del Dr. Juan Carlos Marcos Enriquez.
        </div>
      </div>

    </div>
  );
};
