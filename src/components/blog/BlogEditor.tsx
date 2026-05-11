"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
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
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { IframeEmbed } from "@/lib/blog/iframe-extension";
import {
  Bold, Italic, List, ListOrdered, Image as ImageIcon,
  Link as LinkIcon, Video as VideoIcon, Heading1, Heading2, Heading3,
  Undo, Redo, Share2, Underline as UnderlineIcon, Highlighter,
  Minus, Table as TableIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  ListChecks, Palette, Code, Code2, Quote, Upload, Eye, EyeOff, 
  Type, Maximize2, Minimize2, CornerDownLeft
} from "lucide-react";

interface BlogEditorProps {
  content: any;
  onChange: (json: any) => void;
  editable?: boolean;
}

const Separator = () => (
  <div className="w-px h-5 bg-white/10 mx-0.5 self-center flex-shrink-0" />
);

const ToolbarButton = ({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-all flex-shrink-0 ${
      active
        ? "bg-brand-orange/20 text-brand-orange ring-1 ring-brand-orange/30"
        : "text-white/50 hover:bg-white/10 hover:text-white"
    } disabled:opacity-20 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const COLORS = [
  { label: "Default", value: "" },
  { label: "Orange", value: "#ff6b00" },
  { label: "Sky", value: "#38bdf8" },
  { label: "Emerald", value: "#34d399" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Amber", value: "#fbbf24" },
  { label: "Purple", value: "#a78bfa" },
];

export default function BlogEditor({ content, onChange, editable = true }: BlogEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const safeContent =
    content &&
    typeof content === "object" &&
    (content as any).type === "doc" &&
    Array.isArray((content as any).content)
      ? content
      : { type: "doc", content: [{ type: "paragraph" }] };

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ horizontalRule: false }),
        Image.configure({ allowBase64: true }),
        Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
        Youtube.configure({ width: 640, height: 360, nocookie: true }),
        IframeEmbed,
        Underline,
        Highlight.configure({ multicolor: true }),
        HorizontalRule,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TextStyle,
        Color,
        Superscript,
        Subscript,
        TaskList,
        TaskItem.configure({ nested: true }),
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: safeContent,
      editable,
      onUpdate: ({ editor }) => {
        onChange(editor.getJSON());
        // Rough word count from text content
        const text = editor.getText();
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      },
    },
    [editable]
  );

  const uploadAndInsertImage = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const { uploadBlogMedia } = await import("@/app/admin/blog/actions");
        const { publicUrl } = await uploadBlogMedia(formData);
        editor?.chain().focus().setImage({ src: publicUrl }).run();
      } catch (e: any) {
        window.alert(e?.message || "Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return (
    <div className="min-h-[500px] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-brand-orange rounded-full animate-spin" />
    </div>
  );

  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-[#07090f]" : "w-full"}`}>
      {editable && (
        <div className="flex flex-col border-b border-white/10 bg-[#0d0f1a]">
          {/* Toolbar Row 1 */}
          <div className="flex flex-wrap items-center gap-0.5 px-3 py-2">
            {/* History */}
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
              <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
              <Redo size={16} />
            </ToolbarButton>

            <Separator />

            {/* Headings */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
              <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
              <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
              <Heading3 size={16} />
            </ToolbarButton>

            <Separator />

            {/* Formatting */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
              <UnderlineIcon size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
              <span className="text-[13px] font-bold line-through">S</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
              <Highlighter size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">
              <Code size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
              <Code2 size={16} />
            </ToolbarButton>

            <Separator />

            {/* Super/Subscript */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript">
              <SuperscriptIcon size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript">
              <SubscriptIcon size={16} />
            </ToolbarButton>

            <Separator />

            {/* Text Color */}
            <div className="relative">
              <ToolbarButton onClick={() => setShowColorPicker(v => !v)} title="Text color">
                <div className="flex flex-col items-center gap-0.5">
                  <Palette size={14} />
                  <div
                    className="w-3 h-0.5 rounded-full"
                    style={{ backgroundColor: editor.getAttributes("textStyle").color || "white" }}
                  />
                </div>
              </ToolbarButton>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-[#0d0f1a] border border-white/10 rounded-xl p-2 flex flex-wrap gap-1 w-32 shadow-2xl">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => {
                        c.value
                          ? editor.chain().focus().setColor(c.value).run()
                          : editor.chain().focus().unsetColor().run();
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded-md border border-white/10 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c.value || "#ffffff33" }}
                    />
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Alignment */}
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
              <AlignLeft size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">
              <AlignCenter size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
              <AlignRight size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
              <AlignJustify size={16} />
            </ToolbarButton>

            <Separator />

            {/* Lists */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list">
              <ListOrdered size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleList("taskList", "taskItem").run()} active={editor.isActive("taskList")} title="Task list">
              <ListChecks size={16} />
            </ToolbarButton>

            <Separator />

            {/* Blocks */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
              <Quote size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
              <Minus size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert table">
              <TableIcon size={16} />
            </ToolbarButton>

            <Separator />

            {/* Media */}
            <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Insert link">
              <LinkIcon size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const url = window.prompt("Image URL");
                if (url) editor.chain().focus().setImage({ src: url }).run();
              }}
              title="Image from URL"
            >
              <ImageIcon size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Upload image"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-brand-orange rounded-full animate-spin" />
              ) : (
                <Upload size={16} />
              )}
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const url = window.prompt("YouTube URL");
                if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
              }}
              title="YouTube video"
            >
              <VideoIcon size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const input = window.prompt("Embed URL or iframe HTML");
                if (input) editor.chain().focus().setIframeEmbed({ src: input }).run();
              }}
              title="Embed (Facebook, etc.)"
            >
              <Share2 size={16} />
            </ToolbarButton>

            {/* Spacer + fullscreen */}
            <div className="ml-auto flex items-center gap-0.5">
              <ToolbarButton onClick={() => setIsFullscreen(v => !v)} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </ToolbarButton>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
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

      {/* Bubble menu for inline formatting */}
      {editor && editable && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-0.5 p-1 bg-[#0d0f1a]/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl"
        >
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded-lg text-sm font-bold transition-all ${editor.isActive("bold") ? "bg-brand-orange/20 text-brand-orange" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
            <Bold size={14} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded-lg transition-all ${editor.isActive("italic") ? "bg-brand-orange/20 text-brand-orange" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
            <Italic size={14} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded-lg transition-all ${editor.isActive("underline") ? "bg-brand-orange/20 text-brand-orange" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
            <UnderlineIcon size={14} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={`p-1.5 rounded-lg transition-all ${editor.isActive("highlight") ? "bg-brand-orange/20 text-brand-orange" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
            <Highlighter size={14} />
          </button>
          <div className="w-px h-4 bg-white/10" />
          <button type="button" onClick={setLink} className={`p-1.5 rounded-lg transition-all ${editor.isActive("link") ? "bg-brand-orange/20 text-brand-orange" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
            <LinkIcon size={14} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={`p-1.5 rounded-lg transition-all ${editor.isActive("code") ? "bg-brand-orange/20 text-brand-orange" : "text-white/60 hover:text-white hover:bg-white/10"}`}>
            <Code size={14} />
          </button>
        </BubbleMenu>
      )}

      {/* Editor area */}
      <div
        className={`relative flex-1 overflow-auto ${isFullscreen ? "min-h-0" : ""}`}
        onClick={() => editor?.chain().focus().run()}
      >
        <div
          className={`
            prose prose-invert max-w-none
            prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white
            prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
            prose-p:text-white/80 prose-p:leading-relaxed
            prose-a:text-brand-orange prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-strong:font-bold
            prose-em:text-white/80
            prose-code:text-brand-orange prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:hidden prose-code:after:hidden
            prose-pre:bg-[#0a0c14] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl prose-pre:text-sm
            prose-blockquote:border-l-brand-orange prose-blockquote:bg-white/[0.02] prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-white/60
            prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:my-6
            prose-hr:border-white/10
            prose-li:text-white/80
            prose-table:border prose-table:border-white/10 prose-table:rounded-xl prose-table:overflow-hidden
            prose-th:bg-white/[0.04] prose-th:text-white prose-th:font-bold prose-th:border-white/10 prose-th:p-3
            prose-td:border prose-td:border-white/5 prose-td:p-3
            [&_.task-list]:list-none [&_.task-list]:pl-0
            [&_.task-list-item]:flex [&_.task-list-item]:items-start [&_.task-list-item]:gap-2
            px-8 py-6 min-h-[500px] cursor-text
          `}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Status bar */}
      {editable && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#0d0f1a] text-[10px] font-medium text-white/20">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{readTime} min read</span>
            {editor.isActive("heading", { level: 1 }) && <span>H1</span>}
            {editor.isActive("heading", { level: 2 }) && <span>H2</span>}
            {editor.isActive("heading", { level: 3 }) && <span>H3</span>}
          </div>
          <div className="flex items-center gap-3">
            {editor.isActive("bold") && <span className="font-bold text-white/40">B</span>}
            {editor.isActive("italic") && <span className="italic text-white/40">I</span>}
            {editor.isActive("link") && <span className="text-brand-orange/60">Link</span>}
            <span className="flex items-center gap-1">
              <CornerDownLeft size={9} />
              Enter for new paragraph
            </span>
          </div>
        </div>
      )}

      <style jsx global>{`
        .ProseMirror:focus { outline: none; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255,255,255,0.1);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        .ProseMirror iframe {
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 1rem;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ProseMirror .task-list { padding-left: 0; }
        .ProseMirror .task-list-item { display: flex; align-items: flex-start; gap: 0.5rem; }
        .ProseMirror .task-list-item input[type="checkbox"] {
          accent-color: #ff6b00;
          margin-top: 0.2rem;
          cursor: pointer;
        }
        .ProseMirror table { border-collapse: collapse; width: 100%; }
        .ProseMirror th, .ProseMirror td {
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.5rem 0.75rem;
          min-width: 80px;
        }
        .ProseMirror th { background: rgba(255,255,255,0.04); font-weight: bold; }
        .ProseMirror .selectedCell::after {
          background: rgba(255, 107, 0, 0.1);
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
        .ProseMirror .column-resize-handle {
          background-color: #ff6b00;
          bottom: -2px; position: absolute; right: -2px; top: 0;
          pointer-events: none; width: 4px;
        }
        .tableWrapper { overflow-x: auto; }
        .resize-cursor { cursor: col-resize; }
      `}</style>
    </div>
  );
}
