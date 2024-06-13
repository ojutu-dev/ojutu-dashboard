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
  const [authors, setAuthors] = useState([]);
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
    const fetchAuthors = async () => {
      try {
        const response = await fetch('/api/author');
        const data = await response.json();

        if (data.success) {
          setAuthors(data.data.reverse()); // Reverse the array to show new records at the top
        } else {
          setError('Failed to fetch Authors');
        }
      } catch (err) {
        setError('An error occurred while fetching Authors');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

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
              {loading ? (
                <div className="grid place-content-center w-full h-[50vh]">
                  Loading...
                </div>
                
              ) : (
                authors.map((item) => (
                  <li
                    key={item.id}
                    title={item.title || item.name}
                    name={item.name}
                    className="flex items-center border p-2 my-2 hover:bg-blue-500 hover:bg-opacity-25 cursor-pointer"
                    onClick={() => handleItemClick(item._id)}
                  >
                    {item.image && <Image src={item.image} alt={item.title || item.name} width={50} height={50} className="w-16 h-16 object-cover mr-4" />}
                    <h3>{item.title || item.name}</h3>
                  </li>
                ))
              )}
            </ul>
          </div>
        </MainContent>
      </div>
    </div>
  );
}
