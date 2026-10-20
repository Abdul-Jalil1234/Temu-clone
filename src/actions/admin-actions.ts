'use server';

import { assertAdmin } from '@/lib/admin';
import { adminClient, ORDER_STATUSES } from '@/lib/sanity-admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const statusSchema = z.object({
    id: z.string().min(1),
    status: z.enum(ORDER_STATUSES),
});

export const updateOrderStatus = async (formData: FormData) => {
    await assertAdmin();
    const parsed = statusSchema.safeParse({ id: formData.get('id'), status: formData.get('status') });
    if (!parsed.success) throw new Error('Invalid input');

    await adminClient.patch(parsed.data.id).set({ status: parsed.data.status }).commit();
    revalidatePath('/admin', 'layout');
};

const priceSchema = z.object({
    id: z.string().min(1),
    price: z.coerce.number().min(0).max(1_000_000),
});

export const updateProductPrice = async (formData: FormData) => {
    await assertAdmin();
    const parsed = priceSchema.safeParse({ id: formData.get('id'), price: formData.get('price') });
    if (!parsed.success) throw new Error('Invalid price');

    await adminClient.patch(parsed.data.id).set({ price: parsed.data.price }).commit();
    revalidatePath('/admin/products');
    revalidatePath('/');
};

export const deleteProduct = async (formData: FormData) => {
    await assertAdmin();
    const id = z.string().min(1).parse(formData.get('id'));

    try {
        await adminClient.delete(id);
    } catch {
        // Sanity refuses to delete documents that other documents (e.g. orders) still reference
        redirect('/admin/products?error=in-use');
    }
    revalidatePath('/admin/products');
    revalidatePath('/');
    redirect('/admin/products');
};
