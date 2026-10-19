import React from 'react';

const items = [
    { icon: '🚚', title: 'Free shipping', text: 'On orders over $15' },
    { icon: '↩️', title: 'Free returns', text: 'Within 90 days' },
    { icon: '🛡️', title: 'Secure checkout', text: 'Powered by Stripe' },
    { icon: '🎁', title: 'Daily spin & win', text: 'Win free items every day' },
];

const TrustBar = () => (
    <section className='bg-gray-50 border-b'>
        <div className='container mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-4'>
            {items.map((i) => (
                <div key={i.title} className='flex items-center gap-3'>
                    <span className='text-2xl'>{i.icon}</span>
                    <div>
                        <div className='text-sm font-bold'>{i.title}</div>
                        <div className='text-xs text-gray-500'>{i.text}</div>
                    </div>
                </div>
            ))}
        </div>
    </section>
);

export default TrustBar;
