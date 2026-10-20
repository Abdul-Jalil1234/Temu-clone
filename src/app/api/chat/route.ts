import { getCurrentSession } from '@/actions/auth';
import { adminClient } from '@/lib/sanity-admin';
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


// ---------- Order status lookups (answered directly from our own data; never sent to FastBot) ----------
const ORDER_INTENT = /\b(order|orders|package|parcel|shipment|tracking|track)\b/i;
const ORDER_CONTEXT = /\b(my|status|track|tracking|where|ship|shipped|shipping|deliver|delivered|delivery|arrive|arrived|when|cancel|cancelled|late|#)\b|\b[A-Za-z0-9]{8}\b/i;

const STATUS_TEXT: Record<string, string> = {
    PROCESSING: 'is being processed and will ship soon',
    SHIPPED: 'has shipped and is on its way',
    DELIVERED: 'has been delivered',
    CANCELLED: 'was cancelled',
};

type OrderRow = {
    orderNumber?: string; orderDate?: string; status?: string; totalPrice?: number;
    items?: { title?: string; quantity?: number }[];
};

const isOrderQuestion = (m: string) => ORDER_INTENT.test(m) && ORDER_CONTEXT.test(m);

const answerOrderQuestion = async (message: string): Promise<string> => {
    const { user } = await getCurrentSession();
    if (!user) {
        return 'To check an order I need to know who you are. Please sign in at /auth/sign-in, then ask me again. 🔐';
    }

    // Only ever look up orders belonging to the signed-in user.
    const orders = await adminClient.fetch<OrderRow[]>(
        `*[_type == "order" && (customerId == $uid || lower(customerEmail) == $email)]
            | order(orderDate desc)[0...20]{
                orderNumber, orderDate, status, totalPrice,
                "items": orderItems[]{quantity, "title": product->title}
            }`,
        { uid: String(user.id), email: user.email.toLowerCase() }
    );

    if (!orders.length) {
        return "I couldn't find any orders on your account yet. If you checked out with a different email, please sign in with that one.";
    }

    const wanted = message.toUpperCase().match(/\b[A-Z0-9]{8}\b/g) || [];
    const match = orders.find((o) => o.orderNumber && wanted.includes(o.orderNumber.toUpperCase()));

    const describe = (o: OrderRow) => {
        const date = o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-GB') : 'unknown date';
        const items = (o.items || []).map((i) => `${i.quantity ?? 1}× ${i.title ?? 'item'}`).join(', ');
        return `Order #${o.orderNumber} (${date}) ${STATUS_TEXT[o.status || ''] ?? 'has an unknown status'}. Total $${(o.totalPrice || 0).toFixed(2)}${items ? ` — ${items}` : ''}.`;
    };

    if (match) return describe(match);

    const recent = orders.slice(0, 3);
    return `Here ${recent.length === 1 ? 'is your order' : `are your ${recent.length} most recent orders`}:\n\n${recent.map(describe).join('\n\n')}\n\nTell me an order number if you'd like details on a specific one.`;
};

export async function POST(req: NextRequest) {
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

    // Order-status questions are answered from our own database, not by FastBot.
    if (isOrderQuestion(message)) {
        try {
            return NextResponse.json({ reply: await answerOrderQuestion(message), chatId: chatId ?? null });
        } catch (e) {
            console.error('Order lookup failed', e);
            return NextResponse.json({ reply: "Sorry, I couldn't look up your orders right now. Please try again in a moment.", chatId: chatId ?? null });
        }
    }

    const apiKey = process.env.FASTBOT_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Chat is not configured yet.' }, { status: 503 });
    }

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
