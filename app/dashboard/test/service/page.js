"use client"
import { useState } from 'react';

export default function CreateCategoryForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      title,
      description,
    };

    try {
      const res = await fetch('/api/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Service created successfully!');
        setTitle('');
        setDescription('');
      } else {
        const errorResponse = await res.json();
        setMessage(`Failed to create service: ${errorResponse.message}`);
      }
    } catch (error) {
      setMessage('An error occurred while creating the service.');
      console.error('Error creating service:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Create New Service</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Create Service
        </button>
      </form>

      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
}
