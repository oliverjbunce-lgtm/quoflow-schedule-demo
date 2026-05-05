export type DetectJob = {
  status: 'pending' | 'done' | 'error';
  result?: object;
  error?: string;
};

export const detectJobs = new Map<string, DetectJob>();
