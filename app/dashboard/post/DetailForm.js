'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useContent } from '../../../context/ContentContext';
import ConfirmationModal from '../../../components/ConfirmationModal';
import Image from 'next/image';

// Dynamically import JoditEditor to prevent issues with SSR
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

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
    categoryId: '',
    authorId: '',
    body: '',
  });
  const [section, setSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [headerImagePreview, setHeaderImagePreview] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [authorOptions, setAuthorOptions] = useState([]);
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
      // Fetch the existing post data when in editing mode
      const fetchPostData = async () => {
        try {
          const response = await fetch(`/api/post/${params.id}`);
          const data = await response.json();
          if (response.ok) {
            setFormData({
              id: data._id,
              title: data.title,
              slug: data.slug,
              headerImage: data.headerImage,
              featuredImage: data.featuredImage,
              ogImage: data.ogImage,
              description: data.description,
              categoryId: data.category._id,
              authorId: data.author._id,
              body: Array.isArray(data.body) ? data.body.join('') : data.body || '', // Convert body to string
            });
            setHeaderImagePreview(data.headerImage);
            setFeaturedImagePreview(data.featuredImage);
            setOgImagePreview(data.ogImage);
            setIsEditing(true);
          } else {
            console.error('Failed to fetch post data:', data);
          }
        } catch (error) {
          console.error('Error fetching post data:', error);
        }
      };
      fetchPostData();
    }
  }, [params.id, section]);

  useEffect(() => {
    const fetchCategoryOptions = async () => {
      try {
        const response = await fetch('/api/category');
        const data = await response.json();
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
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: reader.result,
        }));
        if (name === 'headerImage') setHeaderImagePreview(reader.result);
        if (name === 'featuredImage') setFeaturedImagePreview(reader.result);
        if (name === 'ogImage') setOgImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleSlugGeneration = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      slug: prevFormData.title.toLowerCase().replace(/\s+/g, '-'),
    }));
  };

  const handleBodyChange = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      body: value || '', // Ensure body is always a string
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/post/${params.id}` : '/api/post';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Failed to save post:', errorResponse);
        return;
      }

      const post = await response.json();
      if (isEditing) {
        updateItem(section, post.id, post);
      } else {
        addItem(section, post);
      }
      router.push(`/dashboard/${section}`);
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
      <div className="mt-4">
        <label className="w-full">
          Slug:
        </label>

        <div className="flex items-center">
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="p-2 border rounded outline-none text-black w-9/12"
          />

        <button
          type="button"
          onClick={handleSlugGeneration}
          className="ml-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded w-3/12"
        >
          Generate Slug
        </button>

        </div>
      </div>
      <div className="mt-4">
        <label>
          Header Image:
          {headerImagePreview && <Image width={30} height={30} src={headerImagePreview} alt="Preview" className="w-32 h-32 object-cover my-2" />}
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
          {featuredImagePreview && <Image width={30} height={30} src={featuredImagePreview} alt="Preview" className="w-32 h-32 object-cover my-2" />}
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
          {ogImagePreview && <Image width={30} height={30} src={ogImagePreview} alt="Preview" className="w-32 h-32 object-cover my-2" />}
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
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          >
            <option value="">Select Category</option>
            {categoryOptions.map((category) => (
              <option key={category._id} value={category._id}>{category.title}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Author:
          <select
            name="authorId"
            value={formData.authorId}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          >
            <option value="">Select Author</option>
            {authorOptions.map((author) => (
              <option key={author._id} value={author._id}>{author.name}</option>
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
            onChange={handleBodyChange}
            config={config}
            className="bg-white"
          />
        </label>
      </div>
      <div className="flex space-x-2 mt-4">
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">
          {isEditing ? 'Update' : 'Publish'}
        </button>
        <button type="button" onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded">
          Cancel
        </button>
        {isEditing && (
          <button type="button" onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded">
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
