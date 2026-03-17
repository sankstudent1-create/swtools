# SW Tools Portal

A professional, multi-page web application for government exam photo and signature formatting. This is a subsidiary product of SW InfoSystems, providing specialized document formatting tools for online government exam portals.

## Features

- **Multi-Page Marketing Site**: Professional landing page, tools hub, and about page
- **Multi-Tool System**: Support for multiple government examination formatters
- **Real-Time Validation**: Instant validation of dimensions, aspect ratio, and file size
- **Auto-Fix Processing**: Automatic center-crop, resize, and compression to meet specifications
- **Local Processing**: All image processing happens in your browser—zero data collection
- **Professional UI/UX**: Modern, responsive design with vibrant color scheme (orange, pink, sky blue)
- **Tool Support**:
  - **SSC Exam Signature Formatter**: 10-20 KB, 472×236 px (4.0 cm × 2.0 cm @ 300 DPI)
  - **RRB Railway Signature Formatter**: 30-49 KB, minimum 140×60 px, 100 DPI minimum
  - **India Post GDS Photo Formatter**: 30-100 KB, 320×400 px (4:5 portrait, 72-150 DPI)
  - **India Post GDS Signature Formatter**: 20-100 KB, 300×120 px (5:2 landscape, 72-150 DPI)

## Pages

- **Home (/) **: Landing page with hero, features, tools preview, testimonials
- **Tools (/tools)**: Interactive formatter hub with all available tools
- **About (/about)**: Company info, mission, values, and contact details

## Requirements

- **SSC**: JPEG, 10-20 KB, 472×236 px, clear legible signature
- **RRB**: JPEG, 30-49 KB, min 140×60 px, 100 DPI, cursive handwriting
- **India Post GDS Photo**: JPEG, 30-100 KB, 320×400 px (4:5), well-lit, 72-150 DPI
- **India Post GDS Signature**: JPEG, 20-100 KB, 300×120 px (5:2), black/blue ink, 72-150 DPI

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + Custom CSS Variables
- **Icons**: Inline SVG components
- **Image Processing**: Canvas API with quality degradation
- **Fonts**: Geist (Google Fonts)
- **Design System**: Brand colors (orange #ff7a3d, pink #ff4d7d, sky #4a9eff)

## Application Structure

```
src/app/
├── page.tsx              # Landing/home page
├── tools/
│   └── page.tsx         # Tools interface with all formatters
├── about/
│   └── page.tsx         # About company and mission
├── layout.tsx           # Root layout with Navigation
├── globals.css          # Global styles & design tokens
├── favicon.ico          # App icon

src/components/
└── Navigation.tsx       # Sticky navbar with gradient logo
```

## Design System

- **Color Palette**: Vibrant gradients (orange → pink → sky)
- **Typography**: Geist font with bold weights (750)
- **Animations**: Smooth fade-in-up with cubic-bezier timing
- **Spacing**: 4px base unit with Tailwind responsive scales
- **Breakpoints**: Mobile-first responsive design

## Image Processing Features

- **Center-crop**: Automatically centers image in target aspect ratio
- **Smart resize**: Maintains quality while fitting exact dimensions
- **Quality optimization**: Degrades JPEG quality (0.92 → 0.4) to meet KB requirements
- **Validation**: Real-time dimension, ratio, and file size checks
- **Preview**: Side-by-side before/after comparison

## Future Enhancements

Additional formatters planned:
- UPSC Exam Signature
- State PSC Photo/Signature
- Bank Exam Signatures
- Custom exam portals

## Notes

- All processing happens locally in your browser—your documents never leave your device
- Always verify the latest official notification before final submission
- This tool is for formatting only; actual requirements may vary by exam year
- For PwD (VH) candidates, check specific exam requirements for thumb impression allowance

## License

Internal Use Only - SW InfoSystems
