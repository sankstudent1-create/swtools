/**
 * Patched YouTube extension that guards against null src.
 * The upstream @tiptap/extension-youtube calls url.match(regex) without
 * a null check, crashing when a stored youtube node has src: null.
 */
import Youtube from "@tiptap/extension-youtube";

export const SafeYoutube = Youtube.extend({
  renderHTML({ HTMLAttributes }) {
    // Guard: if src is null/empty, render a placeholder div instead of crashing
    if (!HTMLAttributes.src) {
      return ["div", { class: "youtube-placeholder", style: "display:none" }];
    }
    // Delegate to the original renderHTML
    return (Youtube as any).config.renderHTML?.call(this, { HTMLAttributes }) ?? [
      "div",
      { "data-youtube-video": "" },
      ["iframe", { src: HTMLAttributes.src }],
    ];
  },
});
