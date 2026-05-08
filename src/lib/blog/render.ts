import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { IframeEmbed } from "@/lib/blog/iframe-extension";

export function renderTipTapToHtml(content: unknown): string {
  const json = (content ?? {}) as JSONContent;

  try {
    return generateHTML(json, [
      StarterKit,
      Image,
      Link,
      Youtube,
      IframeEmbed,
    ]);
  } catch {
    return "";
  }
}
