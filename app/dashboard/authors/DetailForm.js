'use client';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    slug: '',
    image: null,
    description: '',
  });
  const [section, setSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const sectionName = pathParts[pathParts.length - 2];
      setSection(sectionName);
    }
  }, [pathname]);

  useEffect(() => {
    if (params.id && section) {
      fetch(`/api/author/${params.id}`)
        .then(response => response.json())
        .then(data => {
          setFormData(data);
          setImagePreview(data.image);
          setIsEditing(true);
        })
        .catch(error => console.error('Error fetching author:', error));
    }
  }, [params.id, section]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files) {
      const file = files[0];
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSlugGeneration = () => {
    setFormData({ ...formData, slug: formData.name.toLowerCase().replace(/\s+/g, '-') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataCopy = { ...formData };
      if (formData.image && formData.image instanceof File) {
        formDataCopy.image = await convertFileToBase64(formData.image);
      }
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/author/${params.id}` : '/api/author';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataCopy),
      });
      if (!response.ok) {
        throw new Error('Failed to save author');
      }
      router.push(`/dashboard/${section}`);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/author/${params.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete author');
      }
      router.push(`/dashboard/${section}`);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold'>Author:</h2>
        {formData.name && <div className="text-lg font-bold">{formData.name}</div>}
      </div>
      <div>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
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
          Image:
          {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover my-2" />}
          <input
            type="file"
            name="image"
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
            className="p-2 border rounded w-full outline-none text-black aspect-[6/1] resize-none"
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
    </form>
  );
}
