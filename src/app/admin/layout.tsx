import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import React from 'react';

export const metadata = { title: 'Admin — DEAL', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const links = [
    { href: '/admin', label: '📊 Overview' },
    { href: '/admin/orders', label: '📦 Orders' },
    { href: '/admin/products', label: '🛍️ Products' },
    { href: '/admin/customers', label: '👥 Customers' },
    { href: '/studio', label: '✏️ Content Studio' },
];

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
    const user = await requireAdmin();

    return (
        <div className='container mx-auto flex flex-col gap-6 px-4 py-6 md:flex-row'>
            <aside className='md:w-56 shrink-0'>
                <div className='mb-3 text-xs text-gray-500'>Signed in as<br /><span className='font-medium text-gray-800'>{user.email}</span></div>
                <nav className='flex gap-2 overflow-x-auto md:flex-col'>
                    {links.map((l) => (
                        <Link key={l.href} href={l.href} className='whitespace-nowrap rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50'>
                            {l.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className='min-w-0 flex-1'>{children}</main>
        </div>
    );
};

export default AdminLayout;
