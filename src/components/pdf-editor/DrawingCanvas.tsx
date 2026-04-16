'use client';
import React, { useRef, useEffect, useState } from 'react';
import type { PathPoint } from './types';

interface DrawingCanvasProps {
  isActive: boolean;
  color: string;
  width: number;
  onDrawEnd: (points: PathPoint[]) => void;
  pageWidth: number;
  pageHeight: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  isActive,
  color,
  width,
  onDrawEnd,
  pageWidth,
  pageHeight
}) => {
  const [points, setPoints] = useState<PathPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isActive) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDrawing(true);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints(prev => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (isDrawing && points.length > 1) {
      onDrawEnd(points);
    }
    setIsDrawing(false);
    setPoints([]);
  };

  const pathD = points.length > 1 
    ? points.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-50 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {points.length > 1 && (
        <svg className="w-full h-full pointer-events-none">
          <path 
            d={pathD} 
            fill="none" 
            stroke={color} 
            strokeWidth={width} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      )}
    </div>
  );
};

export default DrawingCanvas;
