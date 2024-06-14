'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import ConfirmationModal from '../../../components/ConfirmationModal';
import Image from 'next/image';
import ImageSelectionModal from '../../../components/ImageSelectionModal';

export default function DetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    work: '',
    image: null,
    content: '',
    star: '',
  });
  const [section, setSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isImageSelectionModalOpen, setIsImageSelectionModalOpen] = useState(false);

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split('/');
      const sectionName = pathParts[pathParts.length - 2];
      setSection(sectionName);
    }
  }, [pathname]);

  useEffect(() => {
    const fetchTestimony = async (id) => {
      try {
        const response = await fetch(`/api/testimony/${id}`);
        const data = await response.json();
        if (data.success) {
          setFormData(data.data);
          setImagePreview(data.data.image);
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Error fetching testimony:', error);
      }
    };

    if (params.id && section) {
      fetchTestimony(params.id);
    }
  }, [params.id, section]);

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

  const handleImageSelect = (imageUrl) => {
    console.log("Selected Image URL:", imageUrl);  // Log the URL for debugging
    setFormData({ ...formData, image: imageUrl });
    setImagePreview(imageUrl);
    setIsImageSelectionModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/testimony/${params.id}` : '/api/testimony';
    setLoading(true);

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
          router.push(`/dashboard/${section}`);
        } else {
          console.error('Failed to save testimony');
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/testimony/${params.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        router.push(`/dashboard/${section}`);
      } else {
        console.error('Failed to delete testimony');
      }
    } catch (error) {
      console.error('Error deleting testimony:', error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openImageSelectionModal = () => {
    setIsImageSelectionModalOpen(true);
  };

  const closeImageSelectionModal = () => {
    setIsImageSelectionModalOpen(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold'>Testimonial:</h2>
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
      <div className="mt-4">
        <label>
          Work:
          <input
            type="text"
            name="work"
            value={formData.work}
            onChange={handleChange}
            required
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
            required
            className="p-2 border rounded w-full resize-none outline-none text-black aspect-[6/1]"
          />
        </label>
      </div>
      <div className="mt-4">
        <label>
          Image:
          {imagePreview && <Image width={30} height={30} src={imagePreview} alt="Preview" className="w-32 h-32 object-cover my-2" />}
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className="p-2 border rounded w-full"
            accept="image/*"
          />
        </label>
        <button type="button" onClick={openImageSelectionModal} className="mt-2 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded">
          Select Image
        </button>
      </div>
      <div className="mt-4">
        <label>
          Star:
          <input
            type="number"
            name="star"
            value={formData.star}
            onChange={handleChange}
            required
            min="1"
            max="5"
            className="p-2 border rounded w-full outline-none text-black"
          />
        </label>
      </div>
      <div className="flex space-x-2 mt-4">
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded" disabled={loading}>
          {loading ? (
            <svg
              className="animate-spin h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="stroke-current text-white opacity-75"
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeWidth="4"
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
      <ImageSelectionModal
        isOpen={isImageSelectionModalOpen}
        onClose={closeImageSelectionModal}
        onSelectImage={handleImageSelect}
      />
    </form>
  );
}
