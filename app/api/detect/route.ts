const HF_BASE_URL = 'https://oliverbunce-id-plan-analyser-api.hf.space';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { sessionId, page } = await req.json();

  if (!sessionId) {
    return Response.json({ error: 'No session ID' }, { status: 400 });
  }

  const form = new FormData();
  form.append('session_id', sessionId);
  form.append('page', String(page || 1));

  const res = await fetch(`${HF_BASE_URL}/analyse-stored`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    return Response.json({ error: 'HF Space error' }, { status: 500 });
  }

  const data = await res.json();

  // Normalise annotated_image_url — prepend HF base URL if it's a relative path
  if (data.annotated_image_url && data.annotated_image_url.startsWith('/')) {
    data.annotated_image_url = `${HF_BASE_URL}${data.annotated_image_url}`;
  }

  return Response.json(data);
}
