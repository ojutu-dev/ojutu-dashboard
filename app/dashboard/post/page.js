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
  const [posts, setPosts] = useState([]);
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
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/post');
        const data = await response.json();
        if (data.success) {
          setPosts(data.data.reverse());
        } else {
          setError('Failed to fetch Posts');
        }
      } catch (err) {
        setError('An error occurred while fetching Posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
                <div className="grid place-content-center h-[50vh] w-full">
                  Loading...
                </div>
              ) : (
                posts.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center border p-2 my-2 hover:bg-blue-500 hover:bg-opacity-25 cursor-pointer"
                    onClick={() => handleItemClick(item._id)}
                  >
                    {item.featuredImage && (
                      <Image
                        src={item.featuredImage}
                        alt={item.title}
                        width={50}
                        height={50}
                        className="w-16 h-16 object-cover mr-4"
                      />
                    )}
                    <h3>{item.title}</h3>
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
