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
    if (searchQuery) {
      const filtered = allChildren.filter(child => {
        const childElements = React.Children.toArray(child.props.children);
        let found = false;

        childElements.forEach(childElement => {
          if (React.isValidElement(childElement)) {
            const title = childElement.props.children || childElement.props.title || childElement.props.name || '';
            if (title.toString().toLowerCase().includes(searchQuery.toLowerCase())) {
              found = true;
            }
          }
        });

        return found;
      });

      setFilteredChildren(filtered);
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
        {filteredChildren.length > 0 ? (
          filteredChildren
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
}
