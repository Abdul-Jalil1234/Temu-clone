import 'server-only';
import { createClient } from 'next-sanity';

/** Server-only Sanity client with write access (uses SANITY_API_WRITE_TOKEN). Never import in client components. */
export const adminClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-12-06',
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
});

export const ORDER_STATUSES = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type AdminOrder = {
    _id: string;
    orderNumber?: string;
    orderDate?: string;
    customerName?: string;
    customerEmail?: string;
    customerId?: string;
    totalPrice?: number;
    status?: OrderStatus;
    stripePaymentIntentId?: string;
    shippingAddress?: {
        name?: string; line1?: string; line2?: string; city?: string;
        state?: string; postalCode?: string; country?: string;
    };
    orderItems?: { _key: string; quantity?: number; price?: number; title?: string }[];
};
