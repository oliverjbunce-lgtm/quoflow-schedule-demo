import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { detectJobs } from '../detect-status/route';

const HF_BASE_URL = 'https://oliverbunce-id-plan-analyser-api.hf.space';
export const maxDuration = 10;

export async function POST(req: Request) {
  try {
    const { tmpFileId, selectedPage } = await req.json();
    if (!tmpFileId) return NextResponse.json({ error: 'No file ID' }, { status: 400 });

    const jobId = randomUUID();
    detectJobs.set(jobId, { status: 'pending' });

    (async () => {
      try {
        let fileBytes: Buffer;
        try { fileBytes = readFileSync(`/tmp/${tmpFileId}.pdf`); }
        catch { detectJobs.set(jobId, { status: 'error', error: 'PDF not found' }); return; }

        const uploadForm = new FormData();
        uploadForm.append('file', new Blob([new Uint8Array(fileBytes)], { type: 'application/pdf' }), 'plan.pdf');
        const uploadRes = await fetch(`${HF_BASE_URL}/upload`, { method: 'POST', body: uploadForm });
        if (!uploadRes.ok) { detectJobs.set(jobId, { status: 'error', error: 'HF upload failed' }); return; }

        const uploadData = await uploadRes.json();
        const sessionId: string = uploadData.session_id;
        const suggestedPage: number = uploadData.suggested_page ?? 1;
        const pageToAnalyse = selectedPage || suggestedPage;

        const analyseForm = new FormData();
        analyseForm.append('session_id', sessionId);
        analyseForm.append('page', String(pageToAnalyse));
        const analyseRes = await fetch(`${HF_BASE_URL}/analyse-stored`, { method: 'POST', body: analyseForm });
        if (!analyseRes.ok) { detectJobs.set(jobId, { status: 'error', error: 'Analysis failed' }); return; }

        const result = await analyseRes.json();
        detectJobs.set(jobId, {
          status: 'done',
          result: {
            count: result.total ?? 0,
            annotated_image_url: result.image_b64 ? `data:image/jpeg;base64,${result.image_b64}` : null,
            page: result.page_used ?? pageToAnalyse,
          }
        });
      } catch (err) {
        detectJobs.set(jobId, { status: 'error', error: String(err) });
      }
    })();

    return NextResponse.json({ jobId });
  } catch {
    return NextResponse.json({ error: 'Failed to start detection' }, { status: 500 });
  }
}
