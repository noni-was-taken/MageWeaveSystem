import React from 'react';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="MageWeave - Dashboard" />
            <div class='h-[150vh] bg-white'>
                <div class='bg-amber-300 w-full h-28 p-2.5 flex justify-between items-center'>
                    <h1 class='text-3xl font-bold md:self-center text-5xl ml-8'>MageWeave</h1>
                </div>
            </div>    
        </>
    )
}