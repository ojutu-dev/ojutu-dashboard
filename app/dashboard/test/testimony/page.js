"use client"
import Image from 'next/image';
import { useState } from 'react';

export default function CreateTestimonyForm() {
  const [title, setTitle] = useState('');
  const [work, setWork] = useState('');
  const [image, setImage] = useState(null);
  const [star, setStar] = useState(1);
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file)
    if (file) {

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      title,
      work,
      image: image,
      star,
      content,
    };

    try {
      const res = await fetch('/api/testimony', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Testimony created successfully!');
        setTitle('');
        setWork('');
        setImage(null);
        setStar(1);
        setContent('');
        setImagePreview(null);
      } else {
        const errorResponse = await res.json();
        setMessage(`Failed to create testimony: ${errorResponse.message}`);
      }
    } catch (error) {
      setMessage('An error occurred while creating the testimony.');
      console.error('Error creating testimony:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Create New Testimony</h1>
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
          <label className="block text-sm font-medium text-gray-700">Work</label>
          <input
            type="text"
            value={work}
            onChange={(e) => setWork(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            
          />
          {imagePreview && (
            <div className="mt-4">
              <Image src={imagePreview} alt="Image Preview" width={300} height={300} className="w-40 h-auto" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Star Rating</label>
          <input
            type="number"
            value={star}
            onChange={(e) => setStar(e.target.value)}
            min="1"
            max="5"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Create Testimony
        </button>
      </form>

      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
}
