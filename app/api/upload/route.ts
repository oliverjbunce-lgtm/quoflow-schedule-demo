import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

    // Build multipart/related body for Gemini File API
    const boundary = 'quoflow-file-upload-boundary';
    const metadata = JSON.stringify({
      file: {
        display_name: file.name,
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

    const uploadRes = await fetch(
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

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Gemini File API error ${uploadRes.status}: ${errText}`);
    }

    const uploadData = await uploadRes.json();
    const fileUri: string | undefined = uploadData.file?.uri;

    if (!fileUri) {
      throw new Error('Gemini File API returned no URI');
    }

    return NextResponse.json({ fileUri, filename: file.name });
  } catch (err) {
    console.error('Upload route error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
