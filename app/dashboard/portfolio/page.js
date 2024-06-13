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
  const [portfolios, setPortfolios] = useState([]);
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
    const fetchPortfolios = async () => {
      try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();

        if (data.success) {
          setPortfolios(data.data.reverse());
        } else {
          setError('Failed to fetch Portfolios');
        }
      } catch (err) {
        setError('An error occurred while fetching Portfolios');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const handleItemClick = (id) => {
    router.push(`/dashboard/${section}/${id}`);
  };

  return (
    <div className="flex">
      <div className="flex flex-col w-full ">
        <MainContent>
          <div>
            <h2>{`Content for ${section.charAt(0).toUpperCase() + section.slice(1)}`}</h2>
            {loading ? (
                <div className="grid place-content-center h-[50vh] w-full">
                  Loading...
                </div>
              ) : (
                portfolios.map((item) => (
                <li
                  key={item._id}
                  title={item.title || item.name}
                  name={item.name}
                  className="flex items-center border hover:bg-blue-500 hover:bg-opacity-25 p-2 my-2 cursor-pointer"
                  onClick={() => handleItemClick(item._id)}
                >
                  {item.mainImage && <Image src={item.mainImage} alt={item.title} width={50} height={50} className="w-16 h-16 object-cover mr-4" />}
                  <h3>{item.title}</h3>
                </li>
                ))
              )}
          </div>
        </MainContent>
      </div>
    </div>
  );
}
