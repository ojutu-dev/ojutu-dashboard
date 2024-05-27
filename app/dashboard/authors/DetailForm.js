'use client';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
export default function DetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    slug: '',
    image: null,
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
      // Fetch the item data from the API if in edit mode
      axios.get(`/api/${section}/${params.id}`).then(response => {
        const item = response.data;
        setFormData(item);
        setImagePreview(item.image);
        setIsEditing(true);
      });
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
        const imageBase64 = await convertFileToBase64(formData.image);
        formDataCopy.image = imageBase64;
      }
      if (isEditing) {
        await axios.put(`/api/${section}/${formData.id}`, formDataCopy);
      } else {
        await axios.post(`/api/${section}`, formDataCopy);
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
      await axios.delete(`/api/${section}/${formData.id}`);
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