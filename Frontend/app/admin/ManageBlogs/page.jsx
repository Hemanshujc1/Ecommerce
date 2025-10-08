"use client";

import React, { useState, useEffect } from "react";
import AdminSearchFilter from "@/components/AdminSearchFilter/AdminSearchFilter";
import AdminPagination from "@/components/AdminPagination/AdminPagination";

const page = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    short_description:"",
    description: "",
    date: "",
    image: null,
  });

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
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4001/blogs");
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
      ? `http://localhost:4001/blogs/${editingId}`
      : "http://localhost:4001/blogs";

    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        alert(editingId ? "Blog updated!" : "Blog added!");
        setFormData({ title: "",short_description:"", description: "", date: "", image: null });
        setEditingId(null);
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
    const res = await fetch(`http://localhost:4001/blogs/${id}`, {
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
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Blogs</h1>
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredBlogs.length)} of {filteredBlogs.length} blogs
        </div>
      </div>

      <form
        onSubmit={handleAddOrEditBlog}
        className={`space-y-4 p-6 rounded-xl shadow max-w-3xl mb-8 ${
          editingId ? "bg-yellow-50" : "bg-white"
        }`}
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Blog" : "Add New Blog"}
        </h2>

        <input
          type="text"
          name="title"
          placeholder="Blog Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
         <textarea
          name="short_description"
          placeholder="Short Description"
          value={formData.short_description}
          onChange={handleChange}
          rows={4}
          className="w-full p-2 border rounded"
        />

        <textarea
          name="description"
          placeholder="Blog Description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full p-2 border rounded"
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? "Update Blog" : "Add Blog"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: "",
                  short_description:"",
                  description: "",
                  date: "",
                  image: null,
                });
                setEditingId(null);
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
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
          <div className="space-y-4">
            {currentBlogs.map((blog) => (
              <div
                key={blog.id}
                className="border rounded-lg p-4 bg-white shadow flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-1 flex-1">
                  <h3 className="text-lg font-bold">{blog.title}</h3>
                  <p className="text-gray-600 text-sm">{blog.short_description}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{blog.description}</p>
                  <p className="text-gray-400 text-sm">Posted on: {new Date(blog.date).toLocaleDateString()}</p>
                </div>
                <div className="mt-2 md:mt-0 flex gap-2">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="bg-yellow-500 text-white text-sm px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
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
