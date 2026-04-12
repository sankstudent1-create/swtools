const fs = require('fs');
const path = require('path');

const tools = [
  {
    id: "ssc",
    name: "SSC Exam Signature Formatter",
    desc: "Format your signature for SSC exams (CGL, CHSL, MTS) to official dimensions and sizes perfectly. Free SSC signature template tool by SW Tools.",
    keywords: ["SSC signature formatting", "SSC photo tool", "SSC examination format"]
  },
  {
    id: "rrb",
    name: "RRB Railway Signature Formatter",
    desc: "Easily format your signature to meet official Railway RRB recruitment guidelines. Ensure exact pixel width and KB limits for railway exams.",
    keywords: ["RRB signature size maker", "Railway exam signature format"]
  },
  {
    id: "india-post-photo",
    name: "India Post GDS Photo Formatter",
    desc: "Free online tool to crop and resize your passport photo to exactly 4:5 ratio and 50KB limit for India Post Gramin Dak Sevak online application.",
    keywords: ["India Post GDS photo", "GDS photo resize", "India post application photo 50kb"]
  },
  {
    id: "india-post-signature",
    name: "India Post GDS Signature Formatter",
    desc: "Format your signature for the India Post Gramin Dak Sevak (GDS) application. Fast, secure, and accurate 20KB limit scaling.",
    keywords: ["India Post GDS signature", "GDS signature resize", "GDS signature 20kb"]
  },
  {
    id: "bank-thumb",
    name: "Banking Thumb Impression Formatter",
    desc: "Format your left-thumb impression image for IBPS, SBI, and other banking rectruitments. Ensures square resolution and high clarity.",
    keywords: ["Bank thumb impression size", "IBPS left thumb impression", "SBI thumb format"]
  },
  {
    id: "ibps-declaration",
    name: "IBPS Handwritten Declaration Formatter",
    desc: "Prepare handwritten declaration scans for IBPS PO, Clerk, SO exams with correct landscape size, dimension, and 50KB to 100KB limits.",
    keywords: ["IBPS handwritten declaration", "IBPS declaration size", "IBPS text formatting"]
  },
  {
    id: "neet-signature",
    name: "NEET Signature & Photo Formatter",
    desc: "Correctly format your online NEET application signature and photo attachments precisely to NTA guidelines.",
    keywords: ["NEET signature format", "NEET photo size tool", "NTA signature resize"]
  },
  {
    id: "image-resizer",
    name: "Free Online Image Resizer",
    desc: "Resize images to precise dimensions with different fit modes, background fills, and quality controls. SW Tools premium utility.",
    keywords: ["online image resizer", "scale image online", "resize image pixels"]
  },
  {
    id: "image-compressor",
    name: "Advanced Image Compressor",
    desc: "Reduce image file size intelligently. Compress JPG, PNG, WEBP files while keeping high visual quality.",
    keywords: ["image compressor online", "reduce image kb", "compress photo size free"]
  },
  {
    id: "aspect-ratio-changer",
    name: "Aspect Ratio Changer",
    desc: "Change the aspect ratio of any image to 16:9, 4:3, 1:1 and other sizes instantly. Fill backgrounds easily.",
    keywords: ["change aspect ratio", "image ratio tool", "16:9 image cropper"]
  },
  {
    id: "pdf-maker",
    name: "Images to PDF Maker",
    desc: "Convert your scanned documents and images into a polished PDF file effortlessly with customized page properties.",
    keywords: ["image to pdf", "convert to pdf", "create pdf files online tools"]
  },
  {
    id: "image-scanner",
    name: "Document Scanner Effect Tool",
    desc: "Give photos of documents a clean, professional scanner effect. Black-and-white, grayscale, auto-cleanup tools.",
    keywords: ["online document scanner", "photo to scanner effect", "scan image online"]
  },
  {
    id: "image-format-converter",
    name: "Image Format Converter",
    desc: "Convert images freely between JPG, PNG, and WebP using this high-performance secure in-browser tool.",
    keywords: ["convert webp to jpg", "png to webp", "image format changer online"]
  },
  {
    id: "image-rotate-flip",
    name: "Image Rotate & Flip Tool",
    desc: "Rotate images to exact angles, flip horizontally or vertically without losing quality.",
    keywords: ["rotate image", "flip photo online", "mirror image tool"]
  },
  {
    id: "image-cropper",
    name: "Online Image Cropper",
    desc: "Easily crop pictures using custom bounds or popular social media aspect ratios.",
    keywords: ["crop image online", "photo cropping tool", "free crop pictures"]
  },
  {
    id: "watermark-stamper",
    name: "Watermark Stamper Tool",
    desc: "Protect your images by stamping customized text watermarks securely in your browser.",
    keywords: ["watermark tool online", "add watermark to photo", "text stamp image"]
  },
  {
    id: "bulk-image-converter",
    name: "Bulk Image Converter",
    desc: "Batch convert multiple images between formats, adjust sizes, and compress simultaneously.",
    keywords: ["batch image converter", "bulk convert photos", "multiple image format tool"]
  },
  {
    id: "letterpad-generator",
    name: "Professional Letterpad Generator",
    desc: "Generate official government and business letterpads with our smart, customizable template output engine.",
    keywords: ["letterpad generator", "office letterhead template", "government formatting tool"]
  },
  {
    id: "gds-leave",
    name: "GDS Leave Application PDF Generator",
    desc: "Auto-generate official GDS Leave Applications in 4-copy format. Complete paid leave and LWA form generator.",
    keywords: ["GDS leave application", "India Post GDS leave PDF", "Gramin Dak Sevak leave form make online"]
  },
  {
    id: "td-commission",
    name: "TD Commission / BPM Bill Generator",
    desc: "Create official BPM Incentive Bills for Time Deposit (TD) commissions automatically. Calculations made easy with SW Tools.",
    keywords: ["TD commission bill", "BPM incentive bill generator", "time deposit commission calculate"]
  }
];

const basePath = path.join(__dirname, 'src', 'app', 'tools');

tools.forEach(tool => {
  const dirPath = path.join(basePath, tool.id);
  
  if (fs.existsSync(dirPath)) {
    const layoutPath = path.join(dirPath, 'layout.tsx');
    const content = `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${tool.name.replace(/'/g, "\\'")}',
  description: '${tool.desc.replace(/'/g, "\\'")}',
  keywords: ${JSON.stringify(tool.keywords)},
  alternates: {
    canonical: '/tools/${tool.id}'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
`;
    fs.writeFileSync(layoutPath, content);
    console.log('Created layout.tsx for', tool.id);
  }
});
