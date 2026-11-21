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
