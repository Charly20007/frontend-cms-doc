import React, { useState } from 'react';
import { Star, CheckCircle, XCircle, MessageSquareQuote } from 'lucide-react';

interface TestimonioModeracion {
  id: number;
  nombrePaciente: string;
  procedimiento: string;
  calificacionEstrellas: number;
  comentario: string;
  aprobadoParaWeb: boolean;
  fecha: string;
}

const TESTIMONIOS_INIT: TestimonioModeracion[] = [
  {
    id: 1,
    nombrePaciente: 'Carlos Alberto Ramos',
    procedimiento: 'Cirugía de Vesícula Laparoscópica',
    calificacionEstrellas: 5,
    comentario: 'Excelente atención del doctor. Me operé el martes y para el jueves ya estaba caminando sin dolor en casa.',
    aprobadoParaWeb: true,
    fecha: '28 Jun 2026'
  },
  {
    id: 2,
    nombrePaciente: 'María Fernanda López',
    procedimiento: 'Reparación de Hernia Umbilical',
    calificacionEstrellas: 5,
    comentario: 'Me explicó todo el procedimiento con mucha claridad. La cicatriz apenas se nota. 100% recomendado.',
    aprobadoParaWeb: true,
    fecha: '25 Jun 2026'
  },
  {
    id: 3,
    nombrePaciente: 'Roberto Gómez Silva',
    procedimiento: 'Consulta de Valoración Quirúrgica',
    calificacionEstrellas: 5,
    comentario: 'Puntual, empático y certero en su diagnóstico. Revisó mis tomografías detenidamente y me dio la tranquilidad que necesitaba.',
    aprobadoParaWeb: true,
    fecha: '20 Jun 2026'
  },
  {
    id: 4,
    nombrePaciente: 'Ana Patricia Solís',
    procedimiento: 'Apendicectomía Laparoscópica',
    calificacionEstrellas: 4,
    comentario: 'La atención en emergencia fue excelente, el doctor llegó súper rápido y me operó esa misma madrugada.',
    aprobadoParaWeb: false,
    fecha: '01 Jul 2026'
  }
];

export const TestimoniosAdmin: React.FC = () => {
  const [testimonios, setTestimonios] = useState<TestimonioModeracion[]>(TESTIMONIOS_INIT);

  const handleToggleAprobacion = (id: number) => {
    setTestimonios(testimonios.map(t => t.id === id ? { ...t, aprobadoParaWeb: !t.aprobadoParaWeb } : t));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Moderación de Testimonios Web</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Apruebe qué reseñas de pacientes son visibles públicamente en la sección de casos de éxito de su página</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonios.map((t) => (
          <div 
            key={t.id}
            className={`bg-white dark:bg-navy-900/60 border rounded-3xl p-6 flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none transition-all ${
              t.aprobadoParaWeb ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/10' : 'border-slate-200 dark:border-white/10 opacity-80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                  {t.procedimiento}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.fecha}</span>
              </div>

              <div className="flex items-center space-x-1 mb-3">
                {[...Array(t.calificacionEstrellas)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{t.comentario}"
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between transition-colors">
              <div className="flex items-center space-x-2">
                <MessageSquareQuote className="w-5 h-5 text-medical-600 dark:text-medical-400 shrink-0" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">{t.nombrePaciente}</span>
              </div>

              <button
                onClick={() => handleToggleAprobacion(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
                  t.aprobadoParaWeb
                    ? 'bg-red-50 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                    : 'bg-medical-500 hover:bg-medical-600 text-white shadow-md shadow-medical-500/20'
                }`}
              >
                {t.aprobadoParaWeb ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Ocultar de la Web</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Publicar en Web</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
