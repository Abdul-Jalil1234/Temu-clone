import prisma from '@/lib/prisma';
import { adminClient } from '@/lib/sanity-admin';
import React from 'react';

const CustomersPage = async () => {
    const [users, spend] = await Promise.all([
        prisma.user.findMany({ orderBy: { id: 'desc' }, take: 500, select: { id: true, email: true } }),
        adminClient.fetch<{ email: string; total?: number }[]>(
            `*[_type == "order" && status != "CANCELLED" && defined(customerEmail)]{ "email": customerEmail, "total": totalPrice }`
        ),
    ]);

    const byEmail = new Map<string, { orders: number; total: number }>();
    for (const o of spend) {
        const k = o.email.toLowerCase();
        const cur = byEmail.get(k) || { orders: 0, total: 0 };
        byEmail.set(k, { orders: cur.orders + 1, total: cur.total + (o.total || 0) });
    }

    return (
        <div className='space-y-4'>
            <h1 className='text-2xl font-extrabold'>Customers</h1>
            <div className='overflow-x-auto rounded-xl border bg-white'>
                <table className='w-full text-left text-sm'>
                    <thead className='border-b bg-gray-50 text-xs uppercase text-gray-500'>
                        <tr><th className='p-3'>ID</th><th className='p-3'>Email</th><th className='p-3'>Orders</th><th className='p-3'>Total spent</th></tr>
                    </thead>
                    <tbody className='divide-y'>
                        {users.map((u) => {
                            const s = byEmail.get(u.email.toLowerCase());
                            return (
                                <tr key={u.id}>
                                    <td className='p-3 text-gray-500'>{u.id}</td>
                                    <td className='p-3 font-medium'>{u.email}</td>
                                    <td className='p-3'>{s?.orders ?? 0}</td>
                                    <td className='p-3'>${(s?.total ?? 0).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                        {!users.length && <tr><td colSpan={4} className='p-6 text-center text-gray-500'>No customers yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersPage;
