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
  Table as TableIcon, Minus, Hash, Highlighter, Maximize, ExternalLink, X,
  Terminal, Edit3
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
  
  // Debug & Audit States
  const [activeTab, setActiveTab] = useState<"editor" | "json" | "audit">("editor");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [currentJson, setCurrentJson] = useState<any>(initialContent);

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
      setCurrentJson(json);
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

  const auditContent = useCallback((json: any) => {
    const logs: any[] = [];
    const srcRequired = ["youtube", "iframeEmbed", "image"];
    
    const checkNode = (node: any) => {
      if (srcRequired.includes(node.type)) {
        if (!node.attrs?.src) {
          logs.push({ 
            status: "dropped", 
            type: node.type, 
            reason: "Missing src attribute",
            timestamp: new Date().toLocaleTimeString()
          });
          return false;
        } else {
          logs.push({ 
            status: "preserved", 
            type: node.type, 
            src: node.attrs.src,
            timestamp: new Date().toLocaleTimeString()
          });
        }
      }
      if (node.content) {
        node.content = node.content.filter(checkNode);
      }
      return true;
    };

    const cloned = JSON.parse(JSON.stringify(json));
    checkNode(cloned);
    setAuditLogs(prev => [...logs, ...prev].slice(0, 20));
  }, []);

  useEffect(() => {
    if (currentJson) auditContent(currentJson);
  }, [currentJson, auditContent]);

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
    <div className="flex flex-col gap-6">
      {/* Header & View Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center p-1 bg-white/5 rounded-2xl border border-white/10">
          {[
            { id: "editor", label: "Editor", icon: Edit3 },
            { id: "json", label: "JSON Preview", icon: Code },
            { id: "audit", label: "Audit Log", icon: Terminal },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20" 
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Post Metrics</span>
            <span className="text-xs font-bold text-white/60">{wordCount} words</span>
          </div>
        </div>
      </div>

      <div className="ui-modal-shell p-8 bg-white/[0.01] border-white/5 min-h-[600px] relative overflow-hidden">
        {activeTab === "editor" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Premium Toolbar */}
            <div className="sticky top-0 z-40 mb-10 p-2 bg-[#0c0f17]/95 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl flex flex-wrap items-center gap-1">
              <div className="flex items-center gap-1 pr-2 border-r border-white/5 mr-1">
                <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
                  <Bold size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
                  <Italic size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline">
                  <UnderlineIcon size={18} />
                </MenuButton>
              </div>

              <div className="flex items-center gap-1 pr-2 border-r border-white/5 mr-1">
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">
                  <Hash size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
                  <List size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numbered List">
                  <ListOrdered size={18} />
                </MenuButton>
              </div>

              <div className="flex items-center gap-1 pr-2 border-r border-white/5 mr-1">
                <MenuButton onClick={addLink} isActive={editor.isActive("link")} title="Add Link">
                  <LinkIcon size={18} />
                </MenuButton>
                <MenuButton onClick={() => { setMediaType("youtube"); setIsMediaModalOpen(true); }} title="YouTube Video">
                  <Video size={18} />
                </MenuButton>
                <MenuButton onClick={() => { setMediaType("iframe"); setIsMediaModalOpen(true); }} title="Iframe/Social Embed">
                  <ExternalLink size={18} />
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

            <EditorContent editor={editor} />
          </div>
        )}

        {activeTab === "json" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Raw TipTap JSON (Database Target)</h3>
              <button 
                onClick={() => navigator.clipboard.writeText(JSON.stringify(currentJson, null, 2))}
                className="text-[10px] font-black text-brand-orange hover:brightness-110 uppercase tracking-widest"
              >
                Copy to Clipboard
              </button>
            </div>
            <pre className="p-8 bg-black/40 rounded-3xl border border-white/5 font-mono text-[11px] leading-relaxed text-indigo-300/80 overflow-auto max-h-[600px] custom-scrollbar">
              {JSON.stringify(currentJson, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6">Real-time Content Auditor</h3>
            <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
                  No media nodes detected in content
                </div>
              ) : (
                auditLogs.map((log, idx) => (
                  <div key={idx} className={`group flex items-center justify-between p-5 rounded-2xl border transition-all ${
                    log.status === "dropped" ? "bg-red-500/5 border-red-500/10" : "bg-green-500/5 border-green-500/10"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        log.status === "dropped" ? "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                      }`} />
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-white group-hover:text-brand-orange transition-colors">
                          {log.type}
                        </div>
                        <div className="text-[10px] text-white/30 font-mono mt-1 break-all max-w-xl">
                          {log.src || log.reason}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/10">
                      {log.timestamp}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Media Modal */}
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
