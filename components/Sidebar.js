import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const menuItems = [
  'Post',
  'Portfolio',
  'Testimonials',
  'Brands',
  'Authors',
  'Categories',
  'Keywords',
  'Service',
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname.split('/')[2]?.toLowerCase();
 


  return (
    <div className="w-1/5 h-[calc(100vh-60px)] p-4 bg-gray-800 text-white sticky top-[60px] flex flex-col justify-between">
      <ul>
        {menuItems.map((item) => {
          const lowerCaseItem = item.toLowerCase();
          const isActive = pathname.includes(lowerCaseItem);
          return (
            <li
              key={item}
              className={`mb-1 cursor-pointer hover:bg-blue-500 hover:bg-opacity-10 p-2 rounded ${isActive ? "bg-blue-500 bg-opacity-20" : ""}`}
              onClick={() => router.push(`/dashboard/${lowerCaseItem}`)}
            >
              {item}
            </li>
          );
        })}
      </ul>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="mt-4 p-2 bg-red-500 rounded hover:bg-red-600 text-white"
      >
        Logout
      </button>
    </div>
  );
}
