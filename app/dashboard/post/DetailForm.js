"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useContent } from "../../../context/ContentContext";
import ConfirmationModal from "../../../components/ConfirmationModal";
import Image from "next/image";
import ImageSelectionModal from "../../../components/ImageSelectionModal";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function DetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { content, addItem, updateItem, deleteItem } = useContent();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    categoryId: "",
    authorId: "",
    body: "",
  });

  // File state
  const [files, setFiles] = useState({
    headerImage: null,
    featuredImage: null,
    ogImage: null,
  });

  // Image previews
  const [previews, setPreviews] = useState({
    headerImage: null,
    featuredImage: null,
    ogImage: null,
  });

  // Other state variables
  const [section, setSection] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [authorOptions, setAuthorOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageSelectionModalOpen, setIsImageSelectionModalOpen] = useState({
    header: false,
    featured: false,
    og: false,
  });
  const [loading, setLoading] = useState(false);

  // Set section from URL
  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split("/");
      const sectionName = pathParts[pathParts.length - 2];
      setSection(sectionName);
    }
  }, [pathname]);

  // Fetch post data if editing
  useEffect(() => {
    if (params.id && section) {
      const fetchPostData = async () => {
        try {
          const response = await fetch(`/api/post?id=${params.id}`);
          const data = await response.json();
             
         

          if (response.ok) {
            setFormData({
              title: data?.data.title || "",
              slug: data?.data.slug || "",
              description: data?.data.description || "",
              categoryId: data?.data.category?._id || "",
              authorId: data?.data.author?._id || "",
              body: Array.isArray(data?.data.body)
                ? data?.data.body.join("")
                : data?.data.body || "",
            });

            

            // Set existing image URLs as previews
            setPreviews({
              headerImage: data?.data.headerImage || null,
              featuredImage: data?.data.featuredImage || null,
              ogImage: data?.data.ogImage || null,
            });

            setIsEditing(true);
          }
        } catch (error) {
          console.error("Error fetching post data:", error);
        }
      };
      fetchPostData();
    }
  }, [params.id, section]);

 

  // Fetch category and author options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch("/api/category");
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.length > 0) {
          setCategoryOptions(categoriesData);
        }

        // Fetch authors
        const authorsResponse = await fetch("/api/author");
        const authorsData = await authorsResponse.json();
        if (authorsData.success) {
          setAuthorOptions(authorsData.data);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, files: inputFiles } = e.target;

    if (inputFiles && inputFiles.length > 0) {
      const file = inputFiles[0];
      setFiles((prev) => ({ ...prev, [name]: file }));

      // Create preview URL and clean up previous one
      if (previews[name]) {
        URL.revokeObjectURL(previews[name]);
      }
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [name]: previewUrl }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle image selection from cloud
  const handleImageSelect = (imageUrl, type) => {
    setPreviews((prev) => ({ ...prev, [type]: imageUrl }));
    setFiles((prev) => ({ ...prev, [type]: null })); // Clear file if URL is selected

    setIsImageSelectionModalOpen((prev) => ({
      ...prev,
      [type.replace("Image", "")]: false,
    }));
  };

  // Generate slug from title
  const handleSlugGeneration = () => {
    setFormData((prev) => ({
      ...prev,
      slug: prev.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, ""),
    }));
  };

  // Handle rich text editor changes
  const handleBodyChange = (value) => {
    setFormData((prev) => ({ ...prev, body: value || "" }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();

    // Append text fields
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    // Append files if they exist
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formDataToSend.append(key, file);
      } else if (previews[key] && !previews[key].startsWith("blob:")) {
        // If we have a non-blob URL (existing image), send it as a string
        formDataToSend.append(key, previews[key]);
      }
    });
    

    try {
      const url = isEditing ? `/api/post?id=${params.id}` : "/api/post";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });
      console.log(response)

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save post");
      }

      const result = await response.json();    

      if (isEditing) {
        updateItem(section, result?.id, result);
      } else {
        addItem(section, result);
      }
      router.push(`/dashboard/${section}`);
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "An error occurred while saving the post");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    router.back();
  };

  // Handle delete action
  const handleDelete = () => {
    setIsModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/post/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete post");

      deleteItem(section, params.id);
      router.push(`/dashboard/${section}`);
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "An error occurred while deleting the post");
    } finally {
      setIsModalOpen(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Quill editor configuration
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["bold", "italic", "underline", "strike"],
        ["link", "image"],
        [{ align: [] }],
      ],
    }),
    []
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Post:</h2>
        {formData.title && (
          <div className="text-lg font-bold">{formData.title}</div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Title Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title:
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Slug Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleSlugGeneration}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Image Fields */}
        {["headerImage", "featuredImage", "ogImage"].map((imageType) => (
          <div key={imageType}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {imageType
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
              :
            </label>
            {previews[imageType] && (
              <div className="mb-2">
                <Image
                  width={200}
                  height={200}
                  src={previews[imageType]}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md"
                />
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="file"
                name={imageType}
                onChange={handleChange}
                className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() =>
                  setIsImageSelectionModalOpen((prev) => ({
                    ...prev,
                    [imageType.replace("Image", "")]: true,
                  }))
                }
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Select from Cloud
              </button>
            </div>
          </div>
        ))}

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description:
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 h-24"
          />
        </div>

        {/* Category and Author Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category:
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Category</option>
              {categoryOptions.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author:
            </label>
            <select
              name="authorId"
              value={formData.authorId}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Author</option>
              {authorOptions.map((author) => (
                <option key={author._id} value={author._id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Body Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Body:
          </label>
          <ReactQuill
            value={formData.body}
            onChange={handleBodyChange}
            modules={quillModules}
            className="bg-white rounded-md border border-gray-300"
            style={{ height: "400px" }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          >
            Cancel
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isEditing ? "Updating..." : "Publishing..."}
              </span>
            ) : isEditing ? (
              "Update"
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this post?"
      />

      {/* Image Selection Modals */}
      {Object.entries(isImageSelectionModalOpen).map(([type, isOpen]) => (
        <ImageSelectionModal
          key={type}
          isOpen={isOpen}
          onClose={() =>
            setIsImageSelectionModalOpen((prev) => ({ ...prev, [type]: false }))
          }
          onSelectImage={(imageUrl) =>
            handleImageSelect(imageUrl, `${type}Image`)
          }
        />
      ))}
    </form>
  );
}
