"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api.config";
import { getImageUrl } from "@/lib/image.helper";

const page = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/blogs`);
        const data = await res.json();
        setBlogs(data);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-12 bg-white text-black">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">Our Latest Blogs</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {blogs.map((blog) => (
          <Link href={`/users/BlogDetailPage/${blog.id}`} key={blog.id}>
            <div className="rounded-xl overflow-hidden shadow-lg bg-white hover:shadow-2xl transition h-full flex flex-col">
              <div className="relative h-48 sm:h-56 w-full">
                <Image src={getImageUrl(blog.image)} alt={blog.title} fill className="object-cover" />
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <p className="text-xs text-gray-500">{new Date(blog.date).toDateString()}</p>
                <h2 className="text-base sm:text-lg font-semibold line-clamp-2">{blog.title}</h2>
                <p className="text-sm text-gray-700 line-clamp-3 flex-1">{blog.short_description}</p>
                <span className="mt-2 self-start text-blue-600 hover:underline text-sm font-medium">Read More →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>  );
};

export default page;
