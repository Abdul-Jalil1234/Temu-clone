import 'server-only';
import { getCurrentSession } from '@/actions/auth';
import { notFound, redirect } from 'next/navigation';

/** Admins are the emails listed (comma separated) in the ADMIN_EMAILS env var. */
const adminEmails = (): string[] =>
    (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

export const isAdminEmail = (email?: string | null): boolean =>
    !!email && adminEmails().includes(email.toLowerCase());

/** For admin pages: sends guests to sign-in and hides the page (404) from non-admins. */
export const requireAdmin = async () => {
    const { user } = await getCurrentSession();
    if (!user) redirect('/auth/sign-in');
    if (!isAdminEmail(user.email)) notFound();
    return user;
};

/** For server actions: throws unless the caller is a signed-in admin. Always call first. */
export const assertAdmin = async () => {
    const { user } = await getCurrentSession();
    if (!user || !isAdminEmail(user.email)) {
        throw new Error('Unauthorized');
    }
    return user;
};
