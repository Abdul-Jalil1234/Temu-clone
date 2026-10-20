import StatusBadge from '@/components/admin/StatusBadge';
import prisma from '@/lib/prisma';
import { adminClient, AdminOrder } from '@/lib/sanity-admin';
import Link from 'next/link';
import React from 'react';

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className='rounded-xl border bg-white p-4'>
        <div className='text-xs uppercase tracking-wide text-gray-500'>{label}</div>
        <div className='mt-1 text-2xl font-extrabold'>{value}</div>
    </div>
);

const AdminOverview = async () => {
    const [orders, productCount, userCount] = await Promise.all([
        adminClient.fetch<AdminOrder[]>(
            `*[_type == "order"] | order(orderDate desc){_id, orderNumber, orderDate, customerName, customerEmail, totalPrice, status}`
        ),
        adminClient.fetch<number>(`count(*[_type == "product"])`),
        prisma.user.count(),
    ]);

    const counted = orders.filter((o) => o.status !== 'CANCELLED');
    const revenue = counted.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const byStatus = (s: string) => orders.filter((o) => o.status === s).length;

    return (
        <div className='space-y-6'>
            <h1 className='text-2xl font-extrabold'>Overview</h1>

            <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
                <Stat label='Revenue (excl. cancelled)' value={`$${revenue.toFixed(2)}`} />
                <Stat label='Orders' value={orders.length} />
                <Stat label='Products' value={productCount} />
                <Stat label='Customers' value={userCount} />
            </div>

            <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
                <Stat label='Processing' value={byStatus('PROCESSING')} />
                <Stat label='Shipped' value={byStatus('SHIPPED')} />
                <Stat label='Delivered' value={byStatus('DELIVERED')} />
                <Stat label='Cancelled' value={byStatus('CANCELLED')} />
            </div>

            <div className='rounded-xl border bg-white'>
                <div className='flex items-center justify-between border-b p-4'>
                    <h2 className='font-bold'>Recent orders</h2>
                    <Link href='/admin/orders' className='text-sm text-red-600 hover:underline'>View all</Link>
                </div>
                <ul className='divide-y'>
                    {orders.slice(0, 8).map((o) => (
                        <li key={o._id}>
                            <Link href={`/admin/orders/${o._id}`} className='flex items-center justify-between gap-3 p-4 hover:bg-gray-50'>
                                <div className='min-w-0'>
                                    <div className='font-medium'>#{o.orderNumber}</div>
                                    <div className='truncate text-xs text-gray-500'>{o.customerName || o.customerEmail}</div>
                                </div>
                                <StatusBadge status={o.status} />
                                <div className='font-semibold'>${(o.totalPrice || 0).toFixed(2)}</div>
                            </Link>
                        </li>
                    ))}
                    {!orders.length && <li className='p-6 text-center text-sm text-gray-500'>No orders yet.</li>}
                </ul>
            </div>
        </div>
    );
};

export default AdminOverview;
