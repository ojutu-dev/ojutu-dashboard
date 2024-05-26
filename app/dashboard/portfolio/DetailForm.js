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
    company: '',
    slug: '',
    category: '',
    tag: '',
    mainImage: null,
    headerImage: null,
    otherImage: null,
    description: '',
    keywords: '',
    body: '',
  });
  const [section, setSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [headerImagePreview, setHeaderImagePreview] = useState(null);
  const [otherImagePreview, setOtherImagePreview] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [keywordOptions, setKeywordOptions] = useState([]);

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
        setMainImagePreview(item.mainImage);
        setHeaderImagePreview(item.headerImage);
        setOtherImagePreview(item.otherImage);
        setIsEditing(true);
      }
    }
  }, [params.id, section, content]);

  useEffect(() => {
    // Fetch categories, tags, and keywords data and set options
    const fetchCategoryOptions = async () => {
      // Example: Fetch categories from your API or context
      // const categoriesData = await fetchCategories();
      // setCategoryOptions(categoriesData);
      // For now, using sample data
      const categoriesData = ['Category 1', 'Category 2', 'Category 3'];
      setCategoryOptions(categoriesData);
    };

    const fetchTagOptions = async () => {
      // Example: Fetch tags from your API or context
      // const tagsData = await fetchTags();
      // setTagOptions(tagsData);
      // For now, using sample data
      const tagsData = ['Tag 1', 'Tag 2', 'Tag 3'];
      setTagOptions(tagsData);
    };

    const fetchKeywordOptions = async () => {
      // Example: Fetch keywords from your API or context
      // const keywordsData = await fetchKeywords();
      // setKeywordOptions(keywordsData);
      // For now, using sample data
      const keywordsData = ['Keyword 1', 'Keyword 2', 'Keyword 3'];
      setKeywordOptions(keywordsData);
    };

    fetchCategoryOptions();
    fetchTagOptions();
    fetchKeywordOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'mainImage') {
      const file = files[0];
      setFormData({ ...formData, mainImage: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (name === 'headerImage') {
      const file = files[0];
      setFormData({ ...formData, headerImage: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (name === 'otherImage') {
      const file = files[0];
      setFormData({ ...formData, otherImage: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setOtherImagePreview(reader.result);
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
      <h2 className='text-2xl font-bold'>Portfolio:</h2>
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
      <div className="mt-4">
        <label>
          Company:
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          />
        </label>
      </div>
      <div className="mt-4 flex items-center">
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
          Tag:
          <select
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          >
            <option value="">Select Tag</option>
            {tagOptions.map((tag, index) => (
              <option key={index} value={tag}>{tag}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Keywords:
          <select
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          >
            <option value="">Select Keywords</option>
            {keywordOptions.map((keyword, index) => (
              <option key={index} value={keyword}>{keyword}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Main Image:
          {mainImagePreview && <img src={mainImagePreview} alt="Preview" className="w-32 h-32 object-cover my-2" />}
          <input
            type="file"
            name="mainImage"
            onChange={handleChange}
            className="p-2 border rounded w-full"
            accept="image/*"
          />
        </label>
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
          Other Image:
          {otherImagePreview && <img src={otherImagePreview} alt="Preview" className="w-32 h-32 object-cover my-2" />}
          <input
            type="file"
            name="otherImage"
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
            className="p-2 border rounded w-full resize-none aspect-[6/1] outline-none text-black"
          />
        </label>
      </div>
      <div className="mt-4">
        <label>
          Body:
          <textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            className="p-2 border rounded w-full resize-none aspect-[6/1] outline-none text-black"
          />
        </label>
      </div>
      <div className="mt-4 flex gap-3">
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          {isEditing ? 'Update' : 'Publish'}
        </button>
        {isEditing && (
          <button type="button" onClick={handleDelete} className="p-2 bg-red-500 text-white rounded">
            Delete
          </button>
        )}
        <button type="button" onClick={handleCancel} className="p-2 bg-gray-500 text-white rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}
