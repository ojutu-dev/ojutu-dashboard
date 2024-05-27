// 'use client';

// import Header from '../../../components/Header';
// import Sidebar from '../../../components/Sidebar';
// import MainContent from '../../../components/MainContent';
// import { useRouter, usePathname } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { useContent } from '../../../context/ContentContext';
// import Image from 'next/image';

// export default function Section() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const { content } = useContent();
//   const [section, setSection] = useState('');
//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     if (pathname) {
//       const pathParts = pathname.split('/');
//       const sectionName = pathParts[pathParts.length - 1];
//       setSection(sectionName);
//       setItems(content[sectionName] || []);
//     }
//   }, [pathname, content]);

//   const handleItemClick = (id) => {
//     router.push(`/dashboard/${section}/${id}`);
//   };

//   return (
//     <div className="flex">
//       <Sidebar />
//       <div className="flex flex-col w-full">
//         <Header />
//         <MainContent>
//           <div>
//             <h2>{`Content for ${section.charAt(0).toUpperCase() + section.slice(1)}`}</h2>
//             <ul>
//               {items.map((item) => (
//                 <li
//                   key={item.id}
//                   className="flex items-center border p-2 my-2 cursor-pointer"
//                   onClick={() => handleItemClick(item.id)}
//                 >
//                   {item.image && <Image src={item.image} alt={item.title || item.name} width={50} height={50} className="w-16 h-16 object-cover mr-4" />}
//                   <h3>{item.title || item.name}</h3>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </MainContent>
//       </div>
//     </div>
//   );
// }


'use client';

import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import MainContent from '../../../components/MainContent';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Section() {
  const router = useRouter();
  const pathname = usePathname();
  const [section, setSection] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const sectionName = pathParts[pathParts.length - 1];
      setSection(sectionName);
    }
  }, [pathname]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/category');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError('An error occurred while fetching categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handleItemClick = (id) => {
    router.push(`/dashboard/${section}/${id}`);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full">
        <Header />
        <MainContent>
          <div>
            <h2>{`Content for ${section.charAt(0).toUpperCase() + section.slice(1)}`}</h2>
            <ul>
              {categories.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center border p-2 my-2 cursor-pointer"
                  onClick={() => handleItemClick(item._id)}
                >
                  {item.image && <Image src={item.image} alt={item.title} width={50} height={50} className="w-16 h-16 object-cover mr-4" />}
                  <h3>{item.title}</h3>
                </li>
              ))}
            </ul>
          </div>
        </MainContent>
      </div>
    </div>
  );
}
