'use client';
// ─── Vertical Toolbar — All editing tools ───────────────────────────────
import React from 'react';
import {
  MousePointer2, Type, Image, Square, Circle, Minus, MoveUpRight,
  Highlighter, Pencil, Eraser, PenTool, RotateCcw, RotateCw,
  Undo2, Redo2, ZoomIn, ZoomOut, PanelLeftOpen, PanelLeftClose,
  FileText, Stamp
} from 'lucide-react';
import type { ToolType } from './types';

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onPageManager: () => void;
  onWatermark: () => void;
  onSignature: () => void;
}

interface ToolBtn {
  id: ToolType | string;
  icon: React.ReactNode;
  label: string;
  action?: () => void;
}

export default function Toolbar({
  activeTool, onToolChange, canUndo, canRedo, onUndo, onRedo,
  onPageManager, onWatermark, onSignature,
}: ToolbarProps) {

  const toolGroups: { title: string; tools: ToolBtn[] }[] = [
    {
      title: 'Select',
      tools: [
        { id: 'select', icon: <MousePointer2 className="w-[18px] h-[18px]" />, label: 'Select (V)' },
      ],
    },
    {
      title: 'Insert',
      tools: [
        { id: 'text', icon: <Type className="w-[18px] h-[18px]" />, label: 'Add Text (T)' },
        { id: 'image', icon: <Image className="w-[18px] h-[18px]" />, label: 'Add Image (I)' },
      ],
    },
    {
      title: 'Shapes',
      tools: [
        { id: 'rect', icon: <Square className="w-[18px] h-[18px]" />, label: 'Rectangle (R)' },
        { id: 'circle', icon: <Circle className="w-[18px] h-[18px]" />, label: 'Circle (C)' },
        { id: 'line', icon: <Minus className="w-[18px] h-[18px]" />, label: 'Line (L)' },
        { id: 'arrow', icon: <MoveUpRight className="w-[18px] h-[18px]" />, label: 'Arrow (A)' },
      ],
    },
    {
      title: 'Annotate',
      tools: [
        { id: 'highlight', icon: <Highlighter className="w-[18px] h-[18px]" />, label: 'Highlight (H)' },
        { id: 'drawing', icon: <Pencil className="w-[18px] h-[18px]" />, label: 'Draw (D)' },
        { id: 'eraser', icon: <Eraser className="w-[18px] h-[18px]" />, label: 'Eraser (E)' },
      ],
    },
    {
      title: 'Sign',
      tools: [
        { id: 'signature_action', icon: <PenTool className="w-[18px] h-[18px]" />, label: 'Signature', action: onSignature },
      ],
    },
  ];

  return (
    <div className="w-full md:w-14 bg-[#0c1019] border-b md:border-b-0 md:border-r border-[color-mix(in_oklab,var(--foreground)_8%,transparent)] flex md:flex-col items-center py-2 px-2 md:px-0 gap-0.5 z-20 overflow-x-auto md:overflow-y-auto md:overflow-x-visible shrink-0 select-none"
         style={{ scrollbarWidth: 'thin' }}>

      <div className="w-8 h-px md:w-px md:h-px bg-white/10 shrink-0 my-1" />

      {/* Tool groups */}
      {toolGroups.map((group, gi) => (
        <React.Fragment key={group.title}>
          {gi > 0 && <div className="w-8 h-px md:w-px md:h-px bg-white/10 shrink-0 my-1" />}
          {group.tools.map(tool => {
            const isActive = activeTool === tool.id;
            const handleClick = () => {
              if (tool.action) {
                tool.action();
              } else {
                onToolChange(tool.id as ToolType);
              }
            };
            return (
              <button
                key={tool.id}
                onClick={handleClick}
                className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all duration-150 ${isActive
                  ? 'bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-pink)] text-white shadow-lg shadow-[var(--brand-orange)]/20 scale-105'
                  : 'text-[color-mix(in_oklab,var(--foreground)_60%,transparent)] hover:bg-white/5 hover:text-white'
                  }`}
                title={tool.label}
              >
                {tool.icon}
              </button>
            );
          })}
        </React.Fragment>
      ))}

      <div className="w-8 h-px md:w-px md:h-px bg-white/10 shrink-0 my-1" />

      {/* Page & Watermark */}
      <button onClick={onPageManager} className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-[color-mix(in_oklab,var(--foreground)_60%,transparent)] hover:bg-white/5 hover:text-white transition-all" title="Page Manager">
        <FileText className="w-[18px] h-[18px]" />
      </button>
      <button onClick={onWatermark} className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-[color-mix(in_oklab,var(--foreground)_60%,transparent)] hover:bg-white/5 hover:text-white transition-all" title="Watermark">
        <Stamp className="w-[18px] h-[18px]" />
      </button>

      {/* Spacer push to bottom on desktop */}
      <div className="hidden md:block flex-1" />

      {/* Undo / Redo */}
      <div className="w-8 h-px md:w-px md:h-px bg-white/10 shrink-0 my-1" />
      <button onClick={onUndo} disabled={!canUndo} className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all ${canUndo ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-white/20 cursor-not-allowed'}`} title="Undo (Ctrl+Z)">
        <Undo2 className="w-[18px] h-[18px]" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all ${canRedo ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-white/20 cursor-not-allowed'}`} title="Redo (Ctrl+Y)">
        <Redo2 className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
}
