import { deleteProduct, updateProductPrice } from '@/actions/admin-actions';
import { Product } from '@/sanity.types';
import { adminClient } from '@/lib/sanity-admin';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type P = { _id: string; title?: string; price?: number; image?: Product['image']; category?: string };

const ProductsPage = async ({ searchParams }: { searchParams: Promise<{ error?: string }> }) => {
    const { error } = await searchParams;
    const products = await adminClient.fetch<P[]>(
        `*[_type == "product"] | order(title asc){_id, title, price, image, "category": category->title}`
    );

    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
                <h1 className='text-2xl font-extrabold'>Products</h1>
                <Link href='/studio' className='rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700'>+ Add / edit in Studio</Link>
            </div>

            {error === 'in-use' && (
                <div className='rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                    That product is referenced by existing orders and can&apos;t be deleted.
                </div>
            )}

            <div className='overflow-x-auto rounded-xl border bg-white'>
                <table className='w-full text-left text-sm'>
                    <thead className='border-b bg-gray-50 text-xs uppercase text-gray-500'>
                        <tr><th className='p-3'>Product</th><th className='p-3'>Category</th><th className='p-3'>Price (USD)</th><th className='p-3'></th></tr>
                    </thead>
                    <tbody className='divide-y'>
                        {products.map((p) => (
                            <tr key={p._id}>
                                <td className='p-3'>
                                    <div className='flex items-center gap-3'>
                                        <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded border bg-gray-50'>
                                            {p.image && <Image src={urlFor(p.image).width(80).url()} alt='' fill className='object-contain' />}
                                        </div>
                                        <span className='font-medium'>{p.title}</span>
                                    </div>
                                </td>
                                <td className='p-3 text-gray-500'>{p.category || '-'}</td>
                                <td className='p-3'>
                                    <form action={updateProductPrice} className='flex items-center gap-2'>
                                        <input type='hidden' name='id' value={p._id} />
                                        <input name='price' type='number' step='0.01' min='0' defaultValue={p.price ?? 0} className='w-24 rounded border px-2 py-1' />
                                        <button className='rounded border bg-white px-2 py-1 text-xs hover:bg-gray-50'>Update</button>
                                    </form>
                                </td>
                                <td className='p-3 text-right'>
                                    <form action={deleteProduct}>
                                        <input type='hidden' name='id' value={p._id} />
                                        <button className='text-xs text-red-600 hover:underline'>Delete</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {!products.length && <tr><td colSpan={4} className='p-6 text-center text-gray-500'>No products yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsPage;
