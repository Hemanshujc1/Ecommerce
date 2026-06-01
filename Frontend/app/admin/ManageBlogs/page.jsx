"use client";

import React, { useState, useEffect } from "react";
import AdminSearchFilter from "@/components/AdminSearchFilter/AdminSearchFilter";
import AdminPagination from "@/components/AdminPagination/AdminPagination";
import { API_BASE_URL } from "@/lib/api.config";
import { getImageUrl } from "@/lib/image.helper";
import Image from "next/image";
const page = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    description: "",
    date: "",
    image: null,
    existingImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/blogs`);
      const data = await res.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterAndSortBlogs();
  }, [blogs, searchTerm, sortBy, sortOrder]);

  const filterAndSortBlogs = () => {
    let filtered = [...blogs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBlogs(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("date");
    setSortOrder("desc");
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Sort options for the filter component
  const sortOptions = [
    { value: "date", label: "Date Created" },
    { value: "title", label: "Title" },
  ];

  const handleAddOrEditBlog = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("title", formData.title);
    form.append("short_description", formData.short_description);
    form.append("description", formData.description);
    form.append("date", formData.date);
    if (formData.image) form.append("image", formData.image);

    const url = editingId
      ? `${API_BASE_URL}/blogs/${editingId}`
      : `${API_BASE_URL}/blogs`;

    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        alert(editingId ? "Blog updated!" : "Blog added!");
        setFormData({ title: "", short_description: "", description: "", date: "", image: null, existingImage: null });
        setEditingId(null);
        setPreviewUrl(null);
        e.target.reset();
        fetchBlogs();
      } else {
        alert(data.message || "Failed to submit blog");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    const res = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setBlogs(blogs.filter((blog) => blog.id !== id));
    } else {
      alert("Failed to delete blog");
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      short_description: blog.short_description,
      description: blog.description,
      date: blog.date?.split("T")[0] || "", // strip time
      image: null,
      existingImage: blog.image,
    });
    setPreviewUrl(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="p-3 md:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <h1 className="text-lg md:text-2xl font-bold">Manage Blogs</h1>
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredBlogs.length)} of {filteredBlogs.length} blogs
        </div>
      </div>

      <form
        onSubmit={handleAddOrEditBlog}
        className={`space-y-6 p-6 md:p-8 rounded-2xl shadow-lg border mb-10 transition-colors ${
          editingId ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100"
        }`}
      >
        <div className="flex justify-between items-center border-b pb-4 mb-4 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingId ? "✎ Edit Blog" : "Add New Blog"}
          </h2>
          {editingId && (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              Editing Mode
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Blog Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              placeholder="Enter blog title..."
              value={formData.title}
              onChange={handleChange}
              maxLength={100}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <div className="text-xs text-right text-gray-500">{formData.title.length}/100</div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Publish Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Short Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Short Description <span className="text-red-500">*</span></label>
          <textarea
            name="short_description"
            placeholder="A brief summary of the blog..."
            value={formData.short_description}
            onChange={handleChange}
            rows={3}
            maxLength={250}
            required
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <div className="text-xs text-right text-gray-500">{formData.short_description.length}/250</div>
        </div>

        {/* Full Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Full Content <span className="text-red-500">*</span></label>
          <textarea
            name="description"
            placeholder="Write the full blog content here..."
            value={formData.description}
            onChange={handleChange}
            rows={8}
            maxLength={5000}
            required
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <div className="text-xs text-right text-gray-500">{formData.description.length}/5000</div>
        </div>

        {/* Image Upload & Preview */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700">Blog Cover Image {editingId ? "" : <span className="text-red-500">*</span>}</label>
          
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Display Preview */}
            {(previewUrl || formData.existingImage) && (
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0">
                <Image
                  src={previewUrl || getImageUrl(formData.existingImage)}
                  alt="Blog Preview"
                  fill
                  className="object-fit"
                />
              </div>
            )}

            <div className="flex-1 w-full">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                required={!editingId} // Required only when adding a new blog
                className="w-full p-3 border border-gray-300 border-dashed rounded-lg bg-gray-50 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                {editingId 
                  ? "Select a new image to replace the current one. Leave empty to keep existing image." 
                  : "Upload a high-quality cover image. Max size: 5MB."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition transform hover:-translate-y-0.5"
          >
            {editingId ? "Update Blog Post" : "Publish Blog Post"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: "",
                  short_description: "",
                  description: "",
                  date: "",
                  image: null,
                  existingImage: null,
                });
                setEditingId(null);
                setPreviewUrl(null);
              }}
              className="flex-1 bg-gray-500 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-600 transition"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Search and Filter */}
      <AdminSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOptions={sortOptions}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onClearFilters={clearFilters}
        totalItems={blogs.length}
        filteredItems={filteredBlogs.length}
        placeholder="Search blogs by title or description..."
      />

      {currentBlogs.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {filteredBlogs.length === 0 && blogs.length > 0 
              ? "No blogs match your filters" 
              : "No blogs found"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentBlogs.map((blog) => (
              <div
                key={blog.id}
                className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden relative"
              >
                {/* Action Buttons (Visible on Hover) */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => handleEdit(blog)}
                    title="Edit Blog"
                    className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white shadow-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    title="Delete Blog"
                    className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full text-red-600 hover:bg-red-600 hover:text-white shadow-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                {/* Blog Image */}
                <div className="relative w-full h-48 bg-gray-50 overflow-hidden">
                  <Image 
                    src={getImageUrl(blog.image)} 
                    alt={blog.title} 
                    fill 
                    className="object- group-hover:scale-105 transition-transform duration-500" 
                  />
                  {/* Subtle Gradient Overlay for Text Readability if needed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                {/* Blog Info */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">{blog.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4 flex-1">
                    {blog.short_description || blog.description}
                  </p>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto md:hidden">
                     {/* Mobile fallback actions since hover is hard on mobile */}
                     <span className="text-xs text-gray-400 font-medium">Tap top-right to edit</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredBlogs.length}
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </>
      )}
    </div>
  );
};

export default page;
