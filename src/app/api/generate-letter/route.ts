import { NextRequest, NextResponse } from 'next/server';

interface GroqMessage {
  role: 'user' | 'system';
  content: string;
}

interface LetterGenerationRequest {
  description: string;
  letterType?: string;
  language?: string;
  currentContext?: {
    department?: string;
    office?: string;
    city?: string;
  };
}

async function callGroqAPI(messages: GroqMessage[], model: string, maxTokens: number = 3000): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('GROQ_API_KEY environment variable is not set');
    throw new Error('GROQ_API_KEY is not configured. Please set it in your environment variables.');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.6,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', response.status, errorText);

      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Groq API (${response.status}): ${errorJson.error?.message || errorText}`);
      } catch {
        throw new Error(`Groq API Error ${response.status}: ${errorText}`);
      }
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Groq API response');
    }

    return content;
  } catch (error) {
    console.error('Groq API call failed:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  try {
    const body = (await request.json()) as LetterGenerationRequest;
    const { description, letterType = 'office_order', language = 'en', currentContext = {} } = body;

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert Government of India official correspondence specialist with deep knowledge of the DOPT Manual of Office Procedure, various ministries, and formal letter formats.

Your task is to generate COMPLETE professional government letters that auto-fill EVERY field with authentic, realistic information.

CRITICAL: Respond with ONLY a valid JSON object - no markdown, no code fences, no explanations.

The JSON must have exactly these fields:
{
  "h1": "Hindi Line 1 (e.g., भारत सरकार)",
  "h2": "Hindi Line 2 (e.g., संचार मंत्रालय)",
  "e1": "English Line 1 (e.g., Government of India)",
  "e2": "English Line 2 (e.g., Ministry of Communications)",
  "dept": "Department Full Name",
  "divn": "Division/Section (if applicable)",
  "ofc": "Office/Building Name",
  "city": "City",
  "pin": "PIN Code",
  "ph": "Phone Number",
  "em": "Email",
  "wb": "Website URL",
  "fno": "File Number (Format: F.No.XX-XX/XXXX-XX)",
  "toD": "Recipient's Designation/Title",
  "toA": "Recipient's Office Address (use \\n for line breaks)",
  "sub": "Subject Line (concise, professional)",
  "ref": "Reference to previous correspondence or empty string",
  "sal": "Salutation (Sir / Madam / Sir/Madam)",
  "body": "Complete letter body (3-5 numbered paragraphs using GoI language, use \\n\\n for paragraph breaks)",
  "cls": "Closing phrase (Yours faithfully / Yours sincerely)",
  "sn": "Signatory Name",
  "sd": "Signatory Designation",
  "sp2": "Direct Phone/Extension (optional)",
  "sh": "Hindi/Regional Name (optional)",
  "sc": "Constituency/Circle (optional)",
  "enclList": ["Enclosure 1", "Enclosure 2"] or [],
  "copyList": ["Copy to 1", "Copy to 2", "Copy to 3"] or []
}

AUTHENTIC GoI LETTER PHRASES:
- "I am directed to forward herewith..."
- "It is requested that..."
- "Necessary action may be taken accordingly."
- "This issues with the approval of the competent authority."
- "In this connection, it is intimated that..."
- "Please refer to the office order dated..."
- "The following guidelines have been issued..."

FILE NUMBER FORMAT: F.No.[Section]/[Year]-[Abbreviation]
Examples: F.No.38-0112013-PAP, F.No.1001(Acct)/2020-Est

CRITICAL REQUIREMENTS:
- Generate realistic, complete, professional letters
- EVERY field must be filled with appropriate content
- Body must have 2-4 numbered paragraphs with proper GoI terminology
- Include realistic Copy To list (3-4 recipients)
- Include relevant Enclosures
- Use proper salutation and closing
- Match letter type style and tone
- Language preference compliance

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.`;

    const letterTypeMap = {
      office_order: 'Office Order',
      om: 'Office Memorandum (OM)',
      do: 'Demi-Official (D.O.) Letter',
      circular: 'Circular/General Order',
      reminder: 'Reminder Letter',
      forwarding: 'Forwarding/Endorsement Note',
      scn: 'Show Cause Notice',
      noc: 'No Objection Certificate',
      appreciation: 'Letter of Appreciation',
      tour: 'Tour Programme',
      pm_do: 'PM Personal D.O. Letter',
      mp_letter: 'MP Constituency Letter',
      custom: 'Official Government Letter'
    };

    const langNote = language === 'hi' ? 'Write body and relevant fields in formal Hindi (Devanagari).' :
                     language === 'bi' ? 'Write in Bilingual - alternating English and Hindi paragraphs.' :
                     'Write in formal English matching Government of India style.';

    const userPrompt = `Generate a complete ${letterTypeMap[letterType as keyof typeof letterTypeMap] || 'Government Letter'}.

User Description: "${description}"

Current Context:
- Department: ${currentContext.department || 'Department of Posts'}
- Office: ${currentContext.office || 'Dak Bhavan, Sansad Marg'}
- City: ${currentContext.city || 'New Delhi'}
- Language: ${langNote}

CRITICAL: Fill EVERY single field in the JSON with appropriate, realistic, professional content.
The body must be complete with 3-4 numbered paragraphs in authentic GoI style.
Include Copy To list with 3-4 realistic recipients.
Include relevant 1-2 Enclosures.

RESPOND WITH ONLY THE JSON OBJECT.`;

    const response = await callGroqAPI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model,
      3500
    );

    // Clean response
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/i, '').replace(/```\s*$/, '');
    }

    const letterData = JSON.parse(cleanedResponse.trim());

    return NextResponse.json({
      success: true,
      data: letterData,
      model: model,
    });
  } catch (error) {
    console.error('Letter generation error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response. The AI response was not valid JSON. Please try again with a different description.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate letter' },
      { status: 500 }
    );
  }
}
