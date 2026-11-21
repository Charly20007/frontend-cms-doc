import React, { useEffect, useState } from 'react';
import { ExternalLink, Save, Trash2 } from 'lucide-react';
import { api, mensajeError } from '../../lib/api';
import { invalidarCaches, useCatalogos } from '../../lib/datos';
import { navegar, WEB_URL } from '../../lib/router';
import { vacioANull } from '../../lib/texto';
import type { ServicioDetalle, ServicioGuardar } from '../../lib/tipos';
import { AreaTexto, Boton, Campo, EncabezadoPagina, Interruptor, MensajeError, Panel, Selector } from '../../components/ui/Formulario';
import { ListaEditable } from '../../components/ui/ListaEditable';
import { SeoEditor } from '../../components/seo/SeoEditor';
import { SlugInput } from '../../components/seo/SlugInput';
import { useAvisos } from '../../components/ui/Avisos';
import { LoadingFallback } from '../../components/LoadingFallback';

const VACIO: ServicioGuardar = {
  nombre: '', nombreCorto: '', slug: '', resumen: '', descripcionDetallada: '',
  tiempoEstimadoMinutos: 45, precioReferencial: null, icono: 'Stethoscope', idEspecialidad: 0,
  destacadoEnWeb: true, orden: 99, condicionTratada: '', tituloIndicaciones: '',
  seo: { metaTitulo: '', metaDescripcion: '', imagenOgUrl: '', indexable: true },
  introduccion: [], indicaciones: [], pasos: [], recuperacion: [], preguntas: [],
};

const ICONOS = [
  { valor: 'Stethoscope', texto: 'Estetoscopio (consulta)' },
  { valor: 'Activity', texto: 'Actividad (laparoscopía)' },
  { valor: 'Shield', texto: 'Escudo (hernias)' },
  { valor: 'Scissors', texto: 'Tijeras (cirugía menor)' },
];

type Pestana = 'datos' | 'contenido' | 'seo';

const aFormulario = (s: ServicioDetalle): ServicioGuardar => ({
  nombre: s.nombre, nombreCorto: s.nombreCorto ?? '', slug: s.slug, resumen: s.resumen,
  descripcionDetallada: s.descripcionDetallada ?? '', tiempoEstimadoMinutos: s.tiempoEstimadoMinutos,
  precioReferencial: s.precioReferencial ?? null, icono: s.icono ?? 'Stethoscope', idEspecialidad: s.idEspecialidad,
  destacadoEnWeb: s.destacadoEnWeb, orden: s.orden, condicionTratada: s.condicionTratada ?? '',
  tituloIndicaciones: s.tituloIndicaciones ?? '',
  seo: { metaTitulo: s.seo.metaTitulo ?? '', metaDescripcion: s.seo.metaDescripcion ?? '', imagenOgUrl: s.seo.imagenOgUrl ?? '', indexable: s.seo.indexable },
  introduccion: s.introduccion, indicaciones: s.indicaciones, pasos: s.pasos, recuperacion: s.recuperacion, preguntas: s.preguntas,
});

export const ProcedimientoEditor: React.FC<{ id: number | null }> = ({ id }) => {
  const avisos = useAvisos();
  const catalogos = useCatalogos();
  const [form, setForm] = useState<ServicioGuardar | null>(id ? null : VACIO);
  const [original, setOriginal] = useState<ServicioDetalle | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [pestana, setPestana] = useState<Pestana>('datos');
  const [sucio, setSucio] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<ServicioDetalle>(`/api/admin/servicios/${id}`)
      .then(({ data }) => { setOriginal(data); setForm(aFormulario(data)); })
      .catch((e) => setErrorCarga(mensajeError(e, 'No se pudo cargar el procedimiento.')));
  }, [id]);

  // Avisa antes de salir con cambios sin guardar
  useEffect(() => {
    if (!sucio) return;
    const alSalir = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', alSalir);
    return () => window.removeEventListener('beforeunload', alSalir);
  }, [sucio]);

  if (errorCarga) return <MensajeError mensaje={errorCarga} />;
  if (!form) return <LoadingFallback texto="Cargando procedimiento..." />;

  const cambiar = (c: Partial<ServicioGuardar>) => { setForm({ ...form, ...c }); setSucio(true); };
  const volver = () => {
    if (sucio && !window.confirm('Hay cambios sin guardar. ¿Salir de todos modos?')) return;
    navegar('procedimientos');
  };

  const guardar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.nombre.trim() || !form.resumen.trim() || !form.idEspecialidad) {
      setPestana('datos');
      avisos.error('Complete nombre, resumen y especialidad.');
      return;
    }
    setGuardando(true);
    const cuerpo: ServicioGuardar = {
      ...form,
      nombreCorto: vacioANull(form.nombreCorto),
      slug: vacioANull(form.slug),
      descripcionDetallada: vacioANull(form.descripcionDetallada),
      condicionTratada: vacioANull(form.condicionTratada),
      tituloIndicaciones: vacioANull(form.tituloIndicaciones),
      precioReferencial: form.precioReferencial === null || Number.isNaN(form.precioReferencial) ? null : form.precioReferencial,
      seo: { ...form.seo, metaTitulo: vacioANull(form.seo.metaTitulo), metaDescripcion: vacioANull(form.seo.metaDescripcion), imagenOgUrl: vacioANull(form.seo.imagenOgUrl) },
    };
    try {
      const { data } = id
        ? await api.put<ServicioDetalle>(`/api/admin/servicios/${id}`, cuerpo)
        : await api.post<ServicioDetalle>('/api/admin/servicios', cuerpo);
      invalidarCaches();
      setSucio(false);
      if (original && original.slug !== data.slug) avisos.exito(`Guardado. Se creó una redirección desde /procedimientos/${original.slug}.`);
      else avisos.exito('Procedimiento guardado.');
      setOriginal(data);
      setForm(aFormulario(data));
      if (!id) navegar(`procedimientos/${data.id}`);
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudo guardar.'));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!id || !original) return;
    if (!window.confirm(`¿Eliminar «${original.nombre}»? Su página dejará de existir en la web.`)) return;
    try {
      await api.delete(`/api/admin/servicios/${id}`);
      invalidarCaches();
      setSucio(false);
      avisos.exito('Procedimiento eliminado.');
      navegar('procedimientos');
    } catch (err) {
      avisos.error(mensajeError(err, 'No se pudo eliminar.'));
    }
  };

  const pestanas: { id: Pestana; texto: string }[] = [
    { id: 'datos', texto: 'Datos generales' },
    { id: 'contenido', texto: 'Contenido de la página' },
    { id: 'seo', texto: 'SEO' },
  ];

  return (
    <form onSubmit={guardar}>
      <EncabezadoPagina
        volver={volver}
        titulo={id ? form.nombre || 'Procedimiento' : 'Nuevo procedimiento'}
        descripcion={id && original ? `Última modificación: ${new Date(original.fechaModificacion).toLocaleString('es-PE')}` : 'Complete los datos y guarde para crear su página.'}
        acciones={
          <>
            {original && (
              <a href={`${WEB_URL}/procedimientos/${original.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">
                <ExternalLink className="w-4 h-4" /> Ver página
              </a>
            )}
            {id && <Boton variante="peligro" icono={<Trash2 className="w-4 h-4" />} onClick={eliminar}>Eliminar</Boton>}
            <Boton type="submit" cargando={guardando} icono={<Save className="w-4 h-4" />}>Guardar</Boton>
          </>
        }
      />

      <div role="tablist" className="flex gap-1 p-1 mb-6 rounded-2xl bg-slate-100 dark:bg-navy-900/60 w-fit">
        {pestanas.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            onClick={() => setPestana(p.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${pestana === p.id ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
          >
            {p.texto}
          </button>
        ))}
      </div>

      {pestana === 'datos' && (
        <div className="space-y-6">
          <Panel titulo="Identificación">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo etiqueta="Nombre completo" obligatorio maxLength={150} value={form.nombre} onChange={(e) => cambiar({ nombre: e.target.value })} ayuda="Es el título principal (H1) de la página." className="md:col-span-2" />
              <Campo etiqueta="Nombre corto" maxLength={80} value={form.nombreCorto ?? ''} onChange={(e) => cambiar({ nombreCorto: e.target.value })} ayuda="Para menús y migas de pan. Ej.: «Cirugía de Vesícula»." />
              <Selector
                etiqueta="Especialidad" obligatorio vacio="Seleccione..."
                value={form.idEspecialidad || ''}
                onChange={(e) => cambiar({ idEspecialidad: Number(e.target.value) })}
                opciones={(catalogos?.especialidades ?? []).map((e) => ({ valor: e.id, texto: e.nombre }))}
              />
              <div className="md:col-span-2">
                <SlugInput valor={form.slug ?? ''} onCambio={(v) => cambiar({ slug: v })} prefijo="/procedimientos/" origen={form.nombre} slugOriginal={original?.slug} />
              </div>
              <AreaTexto etiqueta="Resumen" obligatorio maxLength={300} value={form.resumen} onChange={(e) => cambiar({ resumen: e.target.value })} ayuda="Se muestra en las tarjetas y bajo el título." contador={{ actual: form.resumen.length, recomendado: 200, maximo: 300 }} className="md:col-span-2" />
            </div>
          </Panel>

          <Panel titulo="Datos prácticos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Campo etiqueta="Duración aproximada (min)" type="number" min={5} max={1440} value={form.tiempoEstimadoMinutos} onChange={(e) => cambiar({ tiempoEstimadoMinutos: Number(e.target.value) })} />
              <Campo etiqueta="Precio referencial (S/)" type="number" min={0} step="0.01" value={form.precioReferencial ?? ''} onChange={(e) => cambiar({ precioReferencial: e.target.value === '' ? null : Number(e.target.value) })} ayuda="Vacío = «A consultar»." />
              <Selector etiqueta="Ícono" value={form.icono ?? ''} onChange={(e) => cambiar({ icono: e.target.value })} opciones={ICONOS} />
              <Campo etiqueta="Orden en la web" type="number" value={form.orden} onChange={(e) => cambiar({ orden: Number(e.target.value) })} ayuda="Menor número = aparece primero." />
              <div className="md:col-span-2 flex items-end pb-2">
                <Interruptor etiqueta="Destacado en la portada" descripcion="Se muestra en la sección de procedimientos de la página de inicio." activo={form.destacadoEnWeb} onCambio={(v) => cambiar({ destacadoEnWeb: v })} />
              </div>
            </div>
          </Panel>
        </div>
      )}

      {pestana === 'contenido' && (
        <div className="space-y-6">
          <Panel titulo="Introducción" descripcion="Párrafos que explican qué es el procedimiento. Lo primero que lee el paciente (y Google).">
            <ListaEditable titulo="Párrafos" items={form.introduccion} onCambio={(v) => cambiar({ introduccion: v })} etiquetaTexto="Párrafo" textoBoton="Agregar párrafo" filasTexto={4} />
          </Panel>
          <Panel titulo="Síntomas o indicaciones">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <Campo etiqueta="Título de la sección" maxLength={150} value={form.tituloIndicaciones ?? ''} onChange={(e) => cambiar({ tituloIndicaciones: e.target.value })} placeholder="¿Cuándo se recomienda?" ayuda="Use la pregunta que busca la gente. Ej.: «Síntomas de apendicitis»." />
              <Campo etiqueta="Condición tratada" maxLength={150} value={form.condicionTratada ?? ''} onChange={(e) => cambiar({ condicionTratada: e.target.value })} placeholder="Ej.: Apendicitis aguda" ayuda="Para los datos estructurados de Google (Schema.org)." />
            </div>
            <ListaEditable titulo="Lista" descripcion="Si un punto contiene la palabra «urgencia», la web lo resalta en rojo." items={form.indicaciones} onCambio={(v) => cambiar({ indicaciones: v })} etiquetaTexto="Síntoma o indicación" textoBoton="Agregar punto" />
          </Panel>
          <Panel titulo="¿Cómo es el procedimiento?">
            <ListaEditable titulo="Pasos" items={form.pasos} onCambio={(v) => cambiar({ pasos: v })} etiquetaTitulo="Título del paso" etiquetaTexto="Detalle" textoBoton="Agregar paso" />
          </Panel>
          <Panel titulo="Recuperación o preparación">
            <ListaEditable titulo="Puntos" items={form.recuperacion} onCambio={(v) => cambiar({ recuperacion: v })} etiquetaTexto="Indicación" textoBoton="Agregar punto" />
          </Panel>
          <Panel titulo="Preguntas frecuentes" descripcion="Google puede mostrarlas directamente en los resultados. Escriba preguntas tal como las haría un paciente.">
            <ListaEditable titulo="Preguntas" items={form.preguntas} onCambio={(v) => cambiar({ preguntas: v })} etiquetaTitulo="Pregunta" etiquetaTexto="Respuesta" textoBoton="Agregar pregunta" filasTexto={3} />
          </Panel>
        </div>
      )}

      {pestana === 'seo' && (
        <SeoEditor
          seo={form.seo}
          onCambio={(seo) => cambiar({ seo })}
          ruta={`/procedimientos/${form.slug || 'nuevo'}`}
          tituloRespaldo={form.nombre || 'Nombre del procedimiento'}
          descripcionRespaldo={form.resumen || 'Resumen del procedimiento'}
        />
      )}
    </form>
  );
};
