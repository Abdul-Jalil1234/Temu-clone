import { NextRequest, NextResponse } from 'next/server';

// Server-side proxy to the FastBot public chat API, so the API key never reaches the browser.
// Docs: POST {base}/api/public/chat  with header X-BOT-API-KEY and JSON { message, chatId? }
export const runtime = 'nodejs';

const BASE = process.env.FASTBOT_API_URL || 'https://app.fastbots.ai';

const pickReply = (data: unknown): string | null => {
    if (typeof data === 'string') return data;
    if (!data || typeof data !== 'object') return null;
    const d = data as Record<string, unknown>;
    for (const k of ['reply', 'response', 'answer', 'message', 'text', 'content', 'output']) {
        const v = d[k];
        if (typeof v === 'string' && v) return v;
        if (v && typeof v === 'object') {
            const nested = pickReply(v);
            if (nested) return nested;
        }
    }
    if (d.data) return pickReply(d.data);
    return null;
};

export async function POST(req: NextRequest) {
    const apiKey = process.env.FASTBOT_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Chat is not configured yet.' }, { status: 503 });
    }

    let body: { message?: unknown; chatId?: unknown };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1000) : '';
    if (!message) {
        return NextResponse.json({ error: 'Message required.' }, { status: 400 });
    }
    const chatId = typeof body.chatId === 'string' && body.chatId ? body.chatId : undefined;

    try {
        const res = await fetch(`${BASE}/api/public/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-BOT-API-KEY': apiKey },
            body: JSON.stringify({ message, ...(chatId ? { chatId } : {}) }),
            cache: 'no-store',
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
            console.error('FastBot error', res.status, data);
            return NextResponse.json({ error: 'The assistant is unavailable right now.' }, { status: 502 });
        }

        const d = (data ?? {}) as Record<string, unknown>;
        return NextResponse.json({
            reply: pickReply(data) ?? "Sorry, I couldn't understand the response.",
            chatId: typeof d.chatId === 'string' ? d.chatId : chatId ?? null,
        });
    } catch (e) {
        console.error('FastBot request failed', e);
        return NextResponse.json({ error: 'The assistant is unavailable right now.' }, { status: 502 });
    }
}
