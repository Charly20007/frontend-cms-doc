import React, { useState, useEffect, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import type { TabType } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { LoadingFallback } from './components/LoadingFallback';

// Carga diferida de los módulos de gestión para reducir el tamaño del bundle inicial del CMS
const CitasTable = React.lazy(() => import('./components/CitasTable').then(m => ({ default: m.CitasTable })));
const ServiciosManager = React.lazy(() => import('./components/ServiciosManager').then(m => ({ default: m.ServiciosManager })));
const TestimoniosAdmin = React.lazy(() => import('./components/TestimoniosAdmin').then(m => ({ default: m.TestimoniosAdmin })));

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-navy-950 text-slate-100' : 'bg-slate-50 text-slate-800'} flex selection:bg-medical-500 selection:text-white`}>
      {/* Menú lateral izquierdo */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={(tab) => setActiveTab(tab)}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
      />

      {/* Área principal del CMS con Suspense y Carga Diferida por Módulos */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <DashboardOverview onNavigate={(tab) => setActiveTab(tab)} />}
          
          {activeTab === 'citas' && (
            <Suspense fallback={<LoadingFallback texto="Cargando agenda quirúrgica y citas..." />}>
              <CitasTable />
            </Suspense>
          )}

          {activeTab === 'servicios' && (
            <Suspense fallback={<LoadingFallback texto="Cargando catálogo de procedimientos..." />}>
              <ServiciosManager />
            </Suspense>
          )}

          {activeTab === 'testimonios' && (
            <Suspense fallback={<LoadingFallback texto="Cargando panel de moderación de testimonios..." />}>
              <TestimoniosAdmin />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
