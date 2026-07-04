import React from 'react';
import { Calendar, Clock, Activity, CheckCircle2, ArrowUpRight, TrendingUp } from 'lucide-react';
import type { TabType } from './Sidebar';

interface DashboardOverviewProps {
  onNavigate: (tab: TabType) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Saludo inicial (Banner siempre con alto contraste y toque premium) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 p-8 rounded-3xl border border-slate-800 dark:border-white/10 shadow-xl text-white">
        <div>
          <span className="text-xs font-bold text-medical-400 uppercase tracking-widest block mb-1">Panel de Control</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">¡Bienvenido doctor Marcos Enriquez!</h2>
          <p className="text-sm text-slate-300 mt-1">Tiene 3 citas pendientes por confirmar en su agenda quirúrgica para esta semana.</p>
        </div>
        <button
          onClick={() => onNavigate('citas')}
          className="bg-gradient-to-r from-medical-500 to-blue-600 hover:from-medical-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-medical-500/25 flex items-center space-x-2 text-sm shrink-0 transition-all"
        >
          <span>Revisar Agenda</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tarjetas de estadísticas métricas con adaptación perfecta a Modo Claro / Oscuro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Citas Hoy</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">8</div>
            <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>+25% respecto a ayer</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Por Confirmar</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">3</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
              <span>Requieren llamada telefónica</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Cirugías Mes</span>
            <div className="w-10 h-10 rounded-xl bg-medical-500/10 text-medical-600 dark:text-medical-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">24</div>
            <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>100% éxito sin morbilidad</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Satisfacción Web</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">99.8%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
              <span>Basado en 140 valoraciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas cirugías programadas */}
      <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Próximas Cirugías Programadas (Quirófano)</h3>
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-navy-950 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-medical-500/10 dark:bg-medical-500/20 text-medical-600 dark:text-medical-400 font-bold flex items-center justify-center shrink-0">
                08:00
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Carlos Alberto Ramos - Colecistectomía Laparoscópica</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Clínica San Felipe - Sala de Quirófano 3 (Anestesia General)</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shrink-0">
              Confirmada & Pre-quirúrgico Listo
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-navy-950 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">
                11:30
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">María Fernanda López - Hernioplastia Inguinal con Malla</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Clínica Anglo Americana - Sala de Quirófano 1</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold shrink-0">
              En Preparación
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
