/** "Cirugía de Vesícula (Láser)" → "cirugia-de-vesicula-laser" (igual que SlugHelper en la API). */
export function generarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150)
    .replace(/-+$/, '');
}

export const vacioANull = (v?: string | null) => (v && v.trim() ? v.trim() : null);

export const formatearFecha = (iso: string, opciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) =>
  new Date(iso).toLocaleDateString('es-PE', opciones);

/**
 * Igual que en la web: "+5119998887" → "(01) 999-8887" · "+51987654321" → "987 654 321".
 */
export function formatearTelefono(telefono?: string | null): string {
  if (!telefono) return '';
  let d = telefono.replace(/\D/g, '');
  if (d.startsWith('51') && (d.length === 11 || d.length === 10)) d = d.slice(2);
  if (d.length === 9 && d.startsWith('9')) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  if (d.length === 8 && d.startsWith('1')) return `(01) ${d.slice(1, 4)}-${d.slice(4)}`;
  return telefono;
}

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** Igual que en la web: une los días consecutivos con el mismo horario. */
export function agruparHorarios(horarios: { diaSemana: number; horaInicio: string; horaFin: string }[]): { dias: string; horas: string }[] {
  const porDia = new Map<number, string>();
  for (const h of [...horarios].sort((a, b) => a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio))) {
    const tramo = `${h.horaInicio} - ${h.horaFin}`;
    porDia.set(h.diaSemana, porDia.has(h.diaSemana) ? `${porDia.get(h.diaSemana)} / ${tramo}` : tramo);
  }
  const grupos: { desde: number; hasta: number; horas: string }[] = [];
  for (const [dia, horas] of porDia) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.horas === horas && ultimo.hasta === dia - 1) ultimo.hasta = dia;
    else grupos.push({ desde: dia, hasta: dia, horas });
  }
  return grupos.map((g) => ({ dias: g.desde === g.hasta ? DIAS_SEMANA[g.desde] : `${DIAS_SEMANA[g.desde]} - ${DIAS_SEMANA[g.hasta]}`, horas: g.horas }));
}
