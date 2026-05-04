import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are an expert estimator for a New Zealand door supply company. Your job is to read a full set of residential floor plans (provided as a PDF) and extract every piece of information related to doors and door frames.

You must:
1. Find ALL doors across the entire document — check door schedule tables, floor plan legends, elevation drawings, window/door schedules, and any notes pages.
2. Extract contextual information that affects the door order: wall types, cavity slider specifications, fire ratings, acoustic requirements, weatherproofing notes.
3. Identify anything that might cause problems or needs clarification.

Return a JSON object with exactly this structure:
{
  "doors": [
    {
      "mark": "string — door mark/number e.g. D1, 1, A",
      "location": "string — room or location e.g. Bedroom 1, Hallway, Entry. Empty string if not specified.",
      "width": "string — width in mm, numbers only e.g. 810. Empty string if unknown.",
      "height": "string — height in mm, numbers only e.g. 2040. Empty string if unknown.",
      "thickness": "string — thickness in mm e.g. 40. Empty string if unknown.",
      "hanging": "string — one of: LH, RH, Slider, Bi-Fold. Use context clues from the floor plan if not explicit.",
      "frameType": "string — one of: Standard, Cavity, Bifold, Wardrobe, Custom",
      "doorFinish": "string — one of: Primed, White, RAW, Custom. Default to Primed if unspecified.",
      "doorCore": "string — one of: Poly, Solid, Honeycomb. Default to Poly if unspecified.",
      "softClose": boolean,
      "hardwareCode": "string — hardware code if present, else empty string",
      "notes": "string — any door-specific notes, special requirements, or details worth flagging"
    }
  ],
  "flags": [
    {
      "level": "string — one of: error, warning, info",
      "message": "string — clear, plain-English description of the issue or note"
    }
  ]
}

Flag level guide:
- error: Missing critical info (e.g. door size not specified anywhere, conflicting dimensions, fire door required but no spec given)
- warning: Something that needs clarification before ordering (e.g. hanging direction ambiguous, cavity slider width seems non-standard, duplicate door marks found)
- info: Useful context that affects the job (e.g. all internal doors appear to be 2040 high, external doors require weatherstripping, wall type affects frame selection)

Rules:
- Include ALL doors found. Do not skip any.
- If the same door appears in multiple places (e.g. schedule table + floor plan legend), merge into one entry — use the schedule table as primary source.
- Do not fabricate data. If a field is genuinely unknown, leave it as an empty string.
- Do not return markdown. Return only the raw JSON object.`;

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const body = await req.json() as { pdf?: string; pages?: string[] };

    let parts: object[];

    if (body.pdf) {
      // Full PDF sent as base64 — preferred path
      parts = [
        { text: SYSTEM_PROMPT },
        {
          inline_data: {
            mime_type: 'application/pdf',
            data: body.pdf,
          },
        },
      ];
    } else if (body.pages && Array.isArray(body.pages) && body.pages.length > 0) {
      // Fallback: individual page images
      parts = [
        { text: SYSTEM_PROMPT },
        ...body.pages.map((p: string) => ({
          inline_data: { mime_type: 'image/png', data: p },
        })),
      ];
    } else {
      return NextResponse.json({ error: 'No PDF or pages provided' }, { status: 400 });
    }

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error ${geminiRes.status}: ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const cleaned = stripCodeFences(rawText);

    let parsed: { doors?: object[]; flags?: object[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Gemini response:', cleaned.slice(0, 500));
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const doors = Array.isArray(parsed.doors) ? parsed.doors : [];
    const flags = Array.isArray(parsed.flags) ? parsed.flags : [];

    return NextResponse.json({ doors, flags });
  } catch (err) {
    console.error('Extract route error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
