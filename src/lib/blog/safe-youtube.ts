/**
 * Standalone YouTube node for TipTap.
 * Replaces the buggy upstream extension with a robust, attribute-safe version.
 */
import { Node, mergeAttributes } from "@tiptap/core";
import type { CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtube: {
      setYoutubeVideo: (options: { src: string; width?: number; height?: number }) => ReturnType;
    };
  }
}

const YOUTUBE_REGEX =
  /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)(?:\/(?:[\w-]+\?v=|embed\/|v\/|shorts\/)?)?([\w-]{11})(?:\S+)?$/;

function toEmbedUrl(raw: string | null | undefined, nocookie = true): string | null {
  if (!raw || typeof raw !== "string") return null;

  // If it's already an embed URL, return it
  if (raw.includes("youtube.com/embed/") || raw.includes("youtube-nocookie.com/embed/")) {
    return raw;
  }

  const m = raw.match(YOUTUBE_REGEX);
  if (!m?.[1]) return null;
  const host = nocookie ? "www.youtube-nocookie.com" : "www.youtube.com";
  return `https://${host}/embed/${m[1]}`;
}

export interface YoutubeOptions {
  width: number;
  height: number;
  nocookie: boolean;
  allowFullscreen: boolean;
}

export const SafeYoutube = Node.create<YoutubeOptions>({
  name: "youtube",
  group: "block",
  atom: true,

  addOptions() {
    return {
      width: 640,
      height: 360,
      nocookie: true,
      allowFullscreen: true,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        keepOnSplit: false,
        parseHTML: (element) => {
          // Try the element's src first, then check parent div for nested iframe
          const src = element.getAttribute("src");
          if (src) return src;
          // If element is the wrapper div, look for nested iframe
          const iframe = element.querySelector?.("iframe");
          return iframe?.getAttribute("src") || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.src) return {};
          return { src: attributes.src };
        },
      },
      width: {
        default: this.options.width,
        keepOnSplit: false,
        parseHTML: (element) => {
          const w = element.getAttribute("width");
          return w ? parseInt(w, 10) : null;
        },
        renderHTML: (attributes) => ({
          width: attributes.width,
        }),
      },
      height: {
        default: this.options.height,
        keepOnSplit: false,
        parseHTML: (element) => {
          const h = element.getAttribute("height");
          return h ? parseInt(h, 10) : null;
        },
        renderHTML: (attributes) => ({
          height: attributes.height,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-youtube-video] iframe",
        getAttrs: (dom) => ({
          src: (dom as HTMLElement).getAttribute("src"),
        }),
      },
      {
        tag: "div[data-youtube-video]",
        getAttrs: (dom) => {
          const iframe = (dom as HTMLElement).querySelector("iframe");
          if (!iframe) return false;
          return {
            src: iframe.getAttribute("src"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src as string | null | undefined;
    
    if (!src) {
      return ["div", { "data-youtube-video": "", style: "display:none" }];
    }

    const embedUrl = toEmbedUrl(src, this.options.nocookie) ?? src;

    return [
      "div",
      { 
        "data-youtube-video": "", 
        class: "youtube-embed-wrapper",
        style: "position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px; margin: 2rem 0;"
      },
      [
        "iframe",
        mergeAttributes(
          {
            src: embedUrl,
            width: this.options.width,
            height: this.options.height,
            allowfullscreen: this.options.allowFullscreen ? "true" : "false",
            frameborder: "0",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            style: "position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;",
          },
          HTMLAttributes
        ),
      ],
    ];
  },

  addCommands() {
    return {
      setYoutubeVideo:
        (options: { src: string; width?: number; height?: number }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

