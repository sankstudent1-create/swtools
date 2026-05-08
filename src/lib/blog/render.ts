import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { IframeEmbed } from "@/lib/blog/iframe-extension";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

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
      Highlight,
      HorizontalRule,
      Table,
      TableRow,
      TableHeader,
      TableCell,
    ]);
  } catch {
    return "";
  }
}
