'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useContent } from '../../../context/ContentContext';
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
    image: null,
  });
  const [section, setSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const sectionName = pathParts[pathParts.length - 2];
      setSection(sectionName);
    }
  }, [pathname]);

  useEffect(() => {
    if (params.id && section) {
      const fetchBrand = async () => {
        try {
          const response = await fetch(`/api/brand/${params.id}`);
          const data = await response.json();
          if (data) {
            setFormData(data);
            setImagePreview(data.image);
            setIsEditing(true);
          }
        } catch (error) {
          console.error('Error fetching brand:', error);
        }
      };

      fetchBrand();
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
    setFormData({ ...formData, slug: formData.title.toLowerCase().replace(/\s+/g, '-') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/brand/${params.id}` : '/api/brand';
    setLoading(true)

    try {
      const formDataToSend = { ...formData };
      if (formData.image instanceof File) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          formDataToSend.image = reader.result;
          await sendRequest();
        };
        reader.readAsDataURL(formData.image);
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
          const brand = await response.json();
          if (isEditing) {
            updateItem(section, brand.id, brand);
          } else {
            addItem(section, brand);
          }
          router.push(`/dashboard/${section}`);
        } else {
          console.error('Failed to save brand');
        }
        setLoading(false)
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoading(false)
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
      const response = await fetch(`/api/brand/${params.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        deleteItem(section, formData.id);
        router.push(`/dashboard/${section}`);
      } else {
        console.error('Failed to delete brand');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
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
        <h2 className='text-2xl font-bold'>Brand:</h2>
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
            required
            className="p-2 border rounded w-full outline-none text-black"
          />
        </label>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded" disabled={loading}>
        {loading ? (
            <svg
              class="animate-spin h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                class="stroke-current text-white opacity-75"
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke-width="4"
              ></circle>
            </svg>
          ) : isEditing ? (
            "Update"
          ) : (
            "Publish"
          )}
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
