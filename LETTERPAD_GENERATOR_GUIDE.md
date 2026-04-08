# AI Letterpad Generator - Setup & Usage Guide

## Overview
The AI Letterpad Generator is an advanced tool for creating professional business letters, government correspondence, and formal communications. It uses **Groq AI** for intelligent letter generation from simple descriptions.

## Features

### ✨ AI-Powered Generation
- Describe what you need: *"Write appreciation letter from President of India to Sanket for flood relief work at Beed"*
- AI automatically generates complete letter with all details

### 📋 Professional Templates
- **Type A**: Classic DoP / Department of Posts (File No left, Logo right, Stars divider)
- **Type B**: PM / Senior Official (Emblem center, Address top-right)
- **Type C**: MP / Sansad Member (Dual logos, Bilingual center)
- **Type D**: MLA / State Assembly (Emblem left, Prominent name)
- **Type E**: Office Memorandum (OM) (No To-block, Wide distribution)
- **Type F**: Circular / General Order (CIRCULAR badge, Numbered)

### 🏛️ Office Presets
Quick templates for common organizations:
- **DoP**: Department of Posts
- **PM**: Prime Minister's Office
- **President**: Office of the President
- **Custom**: Blank template for full customization

### 📄 Export Formats
- **PDF**: Professional document format for printing and archiving
- **PNG**: Digital image format for sharing and web

### ✏️ Full Customization
- Editable header, body, footer
- Custom signatory details
- File numbers, dates, references
- Contact information
- Logo uploads

---

## Setup Instructions

### 1. Get Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or login to your account
3. Navigate to **API Keys** section
4. Click **"Create New API Key"**
5. Copy the generated key (it will only show once!)

### 2. Configure Environment Variable

Create or edit `.env.local` in the project root:

```bash
GROQ_API_KEY=your_api_key_here
```

Example:
```bash
GROQ_API_KEY=gsk_abc123def456ghi789jkl012mno345pqr
```

### 3. Restart Development Server

If running Next.js dev server:
```bash
npm run dev
```

The API will automatically pick up the new environment variable.

---

## How to Use

### Via UI

1. Navigate to **Tools → Letterpad Generator**
2. Choose method:

#### Option A: AI Generation (Recommended)
1. Select **Template Type** (A-F)
2. In "AI Generator" section, describe your letter:
   ```
   Write appreciation letter from President of India to Sanket
   for his good works at Beed and surrounding area for flood
   affected people. President is praising his actions.
   ```
3. Click **"Generate with AI"**
4. System fills in all fields automatically
5. Review and edit if needed
6. Click **"Export"** → Choose PDF or PNG
7. Download your letter

#### Option B: Use Office Presets
1. Click one of the preset buttons:
   - **DoP** (Department of Posts)
   - **PM** (Prime Minister)
   - **President** (Office of the President)
2. Manually edit details as needed
3. Export to PDF or PNG

#### Option C: Manual Entry
1. Fill in all fields manually:
   - Header details (organization, department, contact)
   - Letter content (To, Subject, Body)
   - Signatory information
   - File number and date
2. Click **"Export"**
3. Select format and download

---

## API Endpoint

### POST `/api/generate-letter`

Generate a complete letter using AI.

**Request:**
```json
{
  "description": "Write appreciation letter from President...",
  "template": "A",
  "tone": "formal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "company_name": "Office of the President",
    "address": "Rashtrapati Bhavan, New Delhi",
    "phone": "011-30911111",
    "email": "contact@rashtrapatibhavan.gov.in",
    "website": "www.rashtrapatibhavan.gov.in",
    "recipient_name": "Sanket",
    "recipient_designation": "Flood Relief Coordinator",
    "recipient_address": "Beed, Maharashtra",
    "subject": "Appreciation for Flood Relief Work",
    "letter_body": "Dear Sir/Madam,\n\nI am directed to convey...",
    "closing": "Yours faithfully",
    "signatory_name": "President of India",
    "signatory_designation": "Office of the President",
    "footer_text": "Rashtrapati Bhavan | New Delhi"
  }
}
```

---

## Supported Groq Models

Current available models (as of April 2026):
- `llama-3.1-70b-versatile` ✅ (Used in this implementation)
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768` ❌ (Deprecated)

Check [Groq Docs](https://console.groq.com/docs/models) for latest models.

---

## Troubleshooting

### Error: "GROQ_API_KEY is not configured"
**Solution**:
- Ensure `.env.local` file exists in project root with `GROQ_API_KEY=your_key`
- Restart the development server after adding the key

### Error: "Groq API Error 400: Model has been decommissioned"
**Solution**:
- The Groq API has deprecated older models
- The code automatically uses `llama-3.1-70b-versatile` (latest stable model)
- No action needed, just regenerate

### Error: "Failed to parse AI response"
**Possible causes:**
- Groq API is temporarily unavailable
- Rate limit exceeded
- Invalid API key

**Solutions:**
1. Check your API key at [console.groq.com](https://console.groq.com)
2. Wait a moment and try again
3. Check Groq status at https://status.groq.com

### Export not working
**Check:**
- Browser allows downloads
- Free disk space available
- Try PNG format instead of PDF
- Check browser console for errors (F12)

---

## Letter Structure

### Standard Government Letter Format

```
[TRICOLOR BAR]

[HEADER]
Government of India
Ministry / Department

[DIVIDER - with decorative stars]

File No: F.No.XX-XXXX                    Dated: DD Month YYYY

[RECIPIENT ADDRESS]
To
The [Designation]
[Office/Address]
City - PIN

[SUBJECT]
Sub: Subject of the Letter

[SALUTATION]
Sir/Madam,

[BODY]
Numbered paragraphs with proper spacing.
I am directed to...
It is requested that...
Necessary action may be taken accordingly.

[CLOSING]
Yours faithfully,

[SIGNATURE SPACE]

[SIGNATORY]
Name of Officer
Designation

[FOOTER]
Office Name | City - PIN
```

---

## Best Practices

### ✅ Do's
- ✅ Use clear, descriptive prompts for AI generation
- ✅ Always review AI-generated content before exporting
- ✅ Use appropriate template for letter type
- ✅ Include all required contact information
- ✅ Use formal language for official correspondence
- ✅ Test with sample letters first

### ❌ Don'ts
- ❌ Don't share your Groq API key publicly
- ❌ Don't forget to set GROQ_API_KEY in `.env.local`
- ❌ Don't use for malicious or fraudulent correspondence
- ❌ Don't commit `.env.local` to git (add to `.gitignore`)

---

## Examples

### Example 1: Appreciation Letter

**Prompt:**
```
Write appreciation letter from President of India to Sanket
for his good works at Beed and surrounding area for flood
affected people. President is praising his actions.
```

**Generated Letter:**
- Automatically addresses to correct recipient
- Uses formal government language
- Includes proper letterhead
- Adds appropriate signature block
- Exports to PDF ready for printing

### Example 2: Office Memorandum

**Prompt:**
```
Write office memorandum from Department of Posts to all
regional heads regarding new salary disbursement procedures
effective from next month.
```

**Settings:**
- Template: E (Office Memorandum)
- Office Preset: DoP
- Export: PDF

### Example 3: Circular

**Prompt:**
```
General circular from Ministry of Communications to all
postal circles regarding holiday schedule for coming festival season.
```

**Settings:**
- Template: F (Circular/General Order)
- Office Preset: DoP
- Export: PDF

---

## Support & Feedback

For issues or feature requests:
1. Check troubleshooting section above
2. Verify Groq API status
3. Review generated letter for accuracy
4. Contact support with detailed description

---

## Version Info
- **Tool Version**: 2.0 (AI-Powered)
- **Last Updated**: April 2026
- **AI Provider**: Groq (llama-3.1-70b-versatile)
- **Export Formats**: PDF, PNG
- **Supported Templates**: 6 (A-F)

---

**Happy letter writing! 📝**
