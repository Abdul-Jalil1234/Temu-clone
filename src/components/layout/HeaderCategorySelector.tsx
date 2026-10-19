import { getAllCategories } from '@/sanity/lib/client';
import Link from 'next/link';
import React from 'react';

/** Horizontal, scrollable category navigation bar shown under the main header. */
const HeaderCategorySelector = async () => {
    const categories = await getAllCategories();

    const linkClass =
        'shrink-0 px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-700 hover:text-red-600 border-b-2 border-transparent hover:border-red-500 transition-colors';

    return (
        <nav aria-label='Product categories' className='w-full bg-white border-b border-gray-100'>
            <div className='container mx-auto px-4'>
                <ul className='flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                    <li><Link href='/' className={linkClass}>🏠 All</Link></li>
                    <li><Link href='/#flash-deals' className={`${linkClass} !text-red-600 font-bold`}>⚡ Flash Deals</Link></li>
                    {categories.map((category) => (
                        <li key={category._id}>
                            <Link href={`/category/${category.slug?.current}`} className={linkClass} prefetch>
                                {category.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default HeaderCategorySelector;
