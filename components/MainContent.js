'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';

export default function MainContent({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChildren, setFilteredChildren] = useState(React.Children.toArray(children));

  const handleAddNew = () => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const section = pathParts[pathParts.length - 1];
      router.push(`/dashboard/${section}/new`);
    }
  };

  useEffect(() => {
    const allChildren = React.Children.toArray(children);
    console.log('All children:', allChildren);

    const findLiElements = (elements) => {
      let liElements = [];
      elements.forEach((element) => {
        if (React.isValidElement(element)) {
          if (element.type === 'li') {
            liElements.push(element);
          } else if (element.props.children) {
            liElements = liElements.concat(findLiElements(React.Children.toArray(element.props.children)));
          }
        }
      });
      return liElements;
    };

    const liElements = findLiElements(allChildren);
    console.log('LI elements:', liElements);

    if (searchQuery) {
      const filtered = liElements.filter(li => {
        const title = li.props.title || '';
        const name = li.props.name || '';
        // console.log('LI Title:', title, 'LI Name:', name);
        return title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredChildren(filtered.length > 0 ? filtered : [<p>No results found.</p>]);
    } else {
      setFilteredChildren(allChildren);
    }
  }, [searchQuery, children]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="w-4/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className="p-2 border rounded text-black outline-none"
        />
        <button
          onClick={handleAddNew}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Add New
        </button>
      </div>
      <div>
        {filteredChildren}
      </div>
    </div>
  );
}
