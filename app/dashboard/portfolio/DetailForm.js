"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useContent } from "../../../context/ContentContext";
import dynamic from "next/dynamic";
import ConfirmationModal from "../../../components/ConfirmationModal";
import Image from "next/image";
import ImageSelectionModal from "../../../components/ImageSelectionModal";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function DetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { addItem, updateItem, deleteItem } = useContent();

  // Get section from URL
  const section = pathname.split("/")[pathname.split("/").length - 2];

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    slug: "",
    brandId: "",
    serviceId: "",
    address: "",
    ogdescription: "",
    keywords: [],
    body: "",
  });

  // File state
  const [files, setFiles] = useState({
    mainImage: null,
    headerImage: null,
    otherImage: null,
    ogImage: null,
  });

  // Image previews
  const [previews, setPreviews] = useState({
    mainImage: null,
    headerImage: null,
    otherImage: null,
    ogImage: null,
  });

  // Options for dropdowns
  const [brandOptions, setBrandOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [keywordOptions, setKeywordOptions] = useState([]);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageSelectionModalOpen, setIsImageSelectionModalOpen] =
    useState(false);
  const [imageField, setImageField] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch portfolio data if editing
  useEffect(() => {
    if (params.id) {
      const fetchItem = async () => {
        try {
          const response = await fetch(`/api/portfolio/${params.id}`);
          const item = await response.json();

          

          if (response.ok) {
            setFormData({
              title: item.title || "",
              company: item.company || "",
              slug: item.slug || "",
              brandId: item.brand?._id || "",
              serviceId: item.service?._id || "",
              keywords: item.keywords?.map((k) => k._id) || [],
              address: item.address || "",
              ogdescription: item.ogdescription || "",
              body: Array.isArray(item.body)
                ? item.body.join("")
                : item.body || "",
            });

            setPreviews({
              mainImage: item.mainImage || null,
              headerImage: item.headerImage || null,
              otherImage: item.otherImage || null,
              ogImage: item.ogImage || null,
            });

            setIsEditing(true);
          }
        } catch (error) {
          console.error("Error fetching portfolio:", error);
        }
      };

      fetchItem();
    }
  }, [params.id]);

  // Fetch options for dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch brands
        const brandsResponse = await fetch("/api/brand");
        const brandsData = await brandsResponse.json();
        setBrandOptions(brandsData.data || brandsData);

        // Fetch services
        const servicesResponse = await fetch("/api/service");
        const servicesData = await servicesResponse.json();
        setServiceOptions(servicesData.data || servicesData);

        // Fetch keywords
        const keywordsResponse = await fetch("/api/keywords");
        const keywordsData = await keywordsResponse.json();
        setKeywordOptions(keywordsData.data || keywordsData);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked, files: inputFiles } = e.target;

    // Handle file inputs
    if (inputFiles && inputFiles.length > 0) {
      const file = inputFiles[0];
      setFiles((prev) => ({ ...prev, [name]: file }));

      // Create and revoke preview URLs
      const previewUrl = URL.createObjectURL(file);
      if (previews[name]) {
        URL.revokeObjectURL(previews[name]);
      }
      setPreviews((prev) => ({ ...prev, [name]: previewUrl }));
      return;
    }

    // Handle checkbox inputs (keywords)
    if (type === "checkbox") {
      setFormData((prev) => {
        const newKeywords = checked
          ? [...prev.keywords, value]
          : prev.keywords.filter((id) => id !== value);
        return { ...prev, keywords: newKeywords };
      });
      return;
    }

    // Handle all other inputs
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image selection from cloud
  const handleImageSelect = (imageUrl) => {
    if (imageField) {
      setPreviews((prev) => ({ ...prev, [imageField]: imageUrl }));
      setFiles((prev) => ({ ...prev, [imageField]: null })); // Clear file if URL is selected
    }
    setIsImageSelectionModalOpen(false);
  };

  // Generate slug from title
  const handleSlugGeneration = () => {
    setFormData((prev) => ({
      ...prev,
      slug: prev.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, ""),
    }));
  };

  // Handle rich text editor changes
  const handleBodyChange = (value) => {
    setFormData((prev) => ({ ...prev, body: value }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (
      !formData.title ||
      !formData.company ||
      !formData.slug ||
      !formData.brandId ||
      !formData.serviceId ||
      formData.keywords.length === 0 ||
      !formData.address
    ) {
      alert("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Prepare FormData
    const formDataToSend = new FormData();

    // Append text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle keywords array
        value.forEach((item) => formDataToSend.append(key, item));
      } else {
        formDataToSend.append(key, value);
      }
    });

    // Append files if they exist, otherwise append existing URLs
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formDataToSend.append(key, file);
      } else if (previews[key] && !previews[key].startsWith("blob:")) {
        // If we have a non-blob URL (existing image), send it as a string
        formDataToSend.append(key, previews[key]);
      }
    });

    try {
      const url = isEditing ? `/api/portfolio?id=${params.id}` : "/api/portfolio";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend, // No Content-Type header needed for FormData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save portfolio");
      }

      const result = await response.json();
     
      if (isEditing) {
        updateItem(section, result.data?.id, result.data);
      } else {
        addItem(section, result.data);
      }
      router.push(`/dashboard/${section}`);
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

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
      const response = await fetch(`/api/portfolio/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete portfolio");

      deleteItem(section, params.id);
      router.push(`/dashboard/${section}`);
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "An error occurred while deleting");
    } finally {
      setIsModalOpen(false);
    }
  };

  // Open image selection modal
  const openImageSelectionModal = (field) => {
    setImageField(field);
    setIsImageSelectionModalOpen(true);
  };

  // Close modals
  const closeModal = () => setIsModalOpen(false);
  const closeImageSelectionModal = () => setIsImageSelectionModalOpen(false);

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
        <h2 className="text-2xl font-bold">Portfolio:</h2>
        {formData.title && <div className="text-lg font-bold">{formData.title}</div>}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Title Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title: *
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

        {/* Company Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company: *
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Slug Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug: *
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

        {/* Brand Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand: *
          </label>
          <select
            name="brandId"
            value={formData.brandId}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Brand</option>
            {brandOptions.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.title}
              </option>
            ))}
          </select>
        </div>

        {/* Service Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service: *
          </label>
          <select
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Service</option>
            {serviceOptions.map((service) => (
              <option key={service._id} value={service._id}>
                {service.title}
              </option>
            ))}
          </select>
        </div>

        {/* Keywords Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keywords: *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {keywordOptions.map((keyword) => (
              <div key={keyword._id} className="flex items-center">
                <input
                  type="checkbox"
                  name="keywords"
                  id={`keyword-${keyword._id}`}
                  value={keyword._id}
                  checked={formData.keywords.includes(keyword._id)}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`keyword-${keyword._id}`}
                  className="ml-2 block text-sm text-gray-900"
                >
                  {keyword.title}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Image Fields */}
        {["mainImage", "headerImage", "otherImage", "ogImage"].map(
          (imageType) => (
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
                    onLoad={() => {
                      if (previews[imageType]?.startsWith("blob:")) {
                        URL.revokeObjectURL(previews[imageType]);
                      }
                    }}
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
                  onClick={() => openImageSelectionModal(imageType)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                >
                  Select from Cloud
                </button>
              </div>
            </div>
          )
        )}

        {/* Project Class Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Class: *
          </label>
          <select
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Project Class</option>
            <option value="New Website">New Website</option>
            <option value="Redesign Project">Redesign Project</option>
          </select>
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description: *
          </label>
          <textarea
            name="ogdescription"
            value={formData.ogdescription}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 h-24"
          />
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
        message="Are you sure you want to delete this portfolio item?"
      />

      {/* Image Selection Modal */}
      <ImageSelectionModal
        isOpen={isImageSelectionModalOpen}
        onClose={closeImageSelectionModal}
        onSelectImage={handleImageSelect}
      />
    </form>
  );
}
