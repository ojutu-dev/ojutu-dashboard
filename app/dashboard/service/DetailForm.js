"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useContent } from "../../../context/ContentContext";

export default function ServiceDetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { content, addItem, updateItem, deleteItem } = useContent();
  const [formData, setFormData] = useState({
    id: Date.now(),
    name: "",
    description: "",
  });
  const [section, setSection] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split("/");
      const sectionName = pathParts[pathParts.length - 2];
      setSection(sectionName);
    }
  }, [pathname]);

  useEffect(() => {
    if (params.id && section) {
      const item = content[section]?.find(
        (item) => item.id === parseInt(params.id)
      );
      if (item) {
        setFormData(item);
        setIsEditing(true);
      }
    }
  }, [params.id, section, content]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateItem(section, formData.id, formData);
    } else {
      addItem(section, formData);
    }
    router.push(`/dashboard/${section}`);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = () => {
    deleteItem(section, formData.id);
    router.push(`/dashboard/${section}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Service:</h2>
        {formData.name && (
          <div className="text-lg font-bold">{formData.name}</div>
        )}
      </div>

      <div>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black"
          />
        </label>
      </div>
      <div className="mt-4">
        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="p-2 border rounded w-full outline-none text-black resize-none aspect-[6/1]"
          />
        </label>
      </div>

      <div className="flex space-x-2 mt-4">
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {isEditing ? "Update" : "Submit"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-500 text-white p-2 rounded"
        >
          Cancel
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white p-2 rounded"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
