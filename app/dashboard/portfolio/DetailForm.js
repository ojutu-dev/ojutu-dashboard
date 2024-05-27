'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useContent } from '../../../context/ContentContext';
import JoditEditor from 'jodit-react';
import axios from 'axios';
import ConfirmationModal from '../../../components/ConfirmationModal';

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
    brand: '',
    mainImage: null,
    headerImage: null,
    otherImage: null,
    description: '',
    keywords: [],
    body: '',
  });
  const [section, setSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [headerImagePreview, setHeaderImagePreview] = useState(null);
  const [otherImagePreview, setOtherImagePreview] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [keywordOptions, setKeywordOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const editor = useRef(null);

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
    const fetchCategoryOptions = async () => {
      try {
        const response = await fetch('/api/category');
        const data = await response.json();
        console.log('Fetched categories:', data);
        if (data.success !== false) {
          setCategoryOptions(data.data || data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchBrandOptions = async () => {
      try {
        const response = await fetch('/api/brand');
        const data = await response.json();
        console.log('Fetched brands:', data);
        if (data.success !== false) {
          setBrandOptions(data.data || data);
        } else {
          console.error('Failed to fetch brands');
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    const fetchKeywordOptions = async () => {
      try {
        const response = await fetch('/api/keywords');
        const data = await response.json();
        console.log('Fetched keywords:', data);
        if (data.success !== false) {
          setKeywordOptions(data.data || data);
        } else {
          console.error('Failed to fetch keywords');
        }
      } catch (error) {
        console.error('Error fetching keywords:', error);
      }
    };

    fetchCategoryOptions();
    fetchBrandOptions();
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
    } else if (name === 'keywords') {
      const newKeywords = formData.keywords.includes(value)
        ? formData.keywords.filter((keyword) => keyword !== value)
        : [...formData.keywords, value];
      setFormData({ ...formData, keywords: newKeywords });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSlugGeneration = () => {
    setFormData({ ...formData, slug: formData.title.toLowerCase().replace(/\s+/g, '-') });
  };

  const handleBodyChange = (value) => {
    setFormData({ ...formData, body: value });
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

  const uploadHandler = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url; // URL of the uploaded image
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const config = useMemo(
    () => ({
      toolbarAdaptive: false,
      buttons: 'paragraph,|,bold,italic,ul,paste,selectall,file,image',
      uploader: {
        insertImageAsBase64URI: true,
        imagesExtensions: ['jpg', 'png', 'jpeg', 'gif'],
        url: '/api/upload',
        format: 'json',
        method: 'POST',
        headers: {
          Authorization: 'Bearer your-access-token',
        },
        filesVariableName: function (t) {
          return 'files[' + t + ']';
        },
        process: function (resp) {
          return {
            files: resp.files.map(function (file) {
              return {
                name: file.name,
                size: file.size,
                type: file.type,
                url: file.url,
                thumb: file.url,
                error: file.error,
              };
            }),
            path: resp.path,
            baseurl: resp.baseurl,
          };
        },
      },
      placeholder: 'Start typing...',
    }),
    []
  );

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
              <option key={index} value={category.title}>{category.title}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Brand:
          <select
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          >
            <option value="">Select Brand</option>
            {brandOptions.map((brand, index) => (
              <option key={index} value={brand.title}>{brand.title}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Keywords:
          {keywordOptions.map((keyword, index) => (
            <div key={index} className="flex items-center">
              <input
                type="checkbox"
                name="keywords"
                value={keyword.title}
                checked={formData.keywords.includes(keyword.title)}
                onChange={handleChange}
                className="mr-2"
              />
              <span>{keyword.title}</span>
            </div>
          ))}
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
          <JoditEditor
            ref={editor}
            value={formData.body}
            onChange={handleBodyChange}
            config={config}
            className="bg-white"
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
