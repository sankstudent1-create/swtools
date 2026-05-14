"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import { TextSelection } from "prosemirror-state";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { SafeYoutube } from "@/lib/blog/safe-youtube";
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

import { IframeEmbed } from "@/lib/blog/iframe-extension";
import {
  Bold, Italic, List, ListOrdered, Image as ImageIcon,
  Link as LinkIcon, Video as VideoIcon, Heading1, Heading2, Heading3,
  Undo, Redo, Share2, Underline as UnderlineIcon, Highlighter,
  Minus, Table as TableIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  Palette, Code, Code2, Quote, Upload, Eye, EyeOff, 
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

/** Strip any embed nodes with null/empty src to prevent TipTap renderHTML crashes */
function sanitizeContent(json: any): any {
  if (!json || typeof json !== "object") return json;
  if (Array.isArray(json)) return json.map(sanitizeContent);

  // Node types that require a valid src — remove them if src is missing
  const srcRequiredTypes = ["youtube", "iframeEmbed", "image"];
  if (srcRequiredTypes.includes(json.type) && !json.attrs?.src) {
    return null; // will be filtered out below
  }

  const result: any = { ...json };
  if (Array.isArray(json.content)) {
    result.content = json.content
      .map(sanitizeContent)
      .filter((n: any) => n !== null);
  }
  return result;
}

export default function BlogEditor({ content, onChange, editable = true }: BlogEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const extractSrc = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.startsWith("<iframe")) {
      const match = trimmed.match(/src=["']([^"']+)["']/);
      return match ? match[1] : trimmed;
    }
    return trimmed;
  };

  const safeContent = (() => {
    const raw = content && typeof content === "object" && (content as any).type === "doc" && Array.isArray((content as any).content)
      ? content
      : { type: "doc", content: [{ type: "paragraph" }] };
    return sanitizeContent(raw);
  })();

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ horizontalRule: false }),
        Image.configure({ allowBase64: true }),
        Link.configure({ 
          openOnClick: false, 
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank", class: "text-brand-orange hover:underline font-medium" } 
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
        TableCell.extend({
          // Allow Escape to exit table by inserting paragraph after
          addKeyboardShortcuts() {
            return {
              Escape: () => {
                const { state, dispatch } = this.editor.view;
                const { $head } = state.selection;
                let depth = $head.depth;
                while (depth > 0) {
                  const node = $head.node(depth);
                  if (node.type.name === "table") {
                    const after = $head.after(depth);
                    const tr = state.tr.insert(after, state.schema.nodes.paragraph.create());
                    dispatch(tr.setSelection(TextSelection.near(tr.doc.resolve(after + 1))));
                    return true;
                  }
                  depth--;
                }
                return false;
              },
            };
          },
        }),
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
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL (leave empty to remove link):", prev ?? "");
    if (url === null) return; // cancelled
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const href = url.startsWith("http") ? url : `https://${url}`;
    editor.chain().focus().setLink({ href }).run();
  }, [editor]);

  const insertEmbed = useCallback((platform?: string) => {
    if (!editor) return;
    const label = platform
      ? `Paste ${platform} post URL or embed code:`
      : "Paste YouTube, Facebook, Twitter/X, Instagram URL or iframe embed code:";
    const input = window.prompt(label);
    if (!input?.trim()) return;
    const sanitized = extractSrc(input);
    editor.chain().focus().setIframeEmbed({ src: sanitized }).run();
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
                const url = window.prompt("Image URL:");
                if (!url?.trim()) return;
                try { new URL(url.trim()); } catch { alert("Invalid URL"); return; }
                editor.chain().focus().setImage({ src: url.trim() }).run();
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
                const url = window.prompt("YouTube URL:");
                if (!url?.trim()) return;
                
                // Directly insert content to bypass upstream extension validation that was stripping URLs
                const sanitized = extractSrc(url);
                editor.chain().focus().insertContent({
                  type: "youtube",
                  attrs: { 
                    src: sanitized
                  },
                }).run();
              }}
              title="YouTube video"
            >
              <VideoIcon size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => insertEmbed("Facebook")} title="Facebook post/video">
              <span className="text-[11px] font-black">FB</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => insertEmbed("Twitter/X")} title="Tweet embed">
              <span className="text-[11px] font-black">𝕏</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => insertEmbed("Instagram")} title="Instagram post">
              <span className="text-[11px] font-black">IG</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => insertEmbed()} title="Any embed / iframe">
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
        <div className="blog-content px-8 py-6 min-h-[500px] cursor-text">
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

    </div>
  );
}
