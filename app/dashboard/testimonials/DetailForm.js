// app/dashboard/testimonials/DetailForm.js

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useContent } from '../../../context/ContentContext';

export default function DetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { content, addItem, updateItem, deleteItem } = useContent();
  const [formData, setFormData] = useState({
    id: Date.now(),
    name: '',
    work: '',
    image: null,
    content: '',
    rating: 1,
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
      const item = content[section]?.find((item) => item.id === parseInt(params.id));
      if (item) {
        setFormData(item);
        setImagePreview(item.image);
        setIsEditing(true);
      }
    }
  }, [params.id, section, content]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
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
      <h2 className='text-2xl font-bold'>Testimonial:</h2>
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
      <div className="mt-4">
        <label>
          Work:
          <input
            type="text"
            name="work"
            value={formData.work}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          />
        </label>
      </div>
      <div className="mt-4">
        <label>
          Content:
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="p-2 border rounded w-full resize-none outline-none text-black aspect-[6/1]"
          />
        </label>
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
          Rating:
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="1"
            max="5"
            className="p-2 border rounded w-full outline-none text-black"
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
