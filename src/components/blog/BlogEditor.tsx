"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { IframeEmbed } from "@/lib/blog/iframe-extension";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { 
  Bold, Italic, List, ListOrdered, Image as ImageIcon, 
  Link as LinkIcon, Video as VideoIcon, Heading1, Heading2,
  Undo, Redo, Share2, Underline as UnderlineIcon, Highlighter,
  Minus, Table as TableIcon
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
  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const contentKey =
    content && typeof content === "object" ? JSON.stringify(content) : "__empty__";

  const safeContent =
    content &&
    typeof content === "object" &&
    (content as any).type === "doc" &&
    Array.isArray((content as any).content)
      ? content
      : { type: "doc", content: [{ type: "paragraph" }] };

  // Remove contentKey from dependencies to stop infinite re-renders
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false, // Disable default HR to use custom HorizontalRule extension
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Youtube.configure({
        width: 480,
        height: 320,
      }),
      IframeEmbed,
      Underline,
      Highlight,
      HorizontalRule,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: safeContent,
    editable: editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  }, [editable]); // Only depend on editable, not contentKey

  if (!editor) return null;

  const uploadAndInsertImage = async (file: File) => {
    setUploading(true);
    try {
      const safeExt = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `inline/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;

      const { error } = await supabase.storage
        .from("blog")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (error) throw error;

      const { data } = supabase.storage.from("blog").getPublicUrl(path);
      const publicUrl = data?.publicUrl;
      if (publicUrl) editor.chain().focus().setImage({ src: publicUrl }).run();
    } catch (e: any) {
      window.alert(e?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

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
          <MenuButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          >
            <UnderlineIcon size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive("highlight")}
          >
            <Highlighter size={18} />
          </MenuButton>
          <div className="w-px h-6 bg-white/10 mx-1 self-center" />
          <MenuButton 
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            <TableIcon size={18} />
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
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <ImageIcon size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => {
              const url = window.prompt("YouTube URL");
              if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
            }}
          >
            <VideoIcon size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => {
              const input = window.prompt(
                "Embed URL or iframe HTML (Facebook post/video embed works here)"
              );
              if (input) editor.chain().focus().setIframeEmbed({ src: input }).run();
            }}
          >
            <Share2 size={18} />
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadAndInsertImage(file);
          e.target.value = "";
        }}
      />

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
