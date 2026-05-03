import { NextRequest, NextResponse } from 'next/server';
import type { DoorRow } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are an expert at reading New Zealand residential construction floor plans and door schedules.
Extract the door schedule table from this floor plan page. 
Return ONLY a valid JSON array. Each element should represent one door row with these fields:
{
  "mark": "string (door number/ID e.g. D1, 1, A)",
  "location": "string (room or area, e.g. Bedroom 1, Hallway — extract from schedule if present, otherwise empty string)",
  "width": "string (width in mm, numbers only, e.g. 810)",
  "height": "string (height in mm, numbers only, e.g. 2040)",
  "thickness": "string (thickness in mm, e.g. 40)",
  "hanging": "string (LH, RH, Slider, or Bi-Fold)",
  "frameType": "string (Standard, Cavity, Bifold, Wardrobe, or Custom)",
  "doorFinish": "string (Primed, White, RAW, or Custom)",
  "doorCore": "string (Poly, Solid, or Honeycomb)",
  "softClose": boolean,
  "hardwareCode": "string (hardware code if present, else empty)",
  "notes": "string (any additional notes)"
}
If no door schedule table is found on this page, return an empty array [].
Do not include any text outside the JSON array.`;

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

async function extractPageDoors(base64Image: string): Promise<DoorRow[]> {
  const body = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inline_data: {
              mime_type: 'image/png',
              data: base64Image,
            },
          },
        ],
      },
    ],
  };

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
  const cleaned = stripCodeFences(rawText);

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.error('Failed to parse Gemini response:', cleaned);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const { pages } = await req.json() as { pages: string[] };

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: 'No pages provided' }, { status: 400 });
    }

    // Process all pages in parallel
    const results = await Promise.all(pages.map(extractPageDoors));

    // Merge and deduplicate by mark
    const allDoors: DoorRow[] = results.flat();
    const seen = new Set<string>();
    const deduplicated = allDoors.filter((door) => {
      const key = door.mark?.toLowerCase()?.trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ doors: deduplicated });
  } catch (err) {
    console.error('Extract route error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
