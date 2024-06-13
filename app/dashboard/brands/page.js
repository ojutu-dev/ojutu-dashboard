'use client';

import MainContent from '../../../components/MainContent';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Section() {
  const router = useRouter();
  const pathname = usePathname();
  const [section, setSection] = useState('');
  const [brands, setBrands] = useState([]);
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
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brand');
        const data = await response.json();
        if (data.success) {
          setBrands(data.data.reverse()); // Reverse the array to show new records at the top
        } else {
          setError('Failed to fetch brands');
        }
      } catch (err) {
        setError('An error occurred while fetching brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) return <p className='grid place-content-center w-full h-[50vh]'>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handleItemClick = (id) => {
    router.push(`/dashboard/${section}/${id}`);
  };

  return (
    <div className="flex">
      <div className="flex flex-col w-full">
        <MainContent>
          <div>
            <h2>{`Content for ${section.charAt(0).toUpperCase() + section.slice(1)}`}</h2>
            <ul>
              {brands.map((item) => (
                <li
                  key={item._id}
                  title={item.title || item.name}
                  name={item.name}
                  className="flex items-center border p-2 my-2 hover:bg-blue-500 hover:bg-opacity-25 cursor-pointer"
                  onClick={() => handleItemClick(item._id)}
                >
                  {item.image && <Image src={item.image} alt={item.title || item.name} width={50} height={50} className="w-16 h-16 object-cover mr-4" />}
                  <h3>{item.title || item.name}</h3>
                </li>
              ))}
            </ul>
          </div>
        </MainContent>
      </div>
    </div>
  );
}