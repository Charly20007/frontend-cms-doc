import React from 'react';
import { LayoutDashboard, CalendarCheck, Scissors, MessageSquareQuote, ShieldCheck, LogOut, Sun, Moon } from 'lucide-react';

export type TabType = 'dashboard' | 'citas' | 'servicios' | 'testimonios';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, darkMode, onToggleTheme }) => {
  const menuItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Resumen General', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'citas', label: 'Agenda & Citas', icon: <CalendarCheck className="w-5 h-5" />, badge: '3' },
    { id: 'servicios', label: 'Procedimientos', icon: <Scissors className="w-5 h-5" /> },
    { id: 'testimonios', label: 'Testimonios web', icon: <MessageSquareQuote className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-navy-900/90 border-r border-slate-200 dark:border-white/10 flex flex-col justify-between h-screen sticky top-0 shrink-0 transition-colors shadow-sm z-20">
      <div>
        {/* Cabecera de marca */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center space-x-3 bg-slate-50/50 dark:bg-transparent">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-500 to-blue-700 flex items-center justify-center font-bold text-white shadow-lg shadow-medical-500/20 shrink-0">
            CMS
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-tight truncate">Surgeon Admin</h1>
            <span className="text-[10px] text-medical-600 dark:text-medical-400 font-semibold uppercase tracking-wider flex items-center gap-1 truncate" title="Dr. Juan Carlos Marcos Enriquez">
              <ShieldCheck className="w-3 h-3 shrink-0 text-medical-500" /> Dr. Marcos E.
            </span>
          </div>
        </div>

        {/* Menú de navegación */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
            Gestión Médica
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-medical-500 to-blue-600 text-white font-bold shadow-md shadow-medical-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-medical-500 dark:group-hover:text-medical-400 transition-colors'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Perfil inferior / Salir / Switch de Tema */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-950/40 space-y-3 transition-colors">
        {/* Switch de Tema */}
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <span className="flex items-center gap-2">
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-medical-600" />}
            <span>{darkMode ? "Modo Claro" : "Modo Oscuro"}</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
            Toggle
          </span>
        </button>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-medical-500/10 dark:bg-medical-500/20 text-medical-600 dark:text-medical-400 flex items-center justify-center font-bold text-xs shrink-0">
              DR
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Juan Carlos Marcos</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Cirugía Digestiva</div>
            </div>
          </div>
          <button 
            title="Cerrar sesión administrativa"
            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
