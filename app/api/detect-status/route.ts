import { NextResponse } from 'next/server';

export type DetectJob = { status: 'pending' | 'done' | 'error'; result?: object; error?: string };
export const detectJobs = new Map<string, DetectJob>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ error: 'No jobId' }, { status: 400 });
  const job = detectJobs.get(jobId);
  if (!job) return NextResponse.json({ status: 'pending' });
  return NextResponse.json(job);
}
