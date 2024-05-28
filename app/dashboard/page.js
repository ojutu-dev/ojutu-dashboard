'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/post');
  }, [router]);

  return (
    <div className="flex">
      <div className="flex flex-col w-full">
        <div className="p-4">
          <h1>Dashboard</h1>
        </div>
      </div>
    </div>
  );
}
