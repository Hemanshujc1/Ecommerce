"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api.config";
import { getImageUrl } from "@/lib/image.helper";

const BlogPost = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/blogs`);
        const data = await res.json();
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setBlogs(sorted.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-10">
      <div className="flex justify-between items-center text-black mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Read Blog Posts</h2>
        <Link href="/users/Blogs">
          <button className="text-sm underline font-semibold hover:opacity-70">VIEW ALL</button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Link href={`/users/BlogDetailPage/${blog.id}`} key={blog.id}>
            <div className="rounded-xl overflow-hidden shadow-lg bg-white hover:shadow-2xl transition h-full flex flex-col">
              <div className="relative h-48 sm:h-56 w-full flex-shrink-0">
                <Image
                  src={getImageUrl(blog.image)}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <p className="text-xs text-gray-500">{new Date(blog.date).toDateString()}</p>
                <h2 className="text-base sm:text-lg font-semibold line-clamp-2">{blog.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-3 flex-1">{blog.short_description}</p>
                <span className="mt-2 text-blue-600 hover:underline text-sm font-medium">Read More →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogPost;
