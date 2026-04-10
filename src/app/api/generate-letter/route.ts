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

    const systemPrompt = `You are an expert Government of India official correspondence specialist with deep knowledge of the DOPT Manual of Office Procedure, all central ministries, state governments, railways, municipalities, and formal letter formats.

Your task is to generate COMPLETE professional government letters. You must DETERMINE the correct ministry, department, office, and signatory FROM THE USER'S DESCRIPTION — do not default to Department of Posts or any other preset department unless explicitly mentioned.

CRITICAL: Respond with ONLY a valid JSON object — no markdown, no code fences, no explanations.

The JSON must have exactly these fields:
{
  "h1": "Hindi Line 1 derived from the sender context (e.g., भारत सरकार or राज्य सरकार)",
  "h2": "Hindi Line 2 — the ministry/department in Hindi",
  "e1": "English Line 1 (e.g., Government of India or Government of Maharashtra)",
  "e2": "English Line 2 — the ministry/department in English",
  "dept": "Full department name derived from user description",
  "divn": "Division/Section appropriate to the context",
  "ofc": "Office or building name appropriate to the sender",
  "city": "City of the sender office",
  "pin": "PIN Code of that city/office",
  "ph": "Realistic phone number for that office",
  "em": "Official email for that office/department",
  "wb": "Official website",
  "fno": "File Number (Format: F.No.XX-XX/XXXX-XX)",
  "toD": "Recipient's Designation/Title derived from user description",
  "toA": "Recipient's Office Address (use \\n for line breaks)",
  "sub": "Subject Line — concise, professional, relevant to the complaint/request",
  "ref": "Reference to previous correspondence or empty string",
  "sal": "Salutation (Sir / Madam / Sir/Madam)",
  "body": "Complete letter body — 3-5 numbered paragraphs in authentic GoI style, fully addressing the user's described issue with proper formal language. Use \\n\\n for paragraph breaks.",
  "cls": "Closing phrase (Yours faithfully / Yours sincerely)",
  "sn": "Signatory Name — appropriate to the sender's role",
  "sd": "Signatory Designation — appropriate to the sender's role",
  "sp2": "Direct Phone/Extension (optional)",
  "sh": "Hindi/Regional Name of signatory (optional)",
  "sc": "Constituency/Circle (optional)",
  "enclList": ["Relevant enclosure 1", "Relevant enclosure 2"] or [],
  "copyList": ["Relevant copy recipient 1", "Relevant copy recipient 2", "Relevant copy recipient 3"] or []
}

EXAMPLES of correctly determining sender from description:
- "Station Master at Majalgaon Railway Station" → Ministry of Railways, Railway Station Master's Office
- "Citizen complaint to Prime Minister about cleanliness" → Citizen letter, no GoI header, addressed to PM
- "MP writing to municipal corporation" → Lok Sabha letterhead for the MP
- "Collector writing to state government" → District Collectorate letterhead
- "Nagar Palika Commissioner" → Municipal Corporation / Nagar Parishad letterhead

AUTHENTIC GoI LETTER PHRASES:
- "I am directed to forward herewith..."
- "It is requested that..."
- "Necessary action may be taken accordingly."
- "This issues with the approval of the competent authority."
- "In this connection, it is intimated that..."
- "Please refer to the office order dated..."

FILE NUMBER FORMAT: F.No.[Section]/[Year]-[Abbreviation]

CRITICAL RULES:
- NEVER default to Department of Posts / India Post unless the user explicitly asks for it
- ALWAYS derive ministry, department, office from the user's description
- Fill EVERY field with appropriate, realistic, professional content
- Body must be complete with 3-4 numbered paragraphs
- copyList: 3-4 realistic recipients relevant to the subject matter
- enclList: 1-2 relevant enclosures if applicable

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

    const isFull = !currentContext.department && !currentContext.office;

    const userPrompt = `Generate a complete ${letterTypeMap[letterType as keyof typeof letterTypeMap] || 'Government Letter'}.

User Description: "${description}"

${isFull
  ? `FULLY AI MODE: Determine ALL fields — ministry, department, office, signatory, city, contacts — 100% from the user description above.
DO NOT use Department of Posts, India Post, or any default preset unless explicitly mentioned.
The sender identity must logically match who the user says they are.`
  : `Current Sender Context:
- Department: ${currentContext.department}
- Office: ${currentContext.office}
- City: ${currentContext.city}`
}
- Language: ${langNote}

IMPORTANT RULES:
1. Derive the sender's ministry/department/office from WHO the user says they are
2. The recipient (toD, toA) must match WHO the user is writing TO
3. Body must address the ACTUAL issue described — do not write a generic salary/circular letter
4. copyList must include offices/persons logically relevant to this specific matter
5. All fields must be filled with realistic, accurate content

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
