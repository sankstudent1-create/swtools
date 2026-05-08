import { Node, mergeAttributes } from "@tiptap/core";
import type { CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    iframeEmbed: {
      setIframeEmbed: (options: { src: string; title?: string | null }) => ReturnType;
    };
  }
}

function normalizeEmbedSrc(input: string): string {
  const trimmed = input.trim();
  const m = trimmed.match(/src=["']([^"']+)["']/i);
  if (m?.[1]) return m[1];
  return trimmed;
}

export const IframeEmbed = Node.create({
  name: "iframeEmbed",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
      allowfullscreen: { default: true },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe[data-embed=\"true\"]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs: Record<string, any> = {
      ...HTMLAttributes,
      "data-embed": "true",
    };

    if (attrs.allowfullscreen) {
      attrs.allowfullscreen = "true";
    }

    return [
      "iframe",
      mergeAttributes(attrs, {
        src: attrs.src ?? undefined,
        frameborder: "0",
        allow:
          "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share",
      }),
    ];
  },

  addCommands() {
    return {
      setIframeEmbed:
        (options: { src: string; title?: string | null }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: normalizeEmbedSrc(options.src),
              title: options.title ?? null,
              allowfullscreen: true,
            },
          });
        },
    };
  },
});
