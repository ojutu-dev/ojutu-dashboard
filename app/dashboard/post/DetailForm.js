'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useContent } from '../../../context/ContentContext';

export default function DetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { content, addItem, updateItem, deleteItem } = useContent();
  const [formData, setFormData] = useState({
    id: Date.now(),
    title: '',
    slug: '',
    headerImage: null,
    featuredImage: null,
    ogImage: null,
    description: '',
    categories: [],
    authors: [],
    body: '',
  });
  const [section, setSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [headerImagePreview, setHeaderImagePreview] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [authorOptions, setAuthorOptions] = useState([]);

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const sectionName = pathParts[pathParts.length - 2];
      setSection(sectionName);
    }
  }, [pathname]);

  useEffect(() => {
    if (params.id && section) {
      const item = content[section]?.find((item) => item.id === parseInt(params.id));
      if (item) {
        setFormData(item);
        setHeaderImagePreview(item.headerImage);
        setFeaturedImagePreview(item.featuredImage);
        setOgImagePreview(item.ogImage);
        setIsEditing(true);
      }
    }
  }, [params.id, section, content]);

  useEffect(() => {
    // Fetch categories and authors data and set options
    const fetchCategoryOptions = async () => {
      // Example: Fetch categories from your API or context
      // const categoriesData = await fetchCategories();
      // setCategoryOptions(categoriesData);
      // For now, using sample data
      const categoriesData = ['Category 1', 'Category 2', 'Category 3'];
      setCategoryOptions(categoriesData);
    };

    const fetchAuthorOptions = async () => {
      // Example: Fetch authors from your API or context
      // const authorsData = await fetchAuthors();
      // setAuthorOptions(authorsData);
      // For now, using sample data
      const authorsData = ['Author 1', 'Author 2', 'Author 3'];
      setAuthorOptions(authorsData);
    };

    fetchCategoryOptions();
    fetchAuthorOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'headerImage') {
      const file = files[0];
      setFormData({ ...formData, headerImage: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (name === 'featuredImage') {
      const file = files[0];
      setFormData({ ...formData, featuredImage: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (name === 'ogImage') {
      const file = files[0];
      setFormData({ ...formData, ogImage: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setOgImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSlugGeneration = () => {
    setFormData({ ...formData, slug: formData.title.toLowerCase().replace(/\s+/g, '-') });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateItem(section, formData.id, formData);
    } else {
      addItem(section, formData);
    }
    router.push(`/dashboard/${section}`);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = () => {
    deleteItem(section, formData.id);
    router.push(`/dashboard/${section}`);
  };
  

  return (
    <form onSubmit={handleSubmit}>

      <div className='mb-8'>
      <h2 className='text-2xl font-bold'>Post:</h2>
      {formData.title && <div className="text-lg font-bold">{formData.title}</div>}
      </div>

      <div>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          />
        </label>
      </div>
      <div className="mt-4 flex items-end">
        <label className="w-full">
          Slug:
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          />
        </label>
        <button type="button" onClick={handleSlugGeneration} className="ml-2 p-2 bg-blue-500 text-white rounded">
          Generate Slug
        </button>
      </div>
      <div className="mt-4">
        <label>
          Header Image:
          {headerImagePreview && <img src={headerImagePreview} alt="Preview" className="w-32 h-32 object-cover my-2" />}
          <input
            type="file"
            name="headerImage"
            onChange={handleChange}
            className="p-2 border rounded w-full"
            accept="image/*"
          />
        </label>
      </div>
      <div className="mt-4">
        <label>
          Featured Image:
          {featuredImagePreview && <img src={featuredImagePreview} alt="Preview" className="w-32 h-32 object-cover my-2" />}
          <input
            type="file"
            name="featuredImage"
            onChange={handleChange}
            className="p-2 border rounded w-full"
            accept="image/*"
          />
        </label>
      </div>
      <div className="mt-4">
        <label>
          OG Image:
          {ogImagePreview && <img src={ogImagePreview} alt="Preview" className="w-32 h-32 object-cover my-2" />}
          <input
            type="file"
            name="ogImage"
            onChange={handleChange}
            className="p-2 border rounded w-full"
            accept="image/*"
          />
        </label>
      </div>
      <div className="mt-4">
        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black resize-none aspect-[6/1]"
          />
        </label>
      </div>
      <div className="mt-4">
        <label>
          Category:
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          >
            <option value="">Select Category</option>
            {categoryOptions.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Author:
          <select
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          >
            <option value="">Select Author</option>
            {authorOptions.map((author, index) => (
              <option key={index} value={author}>{author}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Body:
          <textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black resize-none aspect-[6/1]"
          />
        </label>
      </div>
      <div className="flex space-x-2 mt-4">
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {isEditing ? 'Update' : 'Publish'}
        </button>
        <button  type="button" onClick={handleCancel} className="bg-gray-500 text-white p-2 rounded">
          Cancel
        </button>
        {isEditing && (
          <button type="button" onClick={handleDelete} className="bg-red-500 text-white p-2 rounded">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
