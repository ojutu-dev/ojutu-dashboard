'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';

export default function DetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { content, addItem, updateItem, deleteItem } = useContent();
  const [formData, setFormData] = useState({
    id: Date.now(),
    title: '',
    name: '',
    bio: '',
    image: null,
    body: '',
  });
  const [section, setSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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
        setIsEditing(true);
      }
    }
  }, [params.id, section, content]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUrl = reader.result;
      const newFormData = { ...formData, image: imageDataUrl };
      if (isEditing) {
        updateItem(section, formData.id, newFormData);
      } else {
        addItem(section, newFormData);
      }
      router.push(`/dashboard/${section}`);
    };
    if (formData.image instanceof File) {
      reader.readAsDataURL(formData.image);
    } else {
      if (isEditing) {
        updateItem(section, formData.id, formData);
      } else {
        addItem(section, formData);
      }
      router.push(`/dashboard/${section}`);
    }
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
      <div>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </label>
      </div>
      <div>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </label>
      </div>
      <div>
        <label>
          Bio:
          <input
            type="text"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </label>
      </div>
      <div>
        <label>
          Image:
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className="p-2 border rounded"
            accept="image/*"
          />
        </label>
      </div>
      <div>
        <label>
          Body:
          <textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </label>
      </div>
      <div>
        <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          {isEditing ? 'Update' : 'Submit'}
        </button>
        <button type="button" onClick={handleCancel} className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600 ml-2">
          Cancel
        </button>
        {isEditing && (
          <button type="button" onClick={handleDelete} className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 ml-2">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
