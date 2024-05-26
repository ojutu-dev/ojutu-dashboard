// import { useRouter } from 'next/navigation';

// const menuItems = [
//   'Post',
//   'Portfolio',
//   'Testimonials',
//   'Brands',
//   'Authors',
//   'Categories',
//   'Keywords',
//   'Service',
// ];

// export default function Sidebar() {
//   const router = useRouter();

//   return (
//     <div className="w-1/5 h-screen p-4 bg-gray-800 text-white sticky top-0">
//       <ul>
//         {menuItems.map((item) => (
//           <li 
//             key={item} 
//             className="mb-4 cursor-pointer hover:text-gray-300"
//             onClick={() => router.push(`/dashboard/${item.toLowerCase()}`)}
//           >
//             {item}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }



import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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

  const handleLogout = () => {
    // Clear any stored tokens or session data
    localStorage.removeItem('authToken'); // Example if you use local storage
    sessionStorage.removeItem('authToken'); // Example if you use session storage
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; // Example if you use cookies

    // Redirect to login page
    router.push('/login');
  };

  return (
    <div className="w-1/5 h-screen p-4 bg-gray-800 text-white sticky top-0 flex flex-col justify-between">
      <ul>
        {menuItems.map((item) => (
          <li
            key={item}
            className="mb-4 cursor-pointer hover:text-gray-300"
            onClick={() => router.push(`/dashboard/${item.toLowerCase()}`)}
          >
            {item}
          </li>
        ))}
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
