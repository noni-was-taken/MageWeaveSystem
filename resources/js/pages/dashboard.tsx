import React from 'react';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function dashboard() {
    return (
        <>
            <Head title="MageWeave - Dashboard" />
            <div className='h-[150vh] bg-white'>
                <div className='bg-amber-300 w-full h-28 p-2.5 flex justify-between items-center'>
                    <h1 className='text-3xl font-bold md:self-center text-5xl ml-8'>MageWeave</h1>
                </div>
            </div>    
        </>
    )
}

console.log('Dashboard page loaded');