"use client"
import { useState } from 'react';
import { generateSlug, checkSlugExists } from '../../../../libs/slug';
import Image from 'next/image';

export default function CreateAuthorForm() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
    }
  };

  const handleGenerateSlug = async () => {
    if (name) {
      let newSlug = generateSlug(name);
      let exists = await checkSlugExists(newSlug, 'author');
      let counter = 1;

      while (exists) {
        newSlug = `${generateSlug(name)}-${counter}`;
        exists = await checkSlugExists(newSlug, 'author');
        counter++;
      }

      setSlug(newSlug);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name,
      slug,
      image,
      description,
    };

    try {
      const res = await fetch('/api/author', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        setMessage('Author created successfully!');
        setName('');
        setSlug('');
        setImage(null);
        setDescription('');
        setImagePreview(null);
      } else {
        const errorResponse = await res.json();
        setMessage(`Failed to create author: ${errorResponse.message}`);
      }
    } catch (error) {
      setMessage('An error occurred while creating the author.');
      console.error('Error creating author:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Create New Author</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleGenerateSlug}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Generate Slug
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Author Image</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {imagePreview && (
            <div className="mt-4">
              <Image src={imagePreview} alt="Image Preview" width={300} height={300} className="w-40 h-auto" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Create Author
        </button>
      </form>

      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
}
