import { Node, mergeAttributes } from "@tiptap/core";
import type { CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    iframeEmbed: {
      setIframeEmbed: (options: { src: string; title?: string | null }) => ReturnType;
    };
  }
}

/**
 * Tries to convert social post URLs into their official oEmbed / embed iframe src.
 * If the input is already an iframe tag, extracts the src.
 * If it's a raw URL, attempts platform detection.
 */
function normalizeEmbedSrc(input: string): { src: string; type: "iframe" | "twitter" | "facebook" | "instagram" } {
  const trimmed = input.trim();

  // Already an iframe tag — grab the src (improved regex to handle various quote types and no quotes)
  const iframeSrc = trimmed.match(/src\s*=\s*["']?([^"'\s>]+)["']?/i)?.[1];
  if (iframeSrc) return { src: iframeSrc, type: "iframe" };

  // Twitter / X tweet URL
  const tweetMatch = trimmed.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
  if (tweetMatch) {
    return { src: trimmed, type: "twitter" };
  }

  // Facebook post / video
  if (/facebook\.com\/(.*?)/.test(trimmed) && !trimmed.includes("plugins/post.php")) {
    const encoded = encodeURIComponent(trimmed);
    return {
      src: `https://www.facebook.com/plugins/post.php?href=${encoded}&show_text=true&width=500`,
      type: "facebook",
    };
  }

  // Instagram
  if (/instagram\.com\/p\//.test(trimmed)) {
    const cleanUrl = trimmed.replace(/\/$/, "");
    return {
      src: `${cleanUrl}/embed`,
      type: "instagram",
    };
  }

  return { src: trimmed, type: "iframe" };
}

export const IframeEmbed = Node.create({
  name: "iframeEmbed",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => ({
          src: attributes.src,
        }),
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("title"),
        renderHTML: (attributes) => ({
          title: attributes.title,
        }),
      },
      embedType: {
        default: "iframe",
        parseHTML: (element) => element.getAttribute("data-embed-type") || "iframe",
        renderHTML: (attributes) => ({
          "data-embed-type": attributes.embedType,
        }),
      },
      allowfullscreen: {
        default: true,
        parseHTML: (element) => element.getAttribute("allowfullscreen") !== "false",
        renderHTML: (attributes) => ({
          allowfullscreen: attributes.allowfullscreen ? "true" : "false",
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe[data-embed=\"true\"]",
        getAttrs: (dom) => ({
          src: (dom as HTMLElement).getAttribute("src"),
          embedType: "iframe",
        }),
      },
      {
        tag: "div[data-embed-type]",
        getAttrs: (dom) => ({
          src: (dom as HTMLElement).getAttribute("data-tweet-url") || (dom as HTMLElement).getAttribute("src"),
          embedType: (dom as HTMLElement).getAttribute("data-embed-type"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const embedType = HTMLAttributes.embedType || "iframe";
    const src = HTMLAttributes.src as string | null;

    if (!src) {
      return ["div", { class: "embed-placeholder", style: "display:none" }];
    }

    if (embedType === "twitter") {
      return [
        "div",
        mergeAttributes({ "data-embed-type": "twitter", "data-tweet-url": src }),
        [
          "blockquote",
          { class: "twitter-tweet", "data-dnt": "true" },
          ["a", { href: src }, src],
        ],
      ];
    }

    return [
      "iframe",
      mergeAttributes(
        { "data-embed": "true", allowfullscreen: "true" },
        {
          src,
          frameborder: "0",
          allow: "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share",
          style: "width: 100%; aspect-ratio: 16/9; border-radius: 12px;",
        }
      ),
    ];
  },

  addCommands() {
    return {
      setIframeEmbed:
        (options: { src: string; title?: string | null }) =>
        ({ commands }: CommandProps) => {
          const { src, type } = normalizeEmbedSrc(options.src);
          return commands.insertContent({
            type: this.name,
            attrs: {
              src,
              embedType: type,
              title: options.title ?? null,
              allowfullscreen: true,
            },
          });
        },
    };
  },
});
