import { updateOrderStatus } from '@/actions/admin-actions';
import { ORDER_STATUSES } from '@/lib/sanity-admin';
import React from 'react';

const OrderStatusForm = ({ id, status }: { id: string; status?: string }) => (
    <form action={updateOrderStatus} className='flex items-center gap-2'>
        <input type='hidden' name='id' value={id} />
        <select name='status' defaultValue={status} className='rounded border bg-white px-2 py-1 text-sm'>
            {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
            ))}
        </select>
        <button className='rounded bg-black px-3 py-1 text-sm font-medium text-white hover:bg-gray-800'>Save</button>
    </form>
);

export default OrderStatusForm;
