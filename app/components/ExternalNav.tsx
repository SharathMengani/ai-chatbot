"use client";
import Link from 'next/link'
import { Logo } from '../utils'
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

export const ExternalNav = () => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return (
        <nav className="border-b border-black/10 dark:border-white/10 py-4">
            <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    className="text-xl font-semibold"
                >
                    <Logo
                        className="w-35 md:w-50"
                        textColor={resolvedTheme === 'dark' ? '#fff' : '#000'}
                        titleColor={resolvedTheme === 'dark' ? '#dadfe3' : '#b5b5b5'}
                        eyesColor={'#fff'}
                    />
                </Link>

                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <Link href="/sign-in">
                        Sign In
                    </Link>

                    <Link href="/sign-up">
                        Sign Up
                    </Link>
                </div>
            </div>
        </nav>
    )
}
