'use client';

import { useEffect, useState } from 'react';
import { nextMidnight } from '@/lib/daily';

export type Countdown = {
    /** false until mounted on the client (avoids hydration mismatch) */
    ready: boolean;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
    /** "HH:MM:SS" */
    label: string;
};

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Live countdown. Pass a fixed end time (ms) or omit it to count down to the
 * next local midnight — and automatically roll over to the next day when it hits zero.
 */
export const useCountdown = (endsAt?: number): Countdown => {
    const [state, setState] = useState<Countdown>({
        ready: false, hours: 0, minutes: 0, seconds: 0, totalMs: 0, label: '--:--:--',
    });

    useEffect(() => {
        let target = endsAt ?? nextMidnight();

        const tick = () => {
            let diff = target - Date.now();
            if (diff <= 0) {
                if (endsAt === undefined) {
                    target = nextMidnight();
                    diff = target - Date.now();
                } else {
                    diff = 0;
                }
            }
            const total = Math.floor(diff / 1000);
            const hours = Math.floor(total / 3600);
            const minutes = Math.floor((total % 3600) / 60);
            const seconds = total % 60;
            setState({
                ready: true, hours, minutes, seconds, totalMs: diff,
                label: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
            });
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [endsAt]);

    return state;
};
