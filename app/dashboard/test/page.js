"use client";
import React, { useState, useEffect } from 'react';
import { generateSlug, checkSlugExists } from '../../../libs/slug';
import Image from 'next/image';
import Link from 'next/link';
import JoditEditor from 'jodit-react';
import axios from 'axios';

export default function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ogImage, setOgImage] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [headerImagePreview, setHeaderImagePreview] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [body, setBody] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryOptions = async () => {
      try {
        const response = await fetch('/api/category');
        const data = await response.json();
        console.log('Fetched categories:', data);
        if (data.length > 0) {
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchAuthorOptions = async () => {
      try {
        const response = await fetch('/api/author');
        const data = await response.json();
        console.log('Fetched authors:', data);
        if (data.success) {
          setAuthors(data.data);
        } else {
          console.error('Failed to fetch authors');
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };

    fetchCategoryOptions();
    fetchAuthorOptions();
  }, []);

  const handleImageChange = (e, setImage, setImagePreview) => {
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
    if (title) {
      let newSlug = generateSlug(title);
      let exists = await checkSlugExists(newSlug, 'post');
      let counter = 1;

      while (exists) {
        newSlug = `${generateSlug(title)}-${counter}`;
        exists = await checkSlugExists(newSlug, 'post');
        counter++;
      }

      setSlug(newSlug);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      title,
      description,
      slug,
      featuredImage,
      headerImage,
      ogImage,
      authorId: selectedAuthor,
      categoryId: selectedCategory,
      body,
    };

    try {
      const res = await fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Post created successfully!');
        setTitle('');
        setSlug('');
        setDescription('');
        setFeaturedImage(null);
        setImagePreview(null);
        setHeaderImage(null);
        setHeaderImagePreview(null);
        setOgImage(null);
        setOgImagePreview(null);
        setSelectedAuthor('');
        setSelectedCategory('');
        setBody('');
      } else {
        const errorResponse = await res.json();
        setMessage(`Failed to create post: ${errorResponse.message}`);
        setError(errorResponse.error);
      }
    } catch (error) {
      setMessage('An error occurred while creating the post.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Create New Post</h1>
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
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Header Image</label>
          <input
            type="file"
            onChange={(e) => handleImageChange(e, setHeaderImage, setHeaderImagePreview)}
            accept="image/*"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {headerImagePreview && (
            <div className="mt-4">
              <img src={headerImagePreview} alt="Image Preview" className="w-40 h-auto" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Featured Image</label>
          <input
            type="file"
            onChange={(e) => handleImageChange(e, setFeaturedImage, setImagePreview)}
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
          <label className="block text-sm font-medium text-gray-700">Og Image</label>
          <input
            type="file"
            onChange={(e) => handleImageChange(e, setOgImage, setOgImagePreview)}
            accept="image/*"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
          {ogImagePreview && (
            <div className="mt-4">
              <img src={ogImagePreview} alt="Image Preview" className="w-40 h-auto" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Author</label>
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select an author</option>
            {authors.map((author) => (
              <option key={author._id} value={author._id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Body</label>
          <JoditEditor
            value={body}
            onChange={(newBody) => setBody(newBody)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Create Post
        </button>
      </form>

      {message && <p className="mt-4 text-green-500">{message}</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
}
