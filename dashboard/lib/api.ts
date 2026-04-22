const API_BASE = 'http://127.0.0.1:3001';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/v1/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function chat(message: string, sessionId: string, provider: string = 'openai') {
  const res = await fetch(`${API_BASE}/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, provider }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to send message');
  }
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.ok;
}
