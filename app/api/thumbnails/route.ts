import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';

const HF_BASE_URL = 'https://oliverbunce-id-plan-analyser-api.hf.space';

export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tmpFileId = searchParams.get('tmpFileId');

    if (!tmpFileId) {
      return NextResponse.json({ error: 'No file ID' }, { status: 400 });
    }

    let fileBytes: Buffer;
    try {
      fileBytes = readFileSync(`/tmp/${tmpFileId}.pdf`);
    } catch {
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    const uploadForm = new FormData();
    uploadForm.append('file', new Blob([new Uint8Array(fileBytes)], { type: 'application/pdf' }), 'plan.pdf');

    const uploadRes = await fetch(`${HF_BASE_URL}/upload`, {
      method: 'POST',
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      return NextResponse.json({ error: 'HF upload failed' }, { status: 500 });
    }

    const data = await uploadRes.json();

    return NextResponse.json({
      suggestedPage: data.suggested_page ?? 1,
      totalPages: data.total_pages ?? 0,
      // Slice to first 20 pages to keep payload manageable
      pages: (data.pages ?? []).slice(0, 20).map((p: { page: number; url: string }) => ({
        page: p.page,
        url: p.url,
      })),
    });
  } catch (err) {
    console.error('Thumbnails error:', err);
    return NextResponse.json({ error: 'Failed to load thumbnails' }, { status: 500 });
  }
}
