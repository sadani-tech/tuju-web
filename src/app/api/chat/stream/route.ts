/**
 * SSE Proxy Route — streams AI chat responses from FastAPI to the browser.
 * This thin proxy handles auth token attachment and CORS for streaming.
 */
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = req.headers.get("authorization");

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/stream`;

  const backendRes = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!backendRes.ok) {
    return new Response(JSON.stringify({ error: "Chat service error" }), {
      status: backendRes.status,
    });
  }

  // Pass through the SSE stream directly
  return new Response(backendRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
