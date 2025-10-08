"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const page = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("http://localhost:4001/blogs");
        const data = await res.json();
        setBlogs(data);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 md:px-12 bg-white text-black">
      <h1 className="text-4xl font-bold text-center mb-12">Our Latest Blogs</h1>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Link href={`/users/BlogDetailPage/${blog.id}`} key={blog.id}>
            <div
              key={blog.id}
              className="rounded-xl overflow-hidden shadow-lg bg-white hover:shadow-2xl transition"
            >
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
                <p className="text-sm text-gray-700">{blog.short_description}</p>
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

export default page;
