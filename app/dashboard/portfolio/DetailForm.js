import { useRouter, usePathname, useParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { useContent } from "../../../context/ContentContext";
import JoditEditor from "jodit-react";
import ConfirmationModal from "../../../components/ConfirmationModal";

export default function DetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { content, addItem, updateItem, deleteItem } = useContent();
  const [formData, setFormData] = useState({
    id: Date.now(),
    title: "",
    company: "",
    slug: "",
    categoryId: "",
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
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [keywordOptions, setKeywordOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const editor = useRef(null);

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
          if (response.ok) {
            setFormData({
              ...item,
              categoryId: item.service?._id || "",
              brandId: item.brand?._id || "",
              serviceId: item.service?._id || "",
              keywords: item.keywords?.map((k) => k._id) || [],
              body: Array.isArray(item.body)
                ? item.body.join("")
                : item.body || "", // Ensure body is a string
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
    const fetchCategoryOptions = async () => {
      try {
        const response = await fetch("/api/service");
        const data = await response.json();
        if (data.success !== false) {
          setCategoryOptions(data.data || data);
        } else {
          console.error("Failed to fetch services");
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    const fetchBrandOptions = async () => {
      try {
        const response = await fetch("/api/brand");
        const data = await response.json();
        if (data.success !== false) {
          setBrandOptions(data.data || data);
        } else {
          console.error("Failed to fetch brands");
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    const fetchServiceOptions = async () => {
      try {
        const response = await fetch("/api/service");
        const data = await response.json();
        if (data.success !== false) {
          setServiceOptions(data.data || data);
        } else {
          console.error("Failed to fetch services");
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    const fetchKeywordOptions = async () => {
      try {
        const response = await fetch("/api/keywords");
        const data = await response.json();
        if (data.success !== false) {
          setKeywordOptions(data.data || data);
        } else {
          console.error("Failed to fetch keywords");
        }
      } catch (error) {
        console.error("Error fetching keywords:", error);
      }
    };

    fetchCategoryOptions();
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

  const handleSlugGeneration = () => {
    setFormData({
      ...formData,
      slug: formData.title.toLowerCase().replace(/\s+/g, "-"),
    });
  };

  const handleBodyChange = (value) => {
    setFormData({ ...formData, body: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation before submission
    if (
      !formData.title ||
      !formData.company ||
      !formData.slug ||
      !formData.categoryId ||
      !formData.brandId ||
      !formData.serviceId ||
      !formData.keywords.length ||
      !formData.address
    ) {
      console.error("Please fill in all required fields.");
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
        updateItem(section, data._id, data);
      } else {
        addItem(section, data._id, data);
      }

      router.push(`/dashboard/${section}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = (itemId) => {
    setItemToDelete(itemId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/portfolio/${itemToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      deleteItem(section, itemToDelete);
      router.push(`/dashboard/${section}`);
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const config = useMemo(
    () => ({
      toolbarAdaptive: false,
      buttons: "paragraph,|,bold,italic,ul,paste,selectall,file,image",
      uploader: {
        insertImageAsBase64URI: true,
        imagesExtensions: ["jpg", "png", "jpeg", "gif"],
        url: "/api/upload",
        format: "json",
        method: "POST",
        headers: {
          Authorization: "Bearer your-access-token",
        },
        filesVariableName: function (t) {
          return "files[" + t + "]";
        },
        process: function (resp) {
          return {
            files: resp.files.map(function (file) {
              return {
                name: file.name,
                size: file.size,
                type: file.type,
                url: file.url,
                thumb: file.url,
                error: file.error,
              };
            }),
            path: resp.path,
            baseurl: resp.baseurl,
          };
        },
      },
      placeholder: "Start typing...",
    }),
    []
  );

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
            className="p-2 border rounded w-full outline-none text-black"
          />
        </label>
      </div>
      <div className="mt-4 flex items-center">
        <label className="w-full">
          Slug:
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          />
        </label>
        <button
          type="button"
          onClick={handleSlugGeneration}
          className="ml-2 p-2 bg-blue-500 text-white rounded"
        >
          Generate Slug
        </button>
      </div>
      <div className="mt-4">
        <label>
          Category:
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          >
            <option value="">Select Category</option>
            {categoryOptions.map((category, index) => (
              <option key={index} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4">
        <label>
          Brand:
          <select
            name="brandId"
            value={formData.brandId}
            onChange={handleChange}
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
            <img
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
        </label>
      </div>
      <div className="mt-4">
        <label>
          Header Image:
          {headerImagePreview && (
            <img
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
        </label>
      </div>
      <div className="mt-4">
        <label>
          Other Image:
          {otherImagePreview && (
            <img
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
            className="p-2 border rounded w-full resize-none aspect-[6/1] outline-none text-black"
          />
        </label>
      </div>
      <div className="mt-4">
        <label>
          Body:
          <JoditEditor
            ref={editor}
            value={formData.body}
            onChange={handleBodyChange}
            config={config}
            className="bg-white"
          />
        </label>
      </div>
      <div className="mt-4 flex gap-3">
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          {isEditing ? "Update" : "Publish"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => handleDelete(params.id)}
            className="p-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={handleCancel}
          className="p-2 bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
      />
    </form>
  );
}
