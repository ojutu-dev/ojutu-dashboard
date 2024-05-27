export const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-');
  };
  
  export const checkSlugExists = async (slug, type) => {
    const res = await fetch(`/api/slug/${type}/${slug}`);
    const data = await res.json();
    return data.exists;
  };
  