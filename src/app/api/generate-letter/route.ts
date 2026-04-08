import { NextRequest, NextResponse } from 'next/server';

interface GroqMessage {
  role: 'user' | 'system';
  content: string;
}

interface LetterGenerationRequest {
  description: string;
  template?: string;
  tone?: string;
}

interface GeneratedLetter {
  company_name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  recipient_name: string;
  recipient_designation: string;
  recipient_address: string;
  subject: string;
  letter_body: string;
  closing: string;
  signatory_name: string;
  signatory_designation: string;
  footer_text: string;
  template_type: string;
}

async function callGroqAPI(messages: GroqMessage[], maxTokens: number = 2000): Promise<string> {
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
        model: 'mixtral-8x7b-32768',
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', response.status, errorText);

      // Try to parse error response
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
  try {
    const body = (await request.json()) as LetterGenerationRequest;
    const { description, template = 'professional', tone = 'formal' } = body;

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert letter writing AI that generates professional, government, and formal correspondence.

When given a description of a letter, you must respond with ONLY a valid JSON object (no markdown, no explanation).

The JSON must have exactly these fields:
{
  "company_name": "Name of the organization/authority",
  "address": "Official address",
  "phone": "Contact phone",
  "email": "Contact email",
  "website": "Website URL",
  "recipient_name": "Recipient's full name",
  "recipient_designation": "Recipient's designation/title",
  "recipient_address": "Recipient's office address",
  "subject": "Clear subject line (max 100 chars)",
  "letter_body": "Complete letter body with proper formatting and paragraphs. Start with salutation like 'Dear Sir/Madam,\\n\\n' and end with 'Yours faithfully,'",
  "closing": "Closing phrase (e.g., 'Yours faithfully')",
  "signatory_name": "Name of person signing",
  "signatory_designation": "Designation of signatory",
  "footer_text": "Footer information",
  "template_type": "${template}"
}

Guidelines:
- Make letters professional, authentic, and well-structured
- Use proper business letter formatting
- Include all necessary details inferred from the description
- Tone should be ${tone}
- If it's a government-related letter, use appropriate government terminology
- Body should have 2-4 paragraphs with proper spacing
- Always include appropriate greeting and closing

RESPOND WITH ONLY THE JSON OBJECT.`;

    const userMessage = `Generate a complete letter based on this description:

"${description}"

Template type: ${template}
Tone: ${tone}

Create all necessary fields to make a complete, professional letter.`;

    const response = await callGroqAPI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      2500
    );

    // Clean response - remove markdown code fences if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/i, '').replace(/```\s*$/, '');
    }

    const letterData: GeneratedLetter = JSON.parse(cleanedResponse.trim());

    return NextResponse.json({
      success: true,
      data: letterData,
    });
  } catch (error) {
    console.error('Letter generation error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate letter' },
      { status: 500 }
    );
  }
}
