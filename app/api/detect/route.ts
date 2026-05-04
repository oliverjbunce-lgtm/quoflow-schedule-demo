import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';

const HF_BASE_URL = 'https://oliverbunce-id-plan-analyser-api.hf.space';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { tmpFileId, selectedPage } = await req.json();

    if (!tmpFileId) {
      return NextResponse.json({ error: 'No file ID' }, { status: 400 });
    }

    // Read PDF from /tmp
    let fileBytes: Buffer;
    try {
      fileBytes = readFileSync(`/tmp/${tmpFileId}.pdf`);
    } catch {
      return NextResponse.json({ error: 'PDF not found — please re-upload' }, { status: 404 });
    }

    // Fresh upload to HF Space
    const uploadForm = new FormData();
    uploadForm.append('file', new Blob([fileBytes.buffer as ArrayBuffer], { type: 'application/pdf' }), 'plan.pdf');

    const uploadRes = await fetch(`${HF_BASE_URL}/upload`, {
      method: 'POST',
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      return NextResponse.json({ error: 'HF upload failed' }, { status: 500 });
    }

    const uploadData = await uploadRes.json();
    const sessionId: string = uploadData.session_id;
    const suggestedPage: number = uploadData.suggested_page ?? 1;

    // Use the user-selected page, fall back to HF suggested
    const pageToAnalyse = selectedPage || suggestedPage;

    // Analyse the selected page
    const analyseForm = new FormData();
    analyseForm.append('session_id', sessionId);
    analyseForm.append('page', String(pageToAnalyse));

    const analyseRes = await fetch(`${HF_BASE_URL}/analyse-stored`, {
      method: 'POST',
      body: analyseForm,
    });

    if (!analyseRes.ok) {
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }

    const result = await analyseRes.json();

    // Normalise relative annotated image URL
    if (result.annotated_image_url?.startsWith('/')) {
      result.annotated_image_url = `${HF_BASE_URL}${result.annotated_image_url}`;
    }

    return NextResponse.json({
      count: result.count ?? 0,
      annotated_image_url: result.annotated_image_url ?? null,
      page: pageToAnalyse,
    });
  } catch (err) {
    console.error('Detect error:', err);
    return NextResponse.json({ error: 'Detection failed' }, { status: 500 });
  }
}
