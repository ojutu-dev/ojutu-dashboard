'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useContent } from '../../../context/ContentContext';
import ConfirmationModal from '../../../components/ConfirmationModal';

export default function ServiceDetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { content, addItem, updateItem, deleteItem } = useContent();
  const [formData, setFormData] = useState({
    id: Date.now(),
    title: '',
    description: '',
  });
  const [section, setSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const sectionName = pathParts[pathParts.length - 2];
      setSection(sectionName);
      console.log('Section set to:', sectionName); // Debugging line
    }
  }, [pathname]);

  useEffect(() => {
    if (params.id && section) {
      const fetchCategory = async () => {
        try {
          const response = await fetch(`/api/category/${params.id}`);
          const data = await response.json();
          if (data) {
            setFormData(data);
            setIsEditing(true);
            console.log('Editing item:', data); // Debugging line
          }
        } catch (error) {
          console.error('Error fetching category:', error);
        }
      };

      fetchCategory();
    }
  }, [params.id, section]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/category/${params.id}` : '/api/category';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const category = await response.json();
        if (isEditing) {
          updateItem(section, category.id, category);
        } else {
          addItem(section, category);
        }
        router.push(`/dashboard/${section}`);
      } else {
        console.error('Failed to save category');
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
      const response = await fetch(`/api/category/${params.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        deleteItem(section, formData.id);
        router.push(`/dashboard/${section}`);
      } else {
        console.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsModalOpen(false); // Close the modal
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold'>Category:</h2>
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
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black resize-none aspect-[6/1]"
          />
        </label>
      </div>
      <div className="flex space-x-2 mt-4">
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {isEditing ? 'Update' : 'Submit'}
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
