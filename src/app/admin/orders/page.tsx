import OrderStatusForm from '@/components/admin/OrderStatusForm';
import StatusBadge from '@/components/admin/StatusBadge';
import { adminClient, AdminOrder, ORDER_STATUSES } from '@/lib/sanity-admin';
import Link from 'next/link';
import React from 'react';

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

const OrdersPage = async ({ searchParams }: Props) => {
    const { status, q } = await searchParams;
    const validStatus = ORDER_STATUSES.find((s) => s === status);
    const search = (q || '').trim().slice(0, 100);

    // GROQ params are passed separately — never string-interpolated.
    const orders = await adminClient.fetch<AdminOrder[]>(
        `*[_type == "order"
            && (!defined($status) || status == $status)
            && ($q == "" || orderNumber match $q || customerEmail match $q || customerName match $q)
        ] | order(orderDate desc)[0...200]{_id, orderNumber, orderDate, customerName, customerEmail, totalPrice, status}`,
        { status: validStatus ?? null, q: search ? `*${search}*` : '' }
    );

    const tab = (label: string, value?: string) => (
        <Link
            href={value ? `/admin/orders?status=${value}` : '/admin/orders'}
            className={`rounded-full border px-3 py-1 text-sm ${validStatus === value || (!validStatus && !value) ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}
        >
            {label}
        </Link>
    );

    return (
        <div className='space-y-4'>
            <h1 className='text-2xl font-extrabold'>Orders</h1>

            <div className='flex flex-wrap items-center gap-2'>
                {tab('All')}
                {ORDER_STATUSES.map((s) => <React.Fragment key={s}>{tab(s, s)}</React.Fragment>)}
                <form className='ml-auto flex gap-2'>
                    {validStatus && <input type='hidden' name='status' value={validStatus} />}
                    <input name='q' defaultValue={search} placeholder='Order #, name or email' className='rounded border px-3 py-1 text-sm' />
                    <button className='rounded border bg-white px-3 py-1 text-sm hover:bg-gray-50'>Search</button>
                </form>
            </div>

            <div className='overflow-x-auto rounded-xl border bg-white'>
                <table className='w-full text-left text-sm'>
                    <thead className='border-b bg-gray-50 text-xs uppercase text-gray-500'>
                        <tr>
                            <th className='p-3'>Order</th><th className='p-3'>Date</th><th className='p-3'>Customer</th>
                            <th className='p-3'>Total</th><th className='p-3'>Status</th><th className='p-3'>Update</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y'>
                        {orders.map((o) => (
                            <tr key={o._id}>
                                <td className='p-3 font-medium'><Link className='text-red-600 hover:underline' href={`/admin/orders/${o._id}`}>#{o.orderNumber}</Link></td>
                                <td className='p-3 whitespace-nowrap'>{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '-'}</td>
                                <td className='p-3'><div>{o.customerName || '-'}</div><div className='text-xs text-gray-500'>{o.customerEmail}</div></td>
                                <td className='p-3 font-semibold'>${(o.totalPrice || 0).toFixed(2)}</td>
                                <td className='p-3'><StatusBadge status={o.status} /></td>
                                <td className='p-3'><OrderStatusForm id={o._id} status={o.status} /></td>
                            </tr>
                        ))}
                        {!orders.length && <tr><td colSpan={6} className='p-6 text-center text-gray-500'>No orders found.</td></tr>}
                    </tbody>
                </table>
            </div>
            <p className='text-xs text-gray-400'>Showing the latest 200 matching orders.</p>
        </div>
    );
};

export default OrdersPage;
