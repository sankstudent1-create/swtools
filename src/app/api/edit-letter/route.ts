import { NextRequest, NextResponse } from 'next/server';

interface GroqMessage {
  role: 'user' | 'system';
  content: string;
}

interface EditLetterRequest {
  instruction: string;
  currentForm: Record<string, any>;
}

const GROQ_FALLBACK_MODELS = [
  'llama3-70b-8192',
  'llama3-8b-8192',
  'mixtral-8x7b-32768',
];

async function callGroqModel(
  messages: GroqMessage[],
  model: string,
  maxTokens: number,
  apiKey: string
): Promise<{ content: string; model: string }> {
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
      temperature: 0.3, // Lower temperature for more precise edits
      top_p: 0.95,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content in Groq API response');
  return { content, model };
}

async function callGroqWithFallback(
  messages: GroqMessage[],
  maxTokens: number = 3000
): Promise<{ content: string; model: string }> {
  const apiKey = process.env.GROQ_API_KEY!;
  let lastError: Error | null = null;

  for (const model of GROQ_FALLBACK_MODELS) {
    try {
      return await callGroqModel(messages, model, maxTokens, apiKey);
    } catch (err: any) {
      lastError = err;
      if (err.message.includes('429')) {
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error('All Groq models exhausted or unavailable');
}

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error: GROQ_API_KEY is not set.' },
      { status: 500 }
    );
  }

  try {
    const { instruction, currentForm } = (await request.json()) as EditLetterRequest;

    if (!instruction) {
      return NextResponse.json({ error: 'Instruction is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert editor AI helping a user edit an existing letter/document. 
The user will provide their exact current letter data in JSON format, and an instruction on what they want to change.

Your task is to follow their instruction and return a JSON object containing ONLY the keys that need to be changed, with their new updated values. 
Do not return keys that should remain exactly the same.
If the user wants to change a name, check fields like 'sn', 'toD', 'h1', etc.
If the user wants to change the tone or content, update the 'body' field.

CRITICAL: Respond with ONLY a valid JSON object. No markdown, no code fences, no explanations.`;

    const userPrompt = `CURRENT LETTER DATA (JSON):
${JSON.stringify(currentForm, null, 2)}

USER INSTRUCTION:
"${instruction}"

Return ONLY the JSON object with the modified fields based on the instruction.`;

    const result = await callGroqWithFallback([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    let cleanedResponse = result.content.trim();
    cleanedResponse = cleanedResponse
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/, '');
      
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedResponse = cleanedResponse.slice(jsonStart, jsonEnd + 1);
    }

    const modifiedFields = JSON.parse(cleanedResponse.trim());

    return NextResponse.json({
      success: true,
      data: modifiedFields,
    });

  } catch (error: any) {
    console.error('Edit letter error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to edit letter' },
      { status: 500 }
    );
  }
}
