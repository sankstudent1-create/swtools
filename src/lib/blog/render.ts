import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { SafeYoutube } from "@/lib/blog/safe-youtube";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { IframeEmbed } from "@/lib/blog/iframe-extension";
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

/** Remove any embed nodes with null/empty src to prevent renderHTML crashes */
function sanitizeContent(json: any): any {
  if (!json || typeof json !== "object") return json;
  if (Array.isArray(json)) return json.map(sanitizeContent).filter(Boolean);

  // Node types that require a non-empty src attribute
  const srcRequired = ["youtube", "iframeEmbed", "image"];
  if (srcRequired.includes(json.type) && !json.attrs?.src) {
    return null;
  }

  const result: any = { ...json };
  if (Array.isArray(json.content)) {
    result.content = json.content.map(sanitizeContent).filter(Boolean);
  }
  return result;
}

export function renderTipTapToHtml(content: unknown): string {
  const raw = (content ?? {}) as JSONContent;
  const json = sanitizeContent(raw) as JSONContent;

  try {
    return generateHTML(json, [
      StarterKit,
      Image,
      Link,
      SafeYoutube,
      IframeEmbed,
      Underline,
      Highlight.configure({ multicolor: true }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Superscript,
      Subscript,
      Table,
      TableRow,
      TableHeader,
      TableCell,
    ]);
  } catch (err) {
    console.error("[blog] renderTipTapToHtml failed:", err);
    return "";
  }
}
