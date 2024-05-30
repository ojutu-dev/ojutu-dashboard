"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useContent } from "../../../context/ContentContext";
import ConfirmationModal from "../../../components/ConfirmationModal";

export default function ServiceDetailForm() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const { content, addItem, updateItem, deleteItem } = useContent();
  const [formData, setFormData] = useState({
    id: Date.now(),
    title: "",
    description: "",
  });
  const [section, setSection] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        (item) => item.id === params.id
      );
      if (item) {
        setFormData(item);
        setIsEditing(true);
      } else {
        const fetchService = async () => {
          try {
            const response = await fetch(`/api/service/${params.id}`);
            if (response.ok) {
              const service = await response.json();
              setFormData(service);
              setIsEditing(true);
            } else {
              console.error("Failed to fetch service:", response.statusText);
            }
          } catch (error) {
            console.error("Error fetching service:", error);
          }
        };

        fetchService();
      }
    }
  }, [params.id, section, content]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      try {
        const response = await fetch(`/api/service/${formData._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedService = await response.json();
          updateItem(section, formData._id, updatedService);
          router.push(`/dashboard/${section}`);
        } else {
          const errorData = await response.json();
          console.error("Failed to update service:", errorData);
        }
      } catch (error) {
        console.error("Error updating service:", error);
      }
    } else {
      try {
        const response = await fetch("/api/service", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newService = await response.json();
          addItem(section, newService);
          router.push(`/dashboard/${section}`);
        } else {
          const errorData = await response.json();
          console.error("Failed to create service:", errorData);
        }
      } catch (error) {
        console.error("Error creating service:", error);
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = async () => {
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/service/${formData._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        deleteItem(section, formData._id);
        router.push(`/dashboard/${section}`);
      } else {
        const errorData = await response.json();
        console.error("Failed to delete service:", errorData);
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Service:</h2>
        {formData.title && (
          <div className="text-lg font-bold">{formData.title}</div>
        )}
      </div>

      <div>
        <label>
          Name:
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
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">
          {isEditing ? "Update" : "Publish"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
        >
          Cancel
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
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
    </form>
  );
}
