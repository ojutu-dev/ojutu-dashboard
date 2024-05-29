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
        <div className="p-4 grid place-content-center w-full h-[50vh]">
          <h1>Welcome Abroad</h1>
        </div>
      </div>
    </div>
  );
}
