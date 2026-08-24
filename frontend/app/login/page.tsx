'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Send credentials to Strapi authentication endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local?populate=role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.jwt) {
        // 2. Save the token and role in browser cookies for the middleware to read
        // Note: For production, using a library like 'js-cookie' is cleaner, but this works natively.
        document.cookie = `jwt=${data.jwt}; path=/; max-age=86400`; // Expires in 1 day
        
        // Strapi returns the role name if populated correctly
        const userRole = data.user.role?.name || 'Student'; 
        document.cookie = `role=${userRole}; path=/; max-age=86400`;

        // 3. Redirect the user to their specific dashboard based on their role
        if (userRole === 'Admin') {
          router.push('/dashboard/admin');
        } else if (userRole === 'Content Manager') {
          router.push('/dashboard/content-manager');
        } else if (userRole === 'Instructor') {
          router.push('/dashboard/instructor');
        } else {
          router.push('/dashboard/student');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="p-8 bg-white shadow-md rounded-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">LMS Login</h1>
        
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded" 
            required 
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded" 
            required 
          />
        </div>
        
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Sign In
        </button>
      </form>
    </div>
  );
}