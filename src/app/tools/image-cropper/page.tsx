"use client";

import { ChangeEvent, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import SuccessPopup from "@/components/SuccessPopup";
import { Download, Upload, Crop as CropIcon, Image as ImageIcon, Settings, CheckCircle2 } from "lucide-react";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

const RATIO_PRESETS = [
  { label: "Free", w: 0, h: 0 },
  { label: "1:1 Square", w: 1, h: 1 },
  { label: "4:5 Insta", w: 4, h: 5 },
  { label: "16:9 Wide", w: 16, h: 9 },
  { label: "9:16 Story", w: 9, h: 16 },
  { label: "3:2 Standard", w: 3, h: 2 },
];

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropperPage() {
  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [outputWidthTarget, setOutputWidthTarget] = useState(1080);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(92);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (imgSrc) URL.revokeObjectURL(imgSrc);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [imgSrc, outputUrl]);

  function onSelectFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  function applyPreset(preset: typeof RATIO_PRESETS[0]) {
    if (preset.w === 0) {
      setAspect(undefined);
    } else {
      const newAspect = preset.w / preset.h;
      setAspect(newAspect);
      if (imgRef.current) {
        setCrop(centerAspectCrop(imgRef.current.width, imgRef.current.height, newAspect));
      }
    }
  }

  async function generateCrop() {
    const image = imgRef.current;
    const cropPixel = completedCrop;
    if (!image || !cropPixel || cropPixel.width === 0 || cropPixel.height === 0) return;

    setIsProcessing(true);
    try {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const sourceX = cropPixel.x * scaleX;
      const sourceY = cropPixel.y * scaleY;
      const sourceWidth = cropPixel.width * scaleX;
      const sourceHeight = cropPixel.height * scaleY;

      const targetRatio = sourceWidth / sourceHeight;
      const outputWidth = outputWidthTarget;
      const outputHeight = Math.round(outputWidth / targetRatio);

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No 2d context");

      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (!b) reject(new Error("Canvas is empty"));
            else resolve(b);
          },
          outputFormat,
          outputFormat === "image/png" ? undefined : quality / 100
        );
      });

      const extension = outputFormat.split("/")[1];
      const out = new File([blob], `swtools-cropped.${extension}`, { type: outputFormat });
      setOutputUrl(URL.createObjectURL(out));
      setOutputName(out.name);
      setShowSuccess(true);
    } catch (e) {
      alert("Error cropping image: " + e);
    } finally {
      setIsProcessing(false);
    }
  }

  function onDownload() {
    if (!outputUrl) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = outputName;
    link.click();
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] shadow-xl backdrop-blur-xl mb-6">
            <CropIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-4">
            Advanced Image Cropper
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Perfectly crop and resize your images with professional ratios and deep glassmorphic controls.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-2 md:p-6 backdrop-blur-xl shadow-2xl relative min-h-[400px] flex items-center justify-center overflow-hidden">
              {!imgSrc ? (
                <label className="flex flex-col items-center justify-center w-full h-full min-h-[300px] cursor-pointer group hover:bg-white/[0.02] transition-colors rounded-2xl">
                  <div className="w-16 h-16 mb-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                    <Upload className="w-8 h-8" />
                  </div>
                  <span className="text-lg font-medium text-white/80">Click to upload image</span>
                  <span className="text-sm text-white/40 mt-1">JPEG, PNG, WEBP</span>
                  <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
                </label>
              ) : (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="max-h-[600px] rounded-xl overflow-hidden shadow-2xl border border-white/10"
                >
                  <img
                    ref={imgRef}
                    alt="Upload"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="max-h-[600px] w-auto h-auto object-contain"
                  />
                </ReactCrop>
              )}
            </div>

            {imgSrc && (
              <div className="flex gap-4 justify-between items-center bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 backdrop-blur-xl">
                 <label className="text-sm text-emerald-400 cursor-pointer font-medium hover:text-emerald-300 transition-colors flex items-center gap-2">
                   <Upload className="w-4 h-4" /> Change Image
                   <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
                 </label>
                 <span className="text-sm text-white/40">Drag corners to crop visually</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" /> Options
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 block">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RATIO_PRESETS.map((p) => {
                      const isActive = (p.w === 0 && aspect === undefined) || (p.w > 0 && aspect === p.w / p.h);
                      return (
                        <button
                          key={p.label}
                          onClick={() => applyPreset(p)}
                          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all border ${
                            isActive
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : "bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/[0.08]"
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                   <label className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 block">
                     Export Width (px)
                   </label>
                   <input
                     type="number"
                     min={100}
                     value={outputWidthTarget}
                     onChange={(e) => setOutputWidthTarget(Number(e.target.value) || 1080)}
                     className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-colors"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 block">Format</label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                    >
                      <option value="image/jpeg">JPEG</option>
                      <option value="image/png">PNG</option>
                      <option value="image/webp">WEBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3 block">
                      Quality ({quality}%)
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mt-3 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={generateCrop}
                  disabled={!imgSrc || !completedCrop || isProcessing}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isProcessing ? "Processing..." : (
                    <>
                      <CropIcon className="w-5 h-5" /> Crop Image
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && outputUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative animate-in fade-in zoom-in duration-200">
             <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">Crop Complete</h3>
             <p className="text-white/50 text-sm mb-6">Your image has been perfectly cropped.</p>
             
             <button
                onClick={() => { onDownload(); setShowSuccess(false); }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
             >
                <Download className="w-5 h-5" /> Download Now
             </button>
             <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-transparent hover:bg-white/5 text-white/70 py-3 rounded-xl transition-all"
             >
                Close
             </button>
           </div>
        </div>
      )}
    </main>
  );
}
