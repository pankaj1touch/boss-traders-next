'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, BarChart2, Globe, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useGetTickersQuery } from '@/store/api/tickerApi';

const ICONS: Record<string, any> = {
    TrendingUp,
    DollarSign,
    BarChart2,
    Globe,
    ArrowUpRight,
    ShieldCheck,
};

export function ContinuousBanner() {
    const { data: tickers, isLoading } = useGetTickersQuery({});

    if (isLoading || !tickers?.data || tickers.data.length === 0) return null;

    const tickerItems = tickers.data;

    const getIcon = (iconName: string) => {
        const IconComponent = ICONS[iconName] || TrendingUp;
        return <IconComponent className="h-4 w-4" />;
    };

    return (
        <div className="relative overflow-hidden bg-gray-950 border-b border-gray-800 py-3">
            {/* Glossy Overlay/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-blue-900/10 pointer-events-none z-10" />

            {/* Marquee Container */}
            <div className="flex">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop",
                    }}
                    className="flex gap-12 whitespace-nowrap px-4"
                >
                    {/* Duplicate items for seamless loop */}
                    {[...tickerItems, ...tickerItems].map((item: any, index: number) => (
                        <div
                            key={`${item._id}-${index}`}
                            className="flex items-center gap-3 text-sm font-medium text-gray-300"
                        >
                            <div className="flex items-center justify-center p-1.5 rounded-full bg-gray-900 border border-gray-800 text-brand-gold">
                                {getIcon(item.icon)}
                            </div>

                            <span className="text-gray-200">{item.text}</span>

                            {item.change && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${item.isPositive
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    {item.change}
                                </span>
                            )}

                            {item.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-brand-blue/30 text-brand-blue bg-brand-blue/5 uppercase tracking-wider">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
