import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function PageNotFound() {
  const [error, setError] = useState('');

  return (
    <div className='flex flex-col gap-7 items-center justify-center h-screen w-full bg-white'>
      <div className='h-4/12 w-1/6 items-center justify-center flex -mt-56 -mb-16'>
        <img src="/MageWeave_Logo.png" alt="MageWeave Logo" className='max-h-full object-contain'/>
      </div>
      <div className='border border-gray-300 h-auto w-1/3 p-8 rounded-lg shadow-lg'>
        <h2 className='font-bold text-2xl text-center'>Page Not Found</h2>
        <p className='text-gray-600 mt-4 text-center'>The page you are looking for does not exist.</p>
        {error && (
          <div style={{ color: 'red', marginTop: 16 }}>{error}</div>
        )}
      </div>
      
    </div>
  );
}