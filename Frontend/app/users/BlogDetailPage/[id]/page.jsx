"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const page = () => {
    console.log("Fetching blog wvith ID:");
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      try {
        const res = await fetch(`http://localhost:4001/blogs/${id}`);
        console.log("Fetching blog with ID:", res);
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
      }
    };
    fetchBlog();
  }, [id]);

  if (!blog) return <div>Loading or not found...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col items-start gap-5">
      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
      <p className="text-sm text-gray-500 mb-4">
        Posted on {new Date(blog.date).toDateString()}
      </p>
      {blog.image && (
        <Image
          src={`http://localhost:4001${blog.image}`}
          alt={blog.title}
          width={800}
          height={400}
          className="mb-6 rounded"
        />
      )}
      <p className="text-lg text-gray-700">{blog.short_description}</p>

      <p className="text-lg text-gray-700">{blog.description}</p>
    </div>
  );
};

export default page;
