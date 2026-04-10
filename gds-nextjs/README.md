# GDS Leave Application — Next.js / TypeScript

Official GDS Leave Application for Department of Posts, India Post.  
Generates the government-format quadruplicate leave application + cover letter.

## Project Structure

```
gds-leave-application/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page — state, tabs, print actions
│   └── globals.css         # Tailwind + print styles
├── components/
│   ├── AppTab.tsx          # Leave application form (4 cards)
│   ├── LetterTab.tsx       # Cover letter form + live preview
│   ├── AutocompleteInput.tsx  # Input with localStorage suggestions
│   ├── FormField.tsx       # Reusable form field wrapper
│   ├── PdfPage1.tsx        # Leave application print page (React)
│   └── PdfPage2.tsx        # Cover letter print page (React)
├── lib/
│   ├── utils.ts            # Date formatting, derived data, print CSS
│   ├── useAutocomplete.ts  # Custom hook for autocomplete
│   └── printBuilder.ts     # Builds printable HTML, opens print window
└── types/
    └── gds.ts              # All TypeScript interfaces and types
```

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → http://localhost:3000

# Type-check
npm run type-check

# Build for production
npm run build
npm start
```

## Features

- **4-copy (quadruplicate) format** — fills once, prints 4 identical leave application copies + cover letter
- **Exact government PDF layout** — absolute positioning matches original PDF coordinates
- **Autocomplete** — all text inputs remember previously entered values via `localStorage`
- **Officer selector** — SDI / ASP / SP / SSP with area name, or manual entry
- **Cover letter** — auto-filled, right-aligned "Yours faithfully" and signature block
- **Print / Save as PDF** — opens browser print dialog; choose "Save as PDF"
- **TypeScript** — fully typed form state, derived data, and components

## Print as PDF

Click **Print / Save as PDF** → browser print dialog opens automatically.  
In the dialog, select destination **"Save as PDF"** to download a PDF file.

Page size: **215.91 × 279.42 mm** (US Letter)  
Font: Bookman Old Style / Book Antiqua / Palatino / Georgia (serif fallback stack)

## Path Alias

All imports use `@/` which resolves to the project root (configured in `tsconfig.json`).

```ts
import { FormField } from '@/components/FormField';
import { derive }    from '@/lib/utils';
import type { FormData } from '@/types/gds';
```
