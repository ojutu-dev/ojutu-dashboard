"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const Testimonies = () => {
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestimonies = async () => {
      try {
        const response = await fetch('/api/testimony');
        const data = await response.json();

        if (data.success) {
          setTestimonies(data.data);
        } else {
          setError('Failed to fetch testimonies');
          console.log(error)
        }
      } catch (err) {
        setError('An error occurred while fetching testimonies');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonies();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="">
      {testimonies.map((testimony) => (
        <div key={testimony._id} className="testimony flex items-center gap-8">
          <Image
            src={testimony.image}
            alt={testimony.title}
            width={50}
            height={20}
            className="testimony-image rounded-full"
          />
          <h3 className="testimony-title">{testimony.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default Testimonies;
