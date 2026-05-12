import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
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

export function renderTipTapToHtml(content: unknown): string {
  const json = (content ?? {}) as JSONContent;

  try {
    return generateHTML(json, [
      StarterKit,
      Image,
      Link,
      Youtube,
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
  } catch {
    return "";
  }
}
