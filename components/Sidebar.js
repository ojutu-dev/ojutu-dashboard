import { useRouter } from 'next/navigation';

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

  return (
    <div className="w-1/5 h-screen p-4 bg-gray-800 text-white sticky top-0">
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
    </div>
  );
}
