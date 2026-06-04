/**
 * Canvas and Image Cross-Browser Compatibility Helpers
 */

// Polyfill HTMLCanvasElement.prototype.toBlob for older WebViews (e.g., Android 5.0)
if (typeof window !== 'undefined' && typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback: (blob: Blob | null) => void, type: string, quality: any) {
      try {
        const binStr = atob(this.toDataURL(type, quality).split(',')[1]);
        const len = binStr.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i);
        }
        callback(new Blob([arr], { type: type || 'image/png' }));
      } catch (e) {
        callback(null);
      }
    }
  });
}

/**
 * Loads a File image source safely, using HTMLImageElement if createImageBitmap is not supported
 */
export function loadImageHelper(file: File): Promise<HTMLImageElement | ImageBitmap> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      createImageBitmap(file)
        .then(resolve)
        .catch(() => {
          fallbackLoad();
        });
    } else {
      fallbackLoad();
    }

    function fallbackLoad() {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Unable to read the selected image."));
      };
      img.src = url;
    }
  });
}

/**
 * Checks if the browser supports Canvas encoding to WEBP format
 */
export function isWebpSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch (e) {
    return false;
  }
}
