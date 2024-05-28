import { useRouter, usePathname } from 'next/navigation';

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

  const handleLogout = () => {
    // Clear any stored tokens or session data
    localStorage.removeItem('authToken'); // Example if you use local storage
    sessionStorage.removeItem('authToken'); // Example if you use session storage
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; // Example if you use cookies

    // Redirect to login page
    router.push('/login');
  };

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
        onClick={handleLogout}
        className="mt-4 p-2 bg-red-500 rounded hover:bg-red-600 text-white"
      >
        Logout
      </button>
    </div>
  );
}
