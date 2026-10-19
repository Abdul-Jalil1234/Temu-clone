'use client';

import { useCountdown } from '@/hooks/useCountdown';
import { Product } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const hash = (id: string) => id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

const Unit = ({ v, label }: { v: string; label: string }) => (
    <div className='flex flex-col items-center'>
        <span className='bg-black text-white font-mono font-bold text-lg rounded px-2 py-1 tabular-nums min-w-[2.5rem] text-center'>{v}</span>
        <span className='text-[10px] uppercase text-gray-500 mt-0.5'>{label}</span>
    </div>
);

const FlashDeals = ({ products }: { products: Product[] }) => {
    const { ready, hours, minutes, seconds } = useCountdown();
    const pad = (n: number) => String(n).padStart(2, '0');

    if (!products.length) return null;

    return (
        <section id='flash-deals' className='container mx-auto px-4 pt-8 scroll-mt-32'>
            <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
                <div className='flex items-center gap-3'>
                    <h2 className='text-xl sm:text-2xl font-extrabold text-red-600'>⚡ Flash Deals</h2>
                    <span className='text-sm text-gray-500 hidden sm:inline'>Ends in</span>
                </div>
                <div className='flex items-center gap-1'>
                    <Unit v={ready ? pad(hours) : '--'} label='hrs' />
                    <span className='font-bold pb-4'>:</span>
                    <Unit v={ready ? pad(minutes) : '--'} label='min' />
                    <span className='font-bold pb-4'>:</span>
                    <Unit v={ready ? pad(seconds) : '--'} label='sec' />
                </div>
            </div>

            <div className='flex gap-3 overflow-x-auto pb-3 snap-x [scrollbar-width:thin]'>
                {products.map((p) => {
                    const h = hash(p._id);
                    const discount = 40 + (h % 51); // 40–90% off
                    const claimed = 35 + (h % 60);   // 35–94% claimed
                    const price = p.price || 0;
                    return (
                        <Link
                            key={p._id}
                            href={`/product/${p._id}`}
                            className='snap-start shrink-0 w-40 sm:w-48 rounded-lg border bg-white overflow-hidden hover:shadow-lg transition-shadow'
                        >
                            <div className='relative h-36 sm:h-44'>
                                {p.image && (
                                    <Image src={urlFor(p.image).width(256).url()} alt={p.title || 'Product'} fill className='object-contain p-2' />
                                )}
                                <span className='absolute top-2 left-2 bg-red-600 text-white text-xs font-extrabold px-2 py-1 rounded'>-{discount}%</span>
                            </div>
                            <div className='p-3'>
                                <div className='text-red-600 font-extrabold text-lg'>${price.toFixed(2)}</div>
                                <div className='text-xs text-gray-400 line-through'>${(price * 5).toFixed(2)}</div>
                                <div className='mt-2 h-2 rounded-full bg-red-100 overflow-hidden'>
                                    <div className='h-full bg-gradient-to-r from-orange-500 to-red-600' style={{ width: `${claimed}%` }} />
                                </div>
                                <div className='text-[11px] text-red-600 font-semibold mt-1'>{claimed}% claimed</div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default FlashDeals;
