import { useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthWrapper({ children }) {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        router.replace("/login");
      }
    };
    checkSession();
  }, [router]);

  return children;
}
