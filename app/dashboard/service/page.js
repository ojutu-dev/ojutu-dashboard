'use client';

import MainContent from '../../../components/MainContent';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useContent } from '../../../context/ContentContext';
import Image from 'next/image';

export default function Section() {
  const router = useRouter();
  const pathname = usePathname();
  const { content } = useContent();
  const [section, setSection] = useState('');
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const sectionName = pathParts[pathParts.length - 1];
      setSection(sectionName);
      setItems(content[sectionName] || []);
    }
  }, [pathname, content]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/service');
        const data = await response.json();

        if (data.success) {
          setServices(data.data.reverse());
        } else {
          setError('Failed to fetch Services');
        }
      } catch (err) {
        setError('An error occurred while fetching Services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
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
              {services.map((item) => (
                <li
                  key={item._id}
                  title={item.title || item.name}
                  name={item.name}
                  className="flex items-center border p-2 my-2 hover:bg-blue-500 hover:bg-opacity-25 cursor-pointer"
                  onClick={() => handleItemClick(item._id)}
                >
                  {/* {item.image && <Image src={item.image} alt={item.title || item.name} width={50} height={50} className="w-16 h-16 object-cover mr-4" />} */}
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
