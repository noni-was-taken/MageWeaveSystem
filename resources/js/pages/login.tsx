import React, { useState } from 'react';
import { router } from '@inertiajs/react';

const login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    router.post('/custom-login', {
      user_id: userId,
      password: password,
    }, {
      onError: (errors) => {
        setError(errors.password || errors.user_id || 'Login failed');
      },
      onSuccess: () => {
        router.visit('/dashboard');
      }
    });
  };

  return (
    <div className='flex flex-col gap-7 items-center justify-center h-screen w-full bg-white'>
      <div className='h-4/12 w-1/6 items-center justify-center flex -mt-56 -mb-16'>
        <img src="/MageWeave_Logo.png" alt="MageWeave Logo" className='max-h-full object-contain'/>
      </div>
      <div className='border border-gray-300 h-auto w-1/3 p-8 rounded-lg shadow-lg'>
        <h2 className='font-bold text-2xl'>Login</h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='mb-4 mt-4'>
            <label htmlFor="user_id" className='text-gray-400'>User ID</label>
            <input
              type="text"
              id="user_id"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              required
              className='w-full p-2 mt-2 border border-gray-300 rounded'
              />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="password" className='text-gray-400'>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className='w-full p-2 mt-2 border border-gray-300 rounded'
              />
          </div>
          {error && (
            <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>
          )}
          <div className='w-full flex justify-center'>
            <button type="submit" className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'>
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default login;
