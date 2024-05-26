'use client';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/post');
  }, [router]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full">
        <Header />
        <div className="p-4">
          <h1>Dashboard</h1>
        </div>
      </div>
    </div>
  );
}
