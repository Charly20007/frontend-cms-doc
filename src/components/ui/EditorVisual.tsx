import React, { useEffect, useRef } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Blockquote from '@tiptap/extension-blockquote';
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Undo2, Unlink } from 'lucide-react';
import { useDialogos } from './Dialogos';

/**
 * Los recuadros antiguos (<div> con estilos) se cargan como «Recuadro destacado»
 * (<blockquote>) para que no se pierdan al editar.
 */
const Recuadro = Blockquote.extend({
  parseHTML() {
    return [{ tag: 'blockquote' }, { tag: 'div' }];
  },
});

interface EditorVisualProps {
  valor: string;
  onCambio: (html: string) => void;
  /** Altura mínima del área de escritura. */
  alturaMinima?: string;
}

/** Quita el HTML de un editor vacío («<p></p>») para que el campo cuente como vacío. */
const limpiar = (html: string) => (html.replace(/<p><\/p>/g, '').trim() ? html : '');

/** Editor tipo Word: el administrador escribe con formato y se guarda como HTML limpio. */
export const EditorVisual: React.FC<EditorVisualProps> = ({ valor, onCambio, alturaMinima = '22rem' }) => {
  // Último HTML recibido o escrito (para no reiniciar el editor sin necesidad)
  const ultimoRef = useRef(valor);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        blockquote: false,
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https', HTMLAttributes: { rel: null, target: null } },
      }),
      Recuadro,
    ],
    content: valor,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: 'prose-cms max-w-none text-slate-700 dark:text-slate-200 px-5 py-4 focus:outline-none',
        style: `min-height: ${alturaMinima}`,
        'aria-label': 'Contenido',
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = limpiar(e.getHTML());
      ultimoRef.current = html;
      onCambio(html);
    },
  });

  // Si el contenido cambia desde fuera (al cargar o tras guardar), se refleja en el editor.
  // Solo cuando el valor es distinto del último que se recibió o escribió: así no se reinicia el cursor.
  useEffect(() => {
    if (!editor || valor === ultimoRef.current) return;
    ultimoRef.current = valor;
    if (valor !== limpiar(editor.getHTML())) editor.commands.setContent(valor, { emitUpdate: false });
  }, [editor, valor]);

  return (
    <div className="rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-navy-950 focus-within:border-medical-500 overflow-clip">
      {editor && <BarraHerramientas editor={editor} />}
      <EditorContent editor={editor} className={editor?.isEmpty ? 'editor-vacio' : undefined} />
    </div>
  );
};

const BarraHerramientas: React.FC<{ editor: Editor }> = ({ editor }) => {
  const { pedirTexto } = useDialogos();
  const enCadena = () => editor.chain().focus();

  const ponerEnlace = async () => {
    const actual = editor.getAttributes('link').href as string | undefined;
    const url = await pedirTexto({
      titulo: actual ? 'Cambiar enlace' : 'Agregar enlace',
      etiqueta: 'Dirección. Ej.: /procedimientos/colecistectomia-laparoscopica o https://…',
      valorInicial: actual ?? '',
      textoAceptar: 'Guardar enlace',
    });
    if (!url) return;
    if (editor.state.selection.empty && !actual) {
      enCadena().insertContent({ type: 'text', text: url, marks: [{ type: 'link', attrs: { href: url } }] }).run();
    } else {
      enCadena().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const botones: { titulo: string; icono: React.ReactNode; activo?: boolean; accion: () => void; separar?: boolean; deshabilitado?: boolean }[] = [
    { titulo: 'Subtítulo', icono: <Heading2 className="w-4 h-4" />, activo: editor.isActive('heading', { level: 2 }), accion: () => enCadena().toggleHeading({ level: 2 }).run() },
    { titulo: 'Subtítulo pequeño', icono: <Heading3 className="w-4 h-4" />, activo: editor.isActive('heading', { level: 3 }), accion: () => enCadena().toggleHeading({ level: 3 }).run() },
    { titulo: 'Negrita', icono: <Bold className="w-4 h-4" />, activo: editor.isActive('bold'), accion: () => enCadena().toggleBold().run(), separar: true },
    { titulo: 'Cursiva', icono: <Italic className="w-4 h-4" />, activo: editor.isActive('italic'), accion: () => enCadena().toggleItalic().run() },
    { titulo: 'Lista con viñetas', icono: <List className="w-4 h-4" />, activo: editor.isActive('bulletList'), accion: () => enCadena().toggleBulletList().run(), separar: true },
    { titulo: 'Lista numerada', icono: <ListOrdered className="w-4 h-4" />, activo: editor.isActive('orderedList'), accion: () => enCadena().toggleOrderedList().run() },
    { titulo: 'Recuadro destacado', icono: <Quote className="w-4 h-4" />, activo: editor.isActive('blockquote'), accion: () => enCadena().toggleBlockquote().run() },
    { titulo: editor.isActive('link') ? 'Cambiar enlace' : 'Enlace', icono: <Link2 className="w-4 h-4" />, activo: editor.isActive('link'), accion: () => void ponerEnlace(), separar: true },
    ...(editor.isActive('link') ? [{ titulo: 'Quitar enlace', icono: <Unlink className="w-4 h-4" />, accion: () => enCadena().extendMarkRange('link').unsetLink().run() }] : []),
    { titulo: 'Deshacer', icono: <Undo2 className="w-4 h-4" />, accion: () => enCadena().undo().run(), separar: true, deshabilitado: !editor.can().undo() },
    { titulo: 'Rehacer', icono: <Redo2 className="w-4 h-4" />, accion: () => enCadena().redo().run(), deshabilitado: !editor.can().redo() },
  ];

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-900">
      {botones.map((b) => (
        <React.Fragment key={b.titulo}>
          {b.separar && <span className="w-px h-5 mx-1 bg-slate-300 dark:bg-white/10" />}
          <button
            type="button"
            title={b.titulo}
            aria-label={b.titulo}
            aria-pressed={b.activo}
            disabled={b.deshabilitado}
            onMouseDown={(e) => e.preventDefault()}
            onClick={b.accion}
            className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              b.activo ? 'bg-medical-500/15 text-medical-700 dark:text-medical-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10'
            }`}
          >
            {b.icono}
            {(b.titulo === 'Subtítulo' || b.titulo === 'Recuadro destacado' || b.titulo === 'Enlace') && <span className="hidden sm:inline">{b.titulo}</span>}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};
