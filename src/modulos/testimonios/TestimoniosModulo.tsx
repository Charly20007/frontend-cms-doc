import React, { useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { api, mensajeError } from '../../lib/api';
import { useCatalogos, useDatos } from '../../lib/datos';
import { formatearFecha } from '../../lib/texto';
import type { Testimonio, TestimonioGuardar } from '../../lib/tipos';
import { AreaTexto, Boton, Campo, EncabezadoPagina, Etiqueta, Interruptor, MensajeError, Panel, Selector } from '../../components/ui/Formulario';
import { useAvisos } from '../../components/ui/Avisos';
import { LoadingFallback } from '../../components/LoadingFallback';

const VACIO: TestimonioGuardar = { nombrePaciente: '', procedimiento: '', idServicioMedico: null, calificacionEstrellas: 5, comentario: '', aprobadoParaWeb: false, fechaTestimonio: null };

export const TestimoniosModulo: React.FC = () => {
  const avisos = useAvisos();
  const catalogos = useCatalogos();
  const { datos, cargando, error, recargar } = useDatos<Testimonio[]>('/api/admin/testimonios');
  const [form, setForm] = useState<TestimonioGuardar | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  const accion = async (fn: () => Promise<unknown>, exito: string) => {
    try {
      await fn();
      avisos.exito(exito);
      await recargar();
    } catch (e) {
      avisos.error(mensajeError(e));
    }
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setGuardando(true);
    try {
      if (editandoId) await api.put(`/api/admin/testimonios/${editandoId}`, form);
      else await api.post('/api/admin/testimonios', form);
      avisos.exito('Testimonio guardado.');
      setForm(null);
      setEditandoId(null);
      await recargar();
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudo guardar.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <EncabezadoPagina
        titulo="Testimonios"
        descripcion="Publique solo testimonios reales y con autorización del paciente."
        acciones={!form && <Boton icono={<Plus className="w-4 h-4" />} onClick={() => { setForm(VACIO); setEditandoId(null); }}>Nuevo testimonio</Boton>}
      />

      {form && (
        <Panel titulo={editandoId ? 'Editar testimonio' : 'Nuevo testimonio'} className="mb-6">
          <form onSubmit={guardar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Campo etiqueta="Nombre del paciente" obligatorio maxLength={100} value={form.nombrePaciente} onChange={(e) => setForm({ ...form, nombrePaciente: e.target.value })} ayuda="Puede usar solo nombre e inicial del apellido." />
            <Selector
              etiqueta="Procedimiento relacionado" vacio="Ninguno"
              value={form.idServicioMedico ?? ''}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                const nombre = catalogos?.servicios.find((s) => s.id === id)?.nombre;
                setForm({ ...form, idServicioMedico: id, procedimiento: form.procedimiento || nombre || '' });
              }}
              opciones={(catalogos?.servicios ?? []).map((s) => ({ valor: s.id, texto: s.nombre }))}
              ayuda="Se mostrará también en la página de ese procedimiento."
            />
            <Campo etiqueta="Texto del procedimiento" obligatorio maxLength={150} value={form.procedimiento} onChange={(e) => setForm({ ...form, procedimiento: e.target.value })} />
            <Selector etiqueta="Calificación" value={form.calificacionEstrellas} onChange={(e) => setForm({ ...form, calificacionEstrellas: Number(e.target.value) })} opciones={[5, 4, 3, 2, 1].map((n) => ({ valor: n, texto: '★'.repeat(n) }))} />
            <AreaTexto etiqueta="Comentario" obligatorio maxLength={1000} rows={4} value={form.comentario} onChange={(e) => setForm({ ...form, comentario: e.target.value })} className="md:col-span-2" />
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4">
              <Interruptor etiqueta="Publicado en la web" activo={form.aprobadoParaWeb} onCambio={(v) => setForm({ ...form, aprobadoParaWeb: v })} />
              <div className="flex gap-2">
                <Boton variante="secundario" onClick={() => { setForm(null); setEditandoId(null); }}>Cancelar</Boton>
                <Boton type="submit" cargando={guardando}>Guardar</Boton>
              </div>
            </div>
          </form>
        </Panel>
      )}

      {error && <MensajeError mensaje={error} reintentar={recargar} />}
      {cargando && !datos && <LoadingFallback texto="Cargando testimonios..." />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(datos ?? []).map((t) => (
          <div key={t.id} className={`bg-white dark:bg-navy-900/60 border rounded-2xl p-5 ${t.aprobadoParaWeb ? 'border-slate-200 dark:border-white/10' : 'border-dashed border-slate-300 dark:border-white/20 opacity-80'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{t.nombrePaciente}</span>
                  {t.aprobadoParaWeb ? <Etiqueta color="verde">Publicado</Etiqueta> : <Etiqueta>Oculto</Etiqueta>}
                </div>
                <div className="text-xs text-medical-600 dark:text-medical-400 mt-0.5">{t.procedimiento} · {formatearFecha(t.fechaTestimonio)}</div>
              </div>
              <div className="flex">
                {Array.from({ length: t.calificacionEstrellas }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              </div>
            </div>
            <p className="mt-3 text-sm italic text-slate-600 dark:text-slate-300">“{t.comentario}”</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Boton variante="secundario" icono={t.aprobadoParaWeb ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} onClick={() => accion(() => api.put(`/api/admin/testimonios/${t.id}/aprobacion?aprobado=${!t.aprobadoParaWeb}`), t.aprobadoParaWeb ? 'Testimonio ocultado.' : 'Testimonio publicado.')}>
                {t.aprobadoParaWeb ? 'Ocultar' : 'Publicar'}
              </Boton>
              <Boton variante="fantasma" icono={<Pencil className="w-4 h-4" />} onClick={() => {
                setEditandoId(t.id);
                setForm({ nombrePaciente: t.nombrePaciente, procedimiento: t.procedimiento, idServicioMedico: t.idServicioMedico ?? null, calificacionEstrellas: t.calificacionEstrellas, comentario: t.comentario, aprobadoParaWeb: t.aprobadoParaWeb, fechaTestimonio: t.fechaTestimonio });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}>Editar</Boton>
              <Boton variante="fantasma" icono={<Trash2 className="w-4 h-4" />} onClick={() => {
                if (window.confirm(`¿Eliminar el testimonio de ${t.nombrePaciente}?`)) void accion(() => api.delete(`/api/admin/testimonios/${t.id}`), 'Testimonio eliminado.');
              }}>Eliminar</Boton>
            </div>
          </div>
        ))}
      </div>
      {datos && datos.length === 0 && <p className="py-12 text-center text-sm text-slate-500">Aún no hay testimonios.</p>}
    </div>
  );
};
