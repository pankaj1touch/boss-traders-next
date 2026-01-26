'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Pencil, TrendingUp, DollarSign, BarChart2, Globe, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useGetAdminTickersQuery,
    useCreateTickerMutation,
    useUpdateTickerMutation,
    useDeleteTickerMutation,
} from '@/store/api/tickerApi';
import { Button } from '@/components/ui/Button';

const ICONS = [
    { name: 'TrendingUp', icon: TrendingUp },
    { name: 'DollarSign', icon: DollarSign },
    { name: 'BarChart2', icon: BarChart2 },
    { name: 'Globe', icon: Globe },
    { name: 'ShieldCheck', icon: ShieldCheck },
    { name: 'ArrowUpRight', icon: ArrowUpRight },
];

export default function TickersPage() {
    const { data: tickers, isLoading } = useGetAdminTickersQuery({});
    const [createTicker] = useCreateTickerMutation();
    const [updateTicker] = useUpdateTickerMutation();
    const [deleteTicker] = useDeleteTickerMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [currentTicker, setCurrentTicker] = useState<any>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { register, handleSubmit, reset, setValue } = useForm();

    const onSubmit = async (data: any) => {
        try {
            if (isEditing && currentTicker) {
                await updateTicker({ id: currentTicker._id, ...data }).unwrap();
            } else {
                await createTicker(data).unwrap();
            }
            resetForm();
        } catch (error) {
            console.error('Failed to save ticker:', error);
        }
    };

    const resetForm = () => {
        setIsFormOpen(false);
        setIsEditing(false);
        setCurrentTicker(null);
        reset({
            text: '',
            change: '',
            isPositive: true,
            icon: 'TrendingUp',
            badge: '',
            isActive: true,
            order: 0
        });
    };

    const handleEdit = (ticker: any) => {
        setCurrentTicker(ticker);
        setIsEditing(true);
        setIsFormOpen(true);
        setValue('text', ticker.text);
        setValue('change', ticker.change);
        setValue('isPositive', ticker.isPositive);
        setValue('icon', ticker.icon);
        setValue('badge', ticker.badge);
        setValue('isActive', ticker.isActive);
        setValue('order', ticker.order);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this ticker?')) {
            await deleteTicker(id);
        }
    };

    const getIcon = (iconName: string) => {
        const icon = ICONS.find(i => i.name === iconName);
        const IconComponent = icon ? icon.icon : TrendingUp;
        return <IconComponent className="h-5 w-5" />;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Ticker Management</h1>
                <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Ticker
                </Button>
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Text</label>
                                    <input
                                        {...register('text', { required: true })}
                                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="e.g. NIFTY 50 Hits All-Time High"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Change</label>
                                    <input
                                        {...register('change')}
                                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="e.g. +1.2%"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Icon</label>
                                    <select
                                        {...register('icon')}
                                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        {ICONS.map(icon => (
                                            <option key={icon.name} value={icon.name}>{icon.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Badge</label>
                                    <input
                                        {...register('badge')}
                                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="e.g. PRO TIP"
                                    />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register('isPositive')} className="rounded" />
                                        <span className="text-sm">Is Positive?</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register('isActive')} className="rounded" />
                                        <span className="text-sm">Active?</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Order</label>
                                    <input
                                        type="number"
                                        {...register('order')}
                                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                                <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="p-4">Icon</th>
                                <th className="p-4">Text</th>
                                <th className="p-4">Change</th>
                                <th className="p-4">Badge</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                            ) : tickers?.data?.map((ticker: any) => (
                                <tr key={ticker._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 text-brand-gold">{getIcon(ticker.icon)}</td>
                                    <td className="p-4 font-medium">{ticker.text}</td>
                                    <td className={`p-4 ${ticker.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                        {ticker.change}
                                    </td>
                                    <td className="p-4">
                                        {ticker.badge && (
                                            <span className="px-2 py-1 text-xs rounded-full bg-brand-blue/10 text-brand-blue">
                                                {ticker.badge}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${ticker.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {ticker.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => handleEdit(ticker)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(ticker._id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tickers?.data?.length === 0 && (
                                <tr><td colSpan={6} className="p-4 text-center text-gray-500">No tickers found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
