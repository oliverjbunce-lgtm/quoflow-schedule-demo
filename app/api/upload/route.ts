import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync } from 'fs';
import { randomUUID } from 'crypto';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const HF_BASE_URL = 'https://oliverbunce-id-plan-analyser-api.hf.space';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(buffer);
    const filename = file.name;

    // Save PDF to /tmp for later re-upload at detect time (avoids HF session expiry)
    const tmpFileId = randomUUID();
    const tmpPath = `/tmp/${tmpFileId}.pdf`;
    try {
      writeFileSync(tmpPath, fileBytes);
    } catch {
      // non-fatal — detect will handle missing file gracefully
    }

    // Build multipart/related body for Gemini File API
    const boundary = 'quoflow-file-upload-boundary';
    const metadata = JSON.stringify({
      file: {
        display_name: filename,
        mime_type: 'application/pdf',
      },
    });

    const metaPart = `--${boundary}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n${metadata}\r\n`;
    const filePart = `--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`;
    const endPart = `\r\n--${boundary}--`;

    const enc = new TextEncoder();
    const metaBytes = enc.encode(metaPart);
    const filePartBytes = enc.encode(filePart);
    const endBytes = enc.encode(endPart);

    const body = new Uint8Array(
      metaBytes.length + filePartBytes.length + fileBytes.length + endBytes.length
    );
    let offset = 0;
    body.set(metaBytes, offset); offset += metaBytes.length;
    body.set(filePartBytes, offset); offset += filePartBytes.length;
    body.set(fileBytes, offset); offset += fileBytes.length;
    body.set(endBytes, offset);

    // Upload to Gemini File API and HF Space in parallel
    const geminiUpload = fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'X-Goog-Upload-Protocol': 'multipart',
        },
        body,
      }
    );

    const hfUpload = (async () => {
      try {
        const hfForm = new FormData();
        hfForm.append('file', new Blob([fileBytes], { type: 'application/pdf' }), filename);
        const hfRes = await fetch(`${HF_BASE_URL}/upload`, {
          method: 'POST',
          body: hfForm,
        });
        if (!hfRes.ok) return null;
        return await hfRes.json();
      } catch {
        return null;
      }
    })();

    const [uploadRes, hfData] = await Promise.all([geminiUpload, hfUpload]);

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Gemini File API error ${uploadRes.status}: ${errText}`);
    }

    const uploadData = await uploadRes.json();
    const fileUri: string | undefined = uploadData.file?.uri;

    if (!fileUri) {
      throw new Error('Gemini File API returned no URI');
    }

    return NextResponse.json({
      fileUri,
      filename,
      tmpFileId,
      hfSessionId: hfData?.session_id ?? null,
      hfSuggestedPage: hfData?.suggested_page ?? 1,
      hfThumbnails: (hfData?.pages ?? []).map((t: { page: number; url: string }) => ({
        page: t.page,
        url: t.url, // already a data:image/jpeg;base64,... URI — use as-is
      })),
    });
  } catch (err) {
    console.error('Upload route error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
