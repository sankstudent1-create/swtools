"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { SafeYoutube } from "@/lib/blog/safe-youtube";
import { IframeEmbed } from "@/lib/blog/iframe-extension";
import { useState, useCallback, useEffect } from "react";
import { 
  Bold, Italic, List, ListOrdered, Quote, Undo, Redo, 
  Link as LinkIcon, Image as ImageIcon, Video, Code, 
  Type, AlignLeft, AlignCenter, AlignRight, Underline as UnderlineIcon,
  Table as TableIcon, Minus, Hash, Highlighter, Maximize, ExternalLink, X
} from "lucide-react";

interface BlogEditor2Props {
  initialContent?: any;
  onChange: (json: any) => void;
}

export default function BlogEditor2({ initialContent, onChange }: BlogEditor2Props) {
  const [wordCount, setWordCount] = useState(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaType, setMediaType] = useState<"youtube" | "iframe">("youtube");
  const [mediaUrl, setMediaUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ horizontalRule: false }),
      Image.configure({ allowBase64: true }),
      Link.configure({ 
        openOnClick: false, 
        autolink: true,
        HTMLAttributes: { 
          rel: "noopener noreferrer", 
          target: "_blank",
          class: "text-brand-orange hover:underline font-medium"
        } 
      }),
      SafeYoutube.configure({ width: 640, height: 360, nocookie: true }),
      IframeEmbed,
      Underline,
      Highlight.configure({ multicolor: true }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Superscript,
      Subscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);
      
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[500px] blog-content",
      },
    },
  });

  const insertMedia = () => {
    if (!mediaUrl || !editor) return;

    if (mediaType === "youtube") {
      editor.chain().focus().insertContent({
        type: "youtube",
        attrs: { src: mediaUrl.trim() },
      }).run();
    } else {
      // @ts-ignore
      editor.commands.setIframeEmbed({ src: mediaUrl.trim() });
    }

    setMediaUrl("");
    setIsMediaModalOpen(false);
  };

  const addLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const MenuButton = ({ onClick, isActive = false, disabled = false, children, title }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2.5 rounded-xl transition-all duration-200 ${
        isActive 
          ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20 scale-105" 
          : "text-white/40 hover:text-white hover:bg-white/10"
      } disabled:opacity-20 active:scale-95`}
    >
      {children}
    </button>
  );

  if (!editor) return null;

  return (
    <div className="relative">
      {/* Premium Toolbar */}
      <div className="sticky top-24 z-40 mb-10 p-2 bg-[#0c0f17]/95 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl flex flex-wrap items-center gap-1">
        <div className="flex items-center gap-1 pr-2 border-r border-white/5 mr-1">
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            isActive={editor.isActive("bold")} 
            title="Bold"
          >
            <Bold size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            isActive={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-white/5 mr-1">
          <MenuButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Hash size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-white/5 mr-1">
          <MenuButton onClick={addLink} isActive={editor.isActive("link")} title="Add Link">
            <LinkIcon size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => {
              setMediaType("youtube");
              setIsMediaModalOpen(true);
            }} 
            title="YouTube Video"
          >
            <Video size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => {
              setMediaType("iframe");
              setIsMediaModalOpen(true);
            }} 
            title="Iframe/Social Embed"
          >
            <ExternalLink size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-white/5 mr-1">
          <MenuButton 
            onClick={() => editor.chain().focus().setTextAlign("left").run()} 
            isActive={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().setTextAlign("center").run()} 
            isActive={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().setTextAlign("right").run()} 
            isActive={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            <AlignRight size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
            <Undo size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
            <Redo size={18} />
          </MenuButton>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="ui-modal-shell p-12 bg-white/[0.01] border-white/5 min-h-[600px] shadow-2xl relative">
        <EditorContent editor={editor} />
        
        {/* Floating Word Count */}
        <div className="absolute bottom-6 right-8 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/20">
          {wordCount} words
        </div>
      </div>

      {/* Media Insertion Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg ui-modal-shell p-10 shadow-2xl border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
                  {mediaType === "youtube" ? <Video size={24} /> : <ExternalLink size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">Insert {mediaType}</h3>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-1">Provide source URL</p>
                </div>
              </div>
              <button onClick={() => setIsMediaModalOpen(false)} className="p-2 text-white/20 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Paste URL or Embed Code</label>
                <textarea
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 text-white/70 resize-none h-32 leading-relaxed"
                  placeholder={mediaType === "youtube" ? "https://youtube.com/watch?v=..." : "https://twitter.com/status/..."}
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMediaModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl border border-white/10 text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={insertMedia}
                  className="flex-[2] py-4 rounded-2xl bg-brand-orange text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-orange/20 hover:scale-[1.02] transition-all"
                >
                  Confirm Insertion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
