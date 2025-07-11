import React, { useState } from 'react';
import { router } from '@inertiajs/react';

const Logins: React.FC = () => {
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
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24, backgroundColor: '#f9fafb', borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="user_id">User ID</label>
          <input
            type="text"
            id="user_id"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>
        )}
        <button type="submit" style={{ padding: '8px 16px' }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Logins;
