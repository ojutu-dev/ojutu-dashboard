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
  const [formData, setFormData] = useState({
    id: Date.now(),
    title: "",
    company: "",
    slug: "",
    brandId: "",
    serviceId: "",
    mainImage: null,
    headerImage: null,
    otherImage: null,
    ogdescription: "",
    address: "",
    keywords: [],
    body: "",
  });
  const [section, setSection] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [headerImagePreview, setHeaderImagePreview] = useState(null);
  const [otherImagePreview, setOtherImagePreview] = useState(null);
  const [brandOptions, setBrandOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [keywordOptions, setKeywordOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageSelectionModalOpen, setIsImageSelectionModalOpen] = useState(false);
  const [imageField, setImageField] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split("/");
      const sectionName = pathParts[pathParts.length - 2];
      setSection(sectionName);
    }
  }, [pathname]);

  useEffect(() => {
    if (params.id && section) {
      const fetchItem = async () => {
        try {
          const response = await fetch(`/api/portfolio/${params.id}`);
          const item = await response.json();
          console.log("Item:", item);
          if (response.ok) {
            setFormData({
              ...item,
              brandId: item.brand?._id || "",
              serviceId: item.service?._id || "",
              keywords: item.keywords?.map((k) => k._id) || [],
              body: Array.isArray(item.body) ? item.body.join("") : item.body || "",
            });
            setMainImagePreview(item.mainImage);
            setHeaderImagePreview(item.headerImage);
            setOtherImagePreview(item.otherImage);
            setIsEditing(true);
          } else {
            console.error("Failed to fetch item:", item);
          }
        } catch (error) {
          console.error("Error fetching item:", error);
        }
      };
      fetchItem();
    }
  }, [params.id, section]);

  useEffect(() => {
    const fetchBrandOptions = async () => {
      try {
        const response = await fetch("/api/brand");
        const data = await response.json();
        setBrandOptions(data.data || data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    const fetchServiceOptions = async () => {
      try {
        const response = await fetch("/api/service");
        const data = await response.json();
        setServiceOptions(data.data || data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    const fetchKeywordOptions = async () => {
      try {
        const response = await fetch("/api/keywords");
        const data = await response.json();
        setKeywordOptions(data.data || data);
      } catch (error) {
        console.error("Error fetching keywords:", error);
      }
    };

    fetchBrandOptions();
    fetchServiceOptions();
    fetchKeywordOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: reader.result,
        }));
        if (name === "mainImage") setMainImagePreview(reader.result);
        if (name === "headerImage") setHeaderImagePreview(reader.result);
        if (name === "otherImage") setOtherImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (name === "keywords") {
      const newKeywords = formData.keywords.includes(value)
        ? formData.keywords.filter((keyword) => keyword !== value)
        : [...formData.keywords, value];
      setFormData({ ...formData, keywords: newKeywords });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageSelect = (imageUrl) => {
    if (imageField) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [imageField]: imageUrl,
      }));
      if (imageField === "mainImage") setMainImagePreview(imageUrl);
      if (imageField === "headerImage") setHeaderImagePreview(imageUrl);
      if (imageField === "otherImage") setOtherImagePreview(imageUrl);
    }
    setIsImageSelectionModalOpen(false);
  };

  const handleSlugGeneration = () => {
    setFormData({
      ...formData,
      slug: formData.title.toLowerCase().replace(/\s+/g, "-"),
    });
  };

  const handleBodyChange = (value) => {
    setFormData({ ...formData, body: value });
  };

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        try {
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: base64Image }),
          });
          const result = await res.json();
          const imageUrl = result.url;
          const quill = this.quill;
          const range = quill.getSelection();
          quill.insertEmbed(range.index, 'image', imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      };
      reader.readAsDataURL(file);
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler,
      }
    }
  }), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.title ||
      !formData.company ||
      !formData.slug ||
      !formData.brandId ||
      !formData.serviceId ||
      !formData.keywords.length ||
      !formData.address
    ) {
      console.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const url = isEditing ? `/api/portfolio/${params.id}` : "/api/portfolio";
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        throw new Error("Failed to submit form");
      }

      const data = await response.json();
      if (isEditing) {
        updateItem(section, data.id, data);
      } else {
        addItem(section, data);
      }

      router.push(`/dashboard/${section}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = (itemId) => {
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/portfolio/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        deleteItem(section, formData.id);
        router.push(`/dashboard/${section}`);
      } else {
        console.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const openImageSelectionModal = (field) => {
    setImageField(field);
    setIsImageSelectionModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const closeImageSelectionModal = () => setIsImageSelectionModalOpen(false);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Portfolio:</h2>
        {formData.title && (
          <div className="text-lg font-bold">{formData.title}</div>
        )}
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
          Company:
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full outline-none text-black"
          />
        </label>
      </div>
      <div className="mt-4">
        <label className="w-full">Slug:</label>
        <div className="flex items-center">
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full outline-none text-black"
          />
          <button
            type="button"
            onClick={handleSlugGeneration}
            className="ml-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded w-3/12"
          >
            Generate Slug
          </button>
        </div>
      </div>
      <div className="mt-4">
        <label>
          Brand:
          <select
            name="brandId"
            value={formData.brandId}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full outline-none text-black"
          >
            <option value="">Select Brand</option>
            {brandOptions.map((brand, index) => (
              <option key={index} value={brand._id}>
                {brand.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Service:
          <select
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full outline-none text-black"
          >
            <option value="">Select Service</option>
            {serviceOptions.map((service, index) => (
              <option key={index} value={service._id}>
                {service.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Keywords:
          {keywordOptions.map((keyword, index) => (
            <div key={index} className="flex items-center">
              <input
                type="checkbox"
                name="keywords"
                value={keyword._id}
                checked={formData.keywords.includes(keyword._id)}
                onChange={handleChange}
                className="mr-2"
              />
              <span>{keyword.title}</span>
            </div>
          ))}
        </label>
      </div>
      <div className="mt-4">
        <label>
          Main Image:
          {mainImagePreview && (
            <Image
              width={30}
              height={30}
              src={mainImagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover my-2"
            />
          )}
          <input
            type="file"
            name="mainImage"
            onChange={handleChange}
            className="p-2 border rounded w-full"
            accept="image/*"
          />
          <button
            type="button"
            onClick={() => openImageSelectionModal("mainImage")}
            className="mt-2 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
          >
            Select Image From Cloud
          </button>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Header Image:
          {headerImagePreview && (
            <Image
              width={30}
              height={30}
              src={headerImagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover my-2"
            />
          )}
          <input
            type="file"
            name="headerImage"
            onChange={handleChange}
            className="p-2 border rounded w-full"
            accept="image/*"
          />
          <button
            type="button"
            onClick={() => openImageSelectionModal("headerImage")}
            className="mt-2 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
          >
            Select Image From Cloud
          </button>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Other Image:
          {otherImagePreview && (
            <Image
              width={30}
              height={30}
              src={otherImagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover my-2"
            />
          )}
          <input
            type="file"
            name="otherImage"
            onChange={handleChange}
            className="p-2 border rounded w-full"
            accept="image/*"
          />
          <button
            type="button"
            onClick={() => openImageSelectionModal("otherImage")}
            className="mt-2 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
          >
            Select Image From Cloud
          </button>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Address:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full outline-none text-black"
          />
        </label>
      </div>
      <div className="mt-4">
        <label>
          Description:
          <textarea
            name="ogdescription"
            value={formData.ogdescription}
            onChange={handleChange}
            required
            className="p-2 border rounded w-full resize-none aspect-[6/1] outline-none text-black"
          />
        </label>
      </div>
      <div className="mt-4">
        <label>
          Body:
          <ReactQuill
            value={formData.body}
            onChange={handleBodyChange}
            modules={modules}
            className="bg-white h-64"
          />
        </label>
      </div>
      <div className="mt-20 flex gap-3">
        <button
          type="submit"
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          disabled={loading}
        >
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
        <button
          type="button"
          onClick={handleCancel}
          className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
        >
          Cancel
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => handleDelete(params.id)}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
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
