'use client';

import { createContext, useState, useContext } from 'react';

const ContentContext = createContext();

export function ContentProvider({ children }) {
  const [content, setContent] = useState({
    post: [],
    portfolio: [],
    testimonials: [],
    brands: [],
    authors: [],
    categories: [],
    keywords: [],
    service: [],
  });

  const addItem = (section, item) => {
    setContent((prevContent) => ({
      ...prevContent,
      [section]: [...prevContent[section], item],
    }));
  };

  const updateItem = (section, id, updatedItem) => {
    setContent((prevContent) => ({
      ...prevContent,
      [section]: prevContent[section].map((item) =>
        item.id === id ? updatedItem : item
      ),
    }));
  };

  const deleteItem = (section, id) => {
    setContent((prevContent) => ({
      ...prevContent,
      [section]: prevContent[section].filter((item) => item.id !== id),
    }));
  };

  return (
    <ContentContext.Provider value={{ content, addItem, updateItem, deleteItem }}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);
