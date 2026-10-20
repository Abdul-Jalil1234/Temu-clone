import OrderStatusForm from '@/components/admin/OrderStatusForm';
import StatusBadge from '@/components/admin/StatusBadge';
import { adminClient, AdminOrder } from '@/lib/sanity-admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';

const OrderDetail = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const order = await adminClient.fetch<AdminOrder | null>(
        `*[_type == "order" && _id == $id][0]{
            ..., orderItems[]{_key, quantity, price, "title": product->title}
        }`,
        { id }
    );
    if (!order) notFound();

    const a = order.shippingAddress;

    return (
        <div className='space-y-4'>
            <Link href='/admin/orders' className='text-sm text-gray-500 hover:underline'>← All orders</Link>
            <div className='flex flex-wrap items-center justify-between gap-3'>
                <h1 className='text-2xl font-extrabold'>Order #{order.orderNumber}</h1>
                <div className='flex items-center gap-3'><StatusBadge status={order.status} /><OrderStatusForm id={order._id} status={order.status} /></div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
                <div className='rounded-xl border bg-white p-4 text-sm'>
                    <h2 className='mb-2 font-bold'>Customer</h2>
                    <div>{order.customerName || '-'}</div>
                    <div className='text-gray-500'>{order.customerEmail}</div>
                    <div className='mt-2 text-gray-500'>Placed {order.orderDate ? new Date(order.orderDate).toLocaleString() : '-'}</div>
                    {order.stripePaymentIntentId && <div className='mt-1 break-all text-xs text-gray-400'>Stripe: {order.stripePaymentIntentId}</div>}
                </div>
                <div className='rounded-xl border bg-white p-4 text-sm'>
                    <h2 className='mb-2 font-bold'>Ship to</h2>
                    {a ? (
                        <address className='not-italic'>
                            {a.name}<br />{a.line1}<br />{a.line2 && <>{a.line2}<br /></>}
                            {a.city}, {a.state} {a.postalCode}<br />{a.country}
                        </address>
                    ) : '-'}
                </div>
            </div>

            <div className='overflow-x-auto rounded-xl border bg-white'>
                <table className='w-full text-left text-sm'>
                    <thead className='border-b bg-gray-50 text-xs uppercase text-gray-500'>
                        <tr><th className='p-3'>Item</th><th className='p-3'>Qty</th><th className='p-3'>Price</th></tr>
                    </thead>
                    <tbody className='divide-y'>
                        {order.orderItems?.map((i) => (
                            <tr key={i._key}>
                                <td className='p-3'>{i.title || 'Deleted product'}</td>
                                <td className='p-3'>{i.quantity}</td>
                                <td className='p-3'>{(i.price ?? 0) === 0 ? 'FREE (prize)' : `$${(i.price || 0).toFixed(2)}`}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot><tr className='border-t'><td className='p-3 font-bold' colSpan={2}>Total</td><td className='p-3 font-bold'>${(order.totalPrice || 0).toFixed(2)}</td></tr></tfoot>
                </table>
            </div>
        </div>
    );
};

export default OrderDetail;
