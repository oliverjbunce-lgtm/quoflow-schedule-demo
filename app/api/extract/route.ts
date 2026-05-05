import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are an expert estimator for a New Zealand door supply company. Your job is to read a full set of residential floor plans (provided as a PDF) and extract every piece of information related to doors, door frames, and wall specifications.

You must:
1. Find ALL doors across the entire document — check door schedule tables, floor plan legends, elevation drawings, window/door schedules, and any notes pages.
2. Extract contextual information that affects the door order: wall types, cavity slider specifications, fire ratings, acoustic requirements, weatherproofing notes.
3. Extract all wall type specifications from the document.
4. Identify anything that might cause problems or needs clarification.

Return a JSON object with exactly this structure:
{
  "doors": [
    {
      "mark": "string — door mark/number e.g. D1, 1, A",
      "location": "string — room or location e.g. Bedroom 1, Hallway, Entry. Empty string if not specified.",
      "roomContext": "string — Identify the room or space the door opens into based on room labels visible in the floor plan or schedule (e.g. Bedroom 1, Ensuite, Garage, Living/Dining). Use room labels from the floor plan. Empty string if not determinable.",
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
  "walls": [
    {
      "wallType": "string — wall type identifier e.g. Type A, W1, External, Internal",
      "description": "string — full description e.g. 90mm timber stud, plasterboard both sides",
      "thickness": "string — wall thickness e.g. 90mm. Empty string if unknown.",
      "framingType": "string — framing material e.g. Timber stud, Steel stud, Concrete block, Brick. Empty string if unknown.",
      "cavitySuitable": boolean,
      "notes": "string — any relevant notes about this wall type"
    }
  ],
  "flags": [
    {
      "level": "string — one of: error, warning, info",
      "message": "string — clear, plain-English description of the issue or note"
    }
  ]
}

Wall specification rules:
- Extract all wall types/specifications mentioned in this document (wall schedules, legend, notes, or drawn details).
- For each wall type, determine if it is suitable for a cavity sliding door system: cavitySuitable should be true for timber stud or steel stud walls typically 90mm or thicker; false for concrete, brick, masonry, or walls under 70mm.
- If no wall specifications are found anywhere in the document, return an empty array for "walls".

Flag level guide:
- error: Missing critical info (e.g. door size not specified anywhere, conflicting dimensions, fire door required but no spec given)
- warning: Something that needs clarification before ordering (e.g. hanging direction ambiguous, cavity slider width seems non-standard, duplicate door marks found)
- info: Useful context that affects the job (e.g. all internal doors appear to be 2040 high, external doors require weatherstripping, wall type affects frame selection)

Rules:
- Include ALL doors found. Do not skip any.
- If the same door appears in multiple places (e.g. schedule table + floor plan legend), merge into one entry — use the schedule table as primary source.
- Do not fabricate data. If a field is genuinely unknown, leave it as an empty string.
- Do not return markdown. Return only the raw JSON object.`;

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);
    if (res.ok || (res.status !== 429 && res.status !== 503)) return res;
    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  throw new Error('Gemini API unavailable after retries');
}

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

    const body = await req.json() as { fileUri?: string; pdf?: string; pages?: string[] };

    let parts: object[];

    if (body.fileUri) {
      // Preferred path: Gemini File API URI (handles large PDFs)
      parts = [
        { text: SYSTEM_PROMPT },
        {
          file_data: {
            mime_type: 'application/pdf',
            file_uri: body.fileUri,
          },
        },
      ];
    } else if (body.pdf) {
      // Legacy fallback: inline base64
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
      // Legacy fallback: individual page images
      parts = [
        { text: SYSTEM_PROMPT },
        ...body.pages.map((p: string) => ({
          inline_data: { mime_type: 'image/png', data: p },
        })),
      ];
    } else {
      return NextResponse.json({ error: 'No file URI, PDF, or pages provided' }, { status: 400 });
    }

    const geminiRes = await fetchWithRetry(GEMINI_URL, {
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

    let parsed: { doors?: object[]; walls?: object[]; flags?: object[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Gemini response:', cleaned.slice(0, 500));
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const doors = Array.isArray(parsed.doors) ? parsed.doors : [];
    const walls = Array.isArray(parsed.walls) ? parsed.walls : [];
    const flags = Array.isArray(parsed.flags) ? parsed.flags : [];

    return NextResponse.json({ doors, walls, flags });
  } catch (err) {
    console.error('Extract route error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
