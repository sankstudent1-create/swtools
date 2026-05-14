/**
 * Patched YouTube extension — fully self-contained.
 * The upstream @tiptap/extension-youtube crashes on null src because
 * getEmbedUrlFromYoutubeUrl() calls url.match(regex) without a null guard.
 * This wrapper replaces renderHTML entirely with a crash-proof implementation.
 */
import Youtube from "@tiptap/extension-youtube";
import { mergeAttributes } from "@tiptap/core";

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

export const SafeYoutube = Youtube.extend({
  parseHTML() {
    return [
      {
        tag: "div[data-youtube-video] iframe",
        getAttrs: (dom) => ({
          src: (dom as HTMLElement).getAttribute("src"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    try {
      const src = HTMLAttributes?.src as string | null | undefined;
      if (!src) {
        return ["div", { "data-youtube-video": "", style: "display:none" }];
      }

      const embedUrl = toEmbedUrl(src, true) ?? src;

      return [
        "div",
        { "data-youtube-video": "", class: "youtube-embed-wrapper" },
        [
          "iframe",
          mergeAttributes(
            {
              src: embedUrl,
              width: this.options.width ?? 640,
              height: this.options.height ?? 360,
              allowfullscreen: "true",
              frameborder: "0",
              allow:
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
              style: "width: 100%; aspect-ratio: 16/9; border-radius: 12px;",
            },
            // Only merge safe attributes from HTMLAttributes (skip null src)
            Object.fromEntries(
              Object.entries(HTMLAttributes).filter(
                ([k, v]) => v != null && k !== "src"
              )
            )
          ),
        ],
      ];
    } catch {
      // Absolute last resort — never crash the editor
      return ["div", { "data-youtube-video": "", style: "display:none" }];
    }
  },
});
