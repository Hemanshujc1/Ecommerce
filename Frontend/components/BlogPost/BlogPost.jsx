"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const BlogPost = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("http://localhost:4001/blogs");
        const data = await res.json();

        // Sort by date (assuming blog.date is a valid ISO or timestamp string)
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestThree = sorted.slice(0, 3);
        setBlogs(latestThree);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="px-6 relative">
      {/* Header */}
      <div className="flex justify-between text-black mb-6">
        <h2 className="text-xl font-bold">Read Blog Posts</h2>
        <Link href="/users/Blogs">
          <button className="text-sm underline font-semibold">VIEW ALL</button>
        </Link>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 transition-all duration-500">
        {blogs.map((blog) => (
          <Link href={`/users/BlogDetailPage/${blog.id}`} key={blog.id}>
            <div className="h-[55vh] rounded-xl overflow-hidden shadow-lg bg-white hover:shadow-2xl transition">
              <div className="relative h-60 w-full">
                <Image
                  src={`http://localhost:4001${blog.image}`}
                  alt={blog.title}
                  width={300}
                  height={200}
                  className="object-fill w-full h-full"
                />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <p className="text-sm text-gray-500">
                  {new Date(blog.date).toDateString()}
                </p>
                <h2 className="text-xl font-semibold">{blog.title}</h2>
                <p className="text-sm text-gray-700">
                  {blog.short_description}
                </p>
                <button className="mt-2 self-start text-blue-600 hover:underline text-sm font-medium">
                  Read More →
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogPost;
