'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useContent } from '../../../context/ContentContext';
import JoditEditor from 'jodit-react';
import ConfirmationModal from '../../../components/ConfirmationModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        setHeaderImagePreview(item.headerImage);
        setFeaturedImagePreview(item.featuredImage);
        setOgImagePreview(item.ogImage);
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
        if (data.length > 0) {
          setCategoryOptions(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchAuthorOptions = async () => {
      try {
        const response = await fetch('/api/author');
        const data = await response.json();
        console.log('Fetched authors:', data);
        if (data.success) {
          setAuthorOptions(data.data);
        } else {
          console.error('Failed to fetch authors');
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };

    fetchCategoryOptions();
    fetchAuthorOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'headerImage' && files) {
      const file = files[0];
      setFormData({ ...formData, headerImage: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (name === 'featuredImage' && files) {
      const file = files[0];
      setFormData({ ...formData, featuredImage: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (name === 'ogImage' && files) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/post/${params.id}` : '/api/post';

    try {
      const formDataToSend = { ...formData };
      if (formData.headerImage instanceof File) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          formDataToSend.headerImage = reader.result;
          await sendRequest();
        };
        reader.readAsDataURL(formData.headerImage);
      } else if (formData.featuredImage instanceof File) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          formDataToSend.featuredImage = reader.result;
          await sendRequest();
        };
        reader.readAsDataURL(formData.featuredImage);
      } else if (formData.ogImage instanceof File) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          formDataToSend.ogImage = reader.result;
          await sendRequest();
        };
        reader.readAsDataURL(formData.ogImage);
      } else {
        await sendRequest();
      }

      async function sendRequest() {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formDataToSend),
        });
        if (response.ok) {
          const post = await response.json();
          if (isEditing) {
            updateItem(section, post.id, post);
          } else {
            addItem(section, post);
          }
          router.push(`/dashboard/${section}`);
        } else {
          console.error('Failed to save post');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = () => {
    setIsModalOpen(true); // Open the modal
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/post/${params.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        deleteItem(section, formData.id);
        router.push(`/dashboard/${section}`);
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsModalOpen(false); // Close the modal
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  const config = useMemo(
    () => ({
      toolbarAdaptive: false,
      buttons: 'paragraph,|,bold,italic,ul,paste,selectall,file,image',
      placeholder: 'Empty',
    }),
    []
  );

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
            name="categories"
            value={formData.categories}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          >
            {categoryOptions.map((category) => (
              <option key={category._id} value={category.title}>{category.title}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Author:
          <select
            name="authors"
            value={formData.authors}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          >
            {authorOptions.map((author) => (
              <option key={author._id} value={author.name}>{author.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Body:
          <JoditEditor
            ref={editor}
            value={formData.body}
            onChange={(newBody) => setFormData({ ...formData, body: newBody })}
            config={config}
          />
        </label>
      </div>
      <div className="flex space-x-2 mt-4">
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {isEditing ? 'Update' : 'Publish'}
        </button>
        <button type="button" onClick={handleCancel} className="bg-gray-500 text-white p-2 rounded">
          Cancel
        </button>
        {isEditing && (
          <button type="button" onClick={handleDelete} className="bg-red-500 text-white p-2 rounded">
            Delete
          </button>
        )}
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
      />
    </form>
  );
}
