import React from 'react';

const colors: Record<string, string> = {
    PROCESSING: 'bg-amber-100 text-amber-800',
    SHIPPED: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
};

const StatusBadge = ({ status }: { status?: string }) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors[status || ''] || 'bg-gray-100 text-gray-700'}`}>
        {status || 'UNKNOWN'}
    </span>
);

export default StatusBadge;
