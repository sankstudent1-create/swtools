// ─── Pro PDF Editor — Shared Type Definitions ────────────────────────────
// All element types, tool modes, and state interfaces used across the editor.

export type ElementType =
  | 'text'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'highlight'
  | 'drawing'
  | 'image'
  | 'signature';

export type ToolType =
  | 'select'
  | ElementType
  | 'eraser';

export type TextAlign = 'left' | 'center' | 'right';

export interface PathPoint {
  x: number;
  y: number;
}

export interface PDFElement {
  id: string;
  pageIndex: number;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;

  // Text properties
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: TextAlign;
  letterSpacing?: number;
  lineHeight?: number;

  // Inline editing — original text capture for pixel-perfect replacement
  originalSpanId?: string;
  originalText?: string; // stores original text to hide it reliably during edits
  originalTransform?: string;  // CSS transform matrix from react-pdf text layer
  originalFontName?: string;   // Font name as encoded in the PDF
  originalPdfFontSize?: number; // Font size in PDF coordinate space (before scaling)

  // Shape properties
  fill?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;

  // Common
  opacity?: number;
  rotation?: number;

  // Freehand drawing
  points?: PathPoint[];

  // Image / Signature
  imageData?: string; // base64 data URL

  // Line/Arrow endpoints (stored as offsets from x,y)
  x2?: number;
  y2?: number;
}

export interface PageTransform {
  rotation: number;   // 0, 90, 180, 270
  deleted: boolean;
  order: number;       // for reordering
}

export interface WatermarkConfig {
  enabled: boolean;
  type: 'text' | 'image';
  text?: string;
  imageData?: string;
  fontSize?: number;
  color?: string;
  opacity: number;
  rotation: number;     // degrees
  position: 'center' | 'tile' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface EditorState {
  elements: PDFElement[];
  selectedId: string | null;
  activeTool: ToolType;
  zoom: number;             // 0.5 → 3.0
  currentPage: number;      // 0-indexed
  pageTransforms: Record<number, PageTransform>;
  watermark: WatermarkConfig | null;
  showThumbnails: boolean;
  pageOrder: number[];      // Array of original page indices in their new order
}

export type EditorAction =
  | { type: 'SET_ELEMENTS'; elements: PDFElement[] }
  | { type: 'ADD_ELEMENT'; element: PDFElement }
  | { type: 'UPDATE_ELEMENT'; id: string; partial: Partial<PDFElement> }
  | { type: 'REMOVE_ELEMENT'; id: string }
  | { type: 'SET_SELECTED'; id: string | null }
  | { type: 'SET_TOOL'; tool: ToolType }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_PAGE_TRANSFORM'; pageIndex: number; transform: Partial<PageTransform> }
  | { type: 'SET_WATERMARK'; watermark: WatermarkConfig | null }
  | { type: 'TOGGLE_THUMBNAILS' }
  | { type: 'REORDER_PAGES'; from: number; to: number }
  | { type: 'SET_PAGE_ORDER'; order: number[] }
  | { type: 'RESET' };

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_ELEMENTS':
      return { ...state, elements: action.elements };
    case 'ADD_ELEMENT':
      return { ...state, elements: [...state.elements, action.element] };
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.id ? { ...el, ...action.partial } : el
        ),
      };
    case 'REMOVE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    case 'SET_SELECTED':
      return { ...state, selectedId: action.id };
    case 'SET_TOOL':
      return { ...state, activeTool: action.tool };
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.5, Math.min(3.0, action.zoom)) };
    case 'SET_PAGE':
      return { ...state, currentPage: action.page };
    case 'SET_PAGE_TRANSFORM': {
      const prev = state.pageTransforms[action.pageIndex] || { rotation: 0, deleted: false, order: action.pageIndex };
      return {
        ...state,
        pageTransforms: {
          ...state.pageTransforms,
          [action.pageIndex]: { ...prev, ...action.transform },
        },
      };
    }
    case 'SET_WATERMARK':
      return { ...state, watermark: action.watermark };
    case 'TOGGLE_THUMBNAILS':
      return { ...state, showThumbnails: !state.showThumbnails };
    case 'REORDER_PAGES': {
      const newOrder = [...state.pageOrder];
      const [removed] = newOrder.splice(action.from, 1);
      newOrder.splice(action.to, 0, removed);
      return { ...state, pageOrder: newOrder };
    }
    case 'SET_PAGE_ORDER':
      return { ...state, pageOrder: action.order };
    case 'RESET':
      return initialEditorState;
    default:
      return state;
  }
}

export const initialEditorState: EditorState = {
  elements: [],
  selectedId: null,
  activeTool: 'select',
  zoom: 1.2,
  currentPage: 0,
  pageTransforms: {},
  watermark: null,
  showThumbnails: false,
  pageOrder: [],
};

export const FONT_OPTIONS = [
  { label: 'Helvetica / Arial', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'TimesRoman' },
  { label: 'Courier', value: 'Courier' },
  { label: 'Helvetica Bold', value: 'Helvetica-Bold' },
  { label: 'Times Bold', value: 'TimesRoman-Bold' },
  { label: 'Courier Bold', value: 'Courier-Bold' },
] as const;

export const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#facc15' },
  { label: 'Green', value: '#4ade80' },
  { label: 'Blue', value: '#60a5fa' },
  { label: 'Pink', value: '#f472b6' },
] as const;

export const PRESET_COLORS = [
  '#000000', '#ffffff', '#2563eb', '#dc2626',
  '#16a34a', '#d97706', '#7c3aed', '#ec4899',
  '#06b6d4', '#84cc16', '#f43f5e', '#8b5cf6',
] as const;

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
