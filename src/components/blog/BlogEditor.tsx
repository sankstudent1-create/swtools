"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { 
  Bold, Italic, List, ListOrdered, Image as ImageIcon, 
  Link as LinkIcon, Video as VideoIcon, Heading1, Heading2,
  Undo, Redo
} from "lucide-react";

interface BlogEditorProps {
  content: any;
  onChange: (json: any) => void;
  editable?: boolean;
}

const MenuButton = ({ 
  onClick, 
  active = false, 
  disabled = false, 
  children 
}: { 
  onClick: () => void; 
  active?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode 
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md transition-colors ${
      active 
        ? "bg-white/20 text-white" 
        : "text-white/60 hover:bg-white/10 hover:text-white"
    } disabled:opacity-30`}
  >
    {children}
  </button>
);

export default function BlogEditor({ content, onChange, editable = true }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Youtube.configure({
        width: 480,
        height: 320,
      }),
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-white/5">
      {editable && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-white/10 bg-white/5">
          <MenuButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
          >
            <Heading1 size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 size={18} />
          </MenuButton>
          <div className="w-px h-6 bg-white/10 mx-1 self-center" />
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <Bold size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <Italic size={18} />
          </MenuButton>
          <div className="w-px h-6 bg-white/10 mx-1 self-center" />
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <List size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <ListOrdered size={18} />
          </MenuButton>
          <div className="w-px h-6 bg-white/10 mx-1 self-center" />
          <MenuButton 
            onClick={() => {
              const url = window.prompt("URL");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            active={editor.isActive("link")}
          >
            <LinkIcon size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => {
              const url = window.prompt("Image URL");
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
          >
            <ImageIcon size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => {
              const url = window.prompt("YouTube URL");
              if (url) editor.chain().focus().setYoutubeVideo({ url }).run();
            }}
          >
            <VideoIcon size={18} />
          </MenuButton>
          <div className="w-px h-6 bg-white/10 mx-1 self-center" />
          <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo size={18} />
          </MenuButton>
        </div>
      )}
      <div className="prose prose-invert max-w-none p-4 min-h-[400px]">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror {
          min-height: 400px;
        }
        .prose a {
          color: #38bdf8;
          text-decoration: underline;
        }
        .prose img {
          max-width: 100%;
          border-radius: 0.5rem;
        }
        .prose iframe {
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
