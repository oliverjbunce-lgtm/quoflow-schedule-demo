import { NextResponse } from 'next/server';

const HF_BASE_URL = 'https://oliverbunce-id-plan-analyser-api.hf.space';

export const maxDuration = 60;

async function analyseStoredPage(sessionId: string, page: number): Promise<{ count: number; annotated_image_url?: string; page: number } | null> {
  try {
    const form = new FormData();
    form.append('session_id', sessionId);
    form.append('page', String(page));

    const res = await fetch(`${HF_BASE_URL}/analyse-stored`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) return null;
    const data = await res.json();

    // Normalise relative URLs
    if (data.annotated_image_url?.startsWith('/')) {
      data.annotated_image_url = `${HF_BASE_URL}${data.annotated_image_url}`;
    }

    return { count: data.count ?? 0, annotated_image_url: data.annotated_image_url, page };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { sessionId, suggestedPage } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID' }, { status: 400 });
    }

    // Try the selected page + 1 page on either side as safety
    const pagesToTry = [...new Set([
      suggestedPage,
      Math.max(1, suggestedPage - 1),
      suggestedPage + 1,
    ])].filter(p => p >= 1);

    const results = await Promise.all(pagesToTry.map(p => analyseStoredPage(sessionId, p)));

    const validResults = results.filter(Boolean) as { count: number; annotated_image_url?: string; page: number }[];

    if (validResults.length === 0) {
      return NextResponse.json({ error: 'No results from vision model' }, { status: 500 });
    }

    // Return the page with the highest door count
    const best = validResults.reduce((a, b) => (b.count > a.count ? b : a));

    return NextResponse.json({
      count: best.count,
      annotated_image_url: best.annotated_image_url,
      page: best.page,
      // Include breakdown for debugging
      allPages: validResults,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Detection failed' }, { status: 500 });
  }
}
