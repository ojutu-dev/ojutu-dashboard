'use client';

import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
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
  // const [items, setItems] = useState([]);
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const sectionName = pathParts[pathParts.length - 1];
      setSection(sectionName);
      setTestimonies(content[sectionName] || []);
    }
  }, [pathname, content]);

  useEffect(() => {
    const fetchTestimonies = async () => {
      try {
        const response = await fetch('/api/testimony');
        const data = await response.json();

        if (data.success) {
          setTestimonies(data.data);
        } else {
          setError('Failed to fetch testimonies');
          console.log(error)
        }
      } catch (err) {
        setError('An error occurred while fetching testimonies');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonies();
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
              {testimonies.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center border p-2 my-2 cursor-pointer"
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
