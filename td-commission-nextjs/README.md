# TD Commission BPM Incentive Bill — Next.js

SW Info Systems Post Office Tools — built with Next.js 14 App Router + TypeScript + Tailwind CSS.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/td-commission`.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (loads jsPDF via CDN Scripts)
│   ├── page.tsx            # Redirects → /td-commission
│   ├── globals.css         # Tailwind + custom navy vars
│   └── td-commission/
│       └── page.tsx        # Main page component (all state lives here)
├── components/
│   ├── AutocompleteInput.tsx   # Reusable input with localStorage dropdown
│   ├── EntryRow.tsx            # Table row with name autocomplete
│   └── PreviewModal.tsx        # PDF iframe preview modal
├── hooks/
│   └── useLS.ts            # localStorage read/write hook
├── types/
│   └── index.ts            # EntryRow, OfficeDetails, TermKey types
└── utils/
    └── pdf.ts              # numToWords, formatINR, lsGet/lsAdd, buildPDFDoc
```

## Features

- **19 entry rows** — Account No., PR No., Depositor Name, Deposit Amount, Term, Rate (auto), Incentive (auto-calculated)
- **TD rates**: 1 Yr → 0.5%, 2 Yr → 1.0%, 3 Yr → 1.0%, 5 Yr → 2.0%
- **localStorage autocomplete** — B.O / S.O / H.O and depositor names remembered across sessions
- **Total in words** — Indian numeral system (Lakh / Crore)
- **Preview** — iframe popup with blob URL
- **Print** — opens print dialog in new tab
- **Download PDF** — exact government form layout (jsPDF + autoTable via CDN)

## PDF Notes

jsPDF is loaded via `<Script strategy="beforeInteractive">` in `layout.tsx` and accessed via `window.jspdf` in `utils/pdf.ts`. This avoids SSR issues since jsPDF is browser-only.
