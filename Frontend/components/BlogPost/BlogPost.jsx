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
    <div className="px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center text-black mb-6">
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 uppercase">Read Blog Posts</h2>
        <Link href="/users/Blogs">
          <button className="text-xs text-gray-400 hover:text-black hover:underline font-bold uppercase tracking-widest transition">
            VIEW ALL
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Link href={`/users/BlogDetailPage/${blog.id}`} key={blog.id}>
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white hover:shadow-md transition-all duration-305 h-full flex flex-col group cursor-pointer">
              <div className="relative h-48 sm:h-56 w-full flex-shrink-0 overflow-hidden bg-gray-50">
                <Image
                  src={getImageUrl(blog.image)}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex flex-col gap-2 flex-grow text-black">
                <p className="text-xs text-gray-400">
                  {new Date(blog.date).toDateString()}
                </p>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3 flex-grow">
                  {blog.short_description}
                </p>
                <span className="mt-4 text-xs font-bold uppercase tracking-widest text-black group-hover:underline flex items-center gap-1">
                  Read More <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogPost;
