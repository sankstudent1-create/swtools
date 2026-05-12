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

  // Already an iframe tag — grab the src
  const iframeSrc = trimmed.match(/src=[\"']([^\"']+)[\"']/i)?.[1];
  if (iframeSrc) return { src: iframeSrc, type: "iframe" };

  // Twitter / X tweet URL → convert to embed
  // https://twitter.com/user/status/ID or https://x.com/user/status/ID
  const tweetMatch = trimmed.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
  if (tweetMatch) {
    // Return original URL; we render Twitter via blockquote+script approach — flag as twitter
    return { src: trimmed, type: "twitter" };
  }

  // Facebook post / video embed URL
  // https://www.facebook.com/... → use FB embed endpoint
  if (/facebook\.com\/(.*?)/.test(trimmed) && !trimmed.includes("plugins/post.php")) {
    const encoded = encodeURIComponent(trimmed);
    return {
      src: `https://www.facebook.com/plugins/post.php?href=${encoded}&show_text=true&width=500`,
      type: "facebook",
    };
  }

  // Instagram post URL → convert to embed
  // https://www.instagram.com/p/CODE/
  if (/instagram\.com\/p\//.test(trimmed)) {
    const cleanUrl = trimmed.replace(/\/$/, "");
    return {
      src: `${cleanUrl}/embed`,
      type: "instagram",
    };
  }

  // Raw iframe src (assumed)
  return { src: trimmed, type: "iframe" };
}

export const IframeEmbed = Node.create({
  name: "iframeEmbed",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
      embedType: { default: "iframe" }, // "iframe" | "twitter" | "facebook" | "instagram"
      allowfullscreen: { default: true },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe[data-embed=\"true\"]",
      },
      {
        tag: "div[data-embed-type]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const embedType = HTMLAttributes.embedType || "iframe";

    if (embedType === "twitter") {
      // Render a Twitter blockquote embed container
      return [
        "div",
        mergeAttributes({ "data-embed-type": "twitter", "data-tweet-url": HTMLAttributes.src }),
        [
          "blockquote",
          {
            class: "twitter-tweet",
            "data-dnt": "true",
          },
          ["a", { href: HTMLAttributes.src }, HTMLAttributes.src],
        ],
      ];
    }

    // Default: iframe (YouTube, Facebook plugins, Instagram embed, raw iframes)
    const attrs: Record<string, any> = {
      ...HTMLAttributes,
      "data-embed": "true",
    };
    if (attrs.allowfullscreen) attrs.allowfullscreen = "true";

    return [
      "iframe",
      mergeAttributes(attrs, {
        src: attrs.src ?? undefined,
        frameborder: "0",
        allow: "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share",
      }),
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
