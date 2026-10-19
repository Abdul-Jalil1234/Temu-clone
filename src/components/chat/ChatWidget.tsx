'use client';

import { MessageCircle, Send, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'bot'; text: string };

const GREETING: Msg = { role: 'bot', text: "Hi! 👋 I'm your shopping assistant. Ask me about products, shipping, returns or today's deals." };

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Msg[]>([GREETING]);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        setInput('');
        setMessages((m) => [...m, { role: 'user', text }]);
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, chatId }),
            });
            const data = await res.json();
            if (data.chatId) setChatId(data.chatId);
            setMessages((m) => [...m, { role: 'bot', text: data.reply ?? data.error ?? 'Something went wrong.' }]);
        } catch {
            setMessages((m) => [...m, { role: 'bot', text: 'Connection problem. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {open && (
                <div className='fixed bottom-24 right-4 z-50 flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl'>
                    <div className='flex items-center justify-between bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3 text-white'>
                        <div className='font-bold'>🤖 Shopping Assistant</div>
                        <button onClick={() => setOpen(false)} aria-label='Close chat'><X className='h-5 w-5' /></button>
                    </div>

                    <div className='flex-1 space-y-2 overflow-y-auto bg-gray-50 p-3'>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-red-600 text-white' : 'bg-white border text-gray-800'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && <div className='text-xs text-gray-400 animate-pulse'>Assistant is typing…</div>}
                        <div ref={endRef} />
                    </div>

                    <form onSubmit={send} className='flex gap-2 border-t bg-white p-2'>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder='Type your question…'
                            maxLength={1000}
                            className='flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:border-red-500'
                        />
                        <button type='submit' disabled={loading || !input.trim()} className='rounded-full bg-red-600 p-2 text-white disabled:opacity-50' aria-label='Send'>
                            <Send className='h-5 w-5' />
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setOpen((o) => !o)}
                className='fixed bottom-6 right-4 z-50 rounded-full bg-gradient-to-r from-red-600 to-orange-500 p-4 text-white shadow-xl hover:scale-105 transition-transform'
                aria-label='Open chat'
            >
                <MessageCircle className='h-6 w-6' />
            </button>
        </>
    );
};

export default ChatWidget;
