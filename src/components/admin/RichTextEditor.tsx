"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Node, mergeAttributes } from "@tiptap/core";

// ---------------------------------------------------------------------------
// Custom Twitter/X embed node (simple iframe wrapper)
// ---------------------------------------------------------------------------
const TwitterEmbed = Node.create({
  name: "twitterEmbed",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      tweetUrl: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-twitter-embed]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const url = HTMLAttributes.tweetUrl as string | null;
    // Normalize tweet URL to embed format:
    // https://twitter.com/user/status/123 → https://platform.twitter.com/embed/Tweet.html?id=123
    let tweetId = "";
    try {
      const match = String(url ?? "").match(/status\/(\d+)/);
      if (match) tweetId = match[1];
    } catch {}

    if (!tweetId) {
      return ["div", { "data-twitter-embed": "", style: "padding:1rem;background:#f9f9f9;border:1px solid #e2e2e2;border-radius:8px;" }, "Tweet no válido"];
    }

    return [
      "div",
      mergeAttributes({ "data-twitter-embed": "", class: "twitter-embed-wrapper" }),
      [
        "iframe",
        {
          src: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`,
          width: "100%",
          height: "420",
          frameborder: "0",
          scrolling: "no",
          allowtransparency: "true",
          style: "border:none;max-width:550px;display:block;margin:0 auto;border-radius:12px;",
        },
      ],
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const url = node.attrs.tweetUrl as string | null;
      let tweetId = "";
      try {
        const match = String(url ?? "").match(/status\/(\d+)/);
        if (match) tweetId = match[1];
      } catch {}

      const wrapper = document.createElement("div");
      wrapper.contentEditable = "false";
      wrapper.setAttribute("data-twitter-embed", "");
      wrapper.style.cssText =
        "margin:1rem 0;padding:1rem;background:#f8fafc;border:1px solid #e2e2e2;border-radius:8px;text-align:center;";

      if (tweetId) {
        const label = document.createElement("p");
        label.style.cssText = "font-size:12px;color:#888;margin:0 0 8px;";
        label.textContent = "Tweet incrustado — se verá correctamente en el sitio";

        const link = document.createElement("a");
        link.href = url ?? "";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.cssText = "font-size:13px;color:#1d9bf0;word-break:break-all;";
        link.textContent = url ?? "";

        wrapper.appendChild(label);
        wrapper.appendChild(link);
      } else {
        wrapper.textContent = "URL de tweet inválida";
      }

      return { dom: wrapper };
    };
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function Divider() {
  return <div className="w-px h-6 bg-gray-300 mx-1 self-center" />;
}

interface BtnProps {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}

function Btn({ active, onClick, title, children, danger }: BtnProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2.5 py-1.5 text-xs font-semibold rounded transition whitespace-nowrap ${
        active
          ? "bg-primary text-white"
          : danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------
function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const inTable = editor.isActive("table");

  function setLink() {
    const url = window.prompt("URL del enlace (ej: https://tuperfil.net):");
    if (!url) {
      editor?.chain().focus().unsetLink().run();
      return;
    }
    const finalUrl = url.startsWith("http") ? url : `https://${url}`;
    editor?.chain().focus().setLink({ href: finalUrl, target: "_blank" }).run();
  }

  function insertYoutube() {
    const url = window.prompt(
      "Pegá la URL del video de YouTube:\n(ej: https://www.youtube.com/watch?v=XXXXX)"
    );
    if (!url) return;
    editor?.chain().focus().setYoutubeVideo({ src: url }).run();
  }

  function insertTweet() {
    const url = window.prompt(
      "Pegá la URL del tweet:\n(ej: https://twitter.com/usuario/status/123456789)"
    );
    if (!url) return;
    editor
      ?.chain()
      .focus()
      .insertContent({ type: "twitterEmbed", attrs: { tweetUrl: url } })
      .run();
  }

  function insertTable() {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
      {/* Grupo: Texto */}
      <Btn
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Negrita"
      >
        <strong>N</strong>
      </Btn>
      <Btn
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Cursiva"
      >
        <em>I</em>
      </Btn>
      <Btn
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Título grande"
      >
        H2
      </Btn>
      <Btn
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Título mediano"
      >
        H3
      </Btn>

      <Divider />

      {/* Grupo: Listas */}
      <Btn
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Lista con viñetas"
      >
        • Lista
      </Btn>
      <Btn
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Lista numerada"
      >
        1. Lista
      </Btn>

      <Divider />

      {/* Grupo: Cita y enlace */}
      <Btn
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title='Insertar cita destacada'
      >
        ❝ Cita
      </Btn>
      <Btn
        active={editor.isActive("link")}
        onClick={setLink}
        title="Insertar enlace"
      >
        Enlace
      </Btn>

      <Divider />

      {/* Grupo: Tabla */}
      {!inTable ? (
        <Btn onClick={insertTable} title="Insertar tabla 3×3">
          ⊞ Tabla
        </Btn>
      ) : (
        <>
          <Btn
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Agregar fila abajo"
          >
            + Fila
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().deleteRow().run()}
            title="Eliminar fila"
            danger
          >
            − Fila
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Agregar columna a la derecha"
          >
            + Col
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().deleteColumn().run()}
            title="Eliminar columna"
            danger
          >
            − Col
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Eliminar tabla completa"
            danger
          >
            ✕ Tabla
          </Btn>
        </>
      )}

      <Divider />

      {/* Grupo: Embeds */}
      <Btn onClick={insertYoutube} title="Insertar video de YouTube">
        ▶ YouTube
      </Btn>
      <Btn onClick={insertTweet} title="Insertar tweet de Twitter/X">
        𝕏 Tweet
      </Btn>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Youtube.configure({
        // Responsive 16:9 by default
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "youtube-embed",
        },
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      TwitterEmbed,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
  });

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
