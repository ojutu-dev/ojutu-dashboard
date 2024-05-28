"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session && router.pathname !== '/login') {
      router.replace('/login');
    } else if (session && router.pathname === '/login') {
      router.replace('/dashboard');
    }

    setLoading(false);
  }, [session, status, router]);

  if (loading) return null;

  return children;
};
