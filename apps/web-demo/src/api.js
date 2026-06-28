// Talks to the orchestrator. In dev, '/api' is proxied to :8005 (see vite.config).
// In prod, set VITE_API_BASE to the deployed orchestrator URL.
const BASE = import.meta.env.VITE_API_BASE || '/api';
const USER_ID = 'CUST_001';

// The backend currently embeds ₹ with a mis-encoded glyph; normalize for display.
export function fixMojibake(s) {
  return (s || '').replace(/â‚¹/g, '₹').replace(/â‚¹/g, '₹');
}

export async function createConversation() {
  const res = await fetch(`${BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': USER_ID },
    body: JSON.stringify({ channel: 'text' }),
  });
  if (!res.ok) throw new Error(`createConversation ${res.status}`);
  return res.json();
}

export async function sendMessage(conversationId, text) {
  // Client-side timeout so the UI never hangs if the backend stalls.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);
  try {
    const res = await fetch(`${BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': USER_ID },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`sendMessage ${res.status}`);
    return res.json(); // { events: [...], response: "..." }
  } finally {
    clearTimeout(timer);
  }
}
