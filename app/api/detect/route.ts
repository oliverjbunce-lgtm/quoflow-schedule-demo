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

    // Fresh upload to HF Space — use Uint8Array to avoid Buffer pool slice issues
    const uploadForm = new FormData();
    uploadForm.append('file', new Blob([new Uint8Array(fileBytes)], { type: 'application/pdf' }), 'plan.pdf');

    const uploadRes = await fetch(`${HF_BASE_URL}/upload`, {
      method: 'POST',
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return NextResponse.json({ error: `HF upload failed: ${uploadRes.status}` }, { status: 500 });
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

    // API returns: { total, detections, image_b64, page_used }
    const count: number = result.total ?? 0;
    const imageSrc: string | null = result.image_b64
      ? `data:image/jpeg;base64,${result.image_b64}`
      : null;

    return NextResponse.json({
      count,
      annotated_image_url: imageSrc,
      page: result.page_used ?? pageToAnalyse,
    });
  } catch (err) {
    console.error('Detect error:', err);
    return NextResponse.json({ error: 'Detection failed' }, { status: 500 });
  }
}
