import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageSelectionModal = ({ isOpen, onClose, onSelectImage }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/cloudinary-images');
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 h-4/5 overflow-y-auto relative">
        <button
          className="bg-red-500 text-white py-1 px-3 rounded-md fixed top-4 right-4 z-10"
          onClick={onClose}
        >
          Cancel
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {images.map((image) => (
              <Image
                width={500}
                height={500}
                key={image.public_id}
                src={image.url}
                alt={image.public_id}
                onClick={() => {
                  onSelectImage(image.url);
                  onClose();
                }}
                className="w-full h-auto cursor-pointer rounded-lg transition-transform transform hover:scale-105"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSelectionModal;
