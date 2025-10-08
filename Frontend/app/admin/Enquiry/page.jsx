"use client";

import React, { useState, useEffect } from "react";
import AdminSearchFilter from "@/components/AdminSearchFilter/AdminSearchFilter";
import AdminPagination from "@/components/AdminPagination/AdminPagination";

const Page = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  // Fetch enquiries from /users/enquiry
  const fetchEnquiries = async () => {
    try {
      const res = await fetch("http://localhost:4001/users/Enquiry");
      const data = await res.json();
      setEnquiries(data);
    } catch (err) {
      console.error("Error fetching enquiries:", err);
      setError("Failed to fetch enquiries");
    }
  };

  // Fetch newsletters from /users/newsletter
  const fetchNewsletters = async () => {
    try {
      const res = await fetch("http://localhost:4001/users/Newsletter");
      const data = await res.json();
      setNewsletters(data);
    } catch (err) {
      console.error("Error fetching newsletters:", err);
      setError("Failed to fetch newsletter subscriptions");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEnquiries(), fetchNewsletters()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDelete = async (type, id) => {
    const confirm = window.confirm("Are you sure you want to delete this entry?");
    if (!confirm) return;

    try {
      const url =
        type === "enquiry"
          ? `http://localhost:4001/users/allEnquiry/${id}`
          : `http://localhost:4001/users/Newsletter/${id}`;
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      if (type === "enquiry") {
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
      } else {
        setNewsletters((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      setError("Error deleting entry");
    }
  };

  const getRawData = () => {
    return activeTab === "all"
      ? [
          ...enquiries.map((e) => ({
            ...e,
            source: "Contact Form",
            message: e.message || "-",
            date: e.submitted_at?.split("T")[0] || "",
            type: "enquiry",
          })),
          ...newsletters.map((n) => ({
            name:  n.name || "-",
            email: n.email,
            source: "Newsletter",
            message: "Subscribed via newsletter",
            date: n.subscribed_at?.split("T")[0] || "",
            id: n.id,
            type: "newsletter",
          })),
        ]
      : activeTab === "enquiry"
      ? enquiries.map((e) => ({
          ...e,
          source: "Contact Form",
          message: e.message || "-",
          date: e.created_at?.split("T")[0] || "",
          type: "enquiry",
        }))
      : newsletters.map((n) => ({
          name: n.name || "-",
          email: n.email,
          message: "Subscribed via newsletter",
          source: "Newsletter",
          date: n.subscribed_at?.split("T")[0] || "",
          id: n.id,
          type: "newsletter",
        }));
  };

  const getFilteredData = () => {
    let data = getRawData();

    // Search filter
    if (searchTerm) {
      data = data.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    data.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'date') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
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

    return data;
  };

  const filteredData = getFilteredData();

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("date");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // Sort options
  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "source", label: "Source" },
  ];

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
        <h1 className="text-2xl font-bold">Enquiry Management</h1>
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
        </div>
      </div>

      {/* Tab Filters */}
      <div className="flex gap-4 mb-6">
        {["all", "enquiry", "newsletter"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab === "all"
              ? `All (${enquiries.length + newsletters.length})`
              : tab === "enquiry"
              ? `Contact Enquiries (${enquiries.length})`
              : `Newsletter Subscribers (${newsletters.length})`}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

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
        totalItems={getRawData().length}
        filteredItems={filteredData.length}
        placeholder="Search by name, email, or message..."
      />

      {currentData.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {filteredData.length === 0 && getRawData().length > 0 
              ? "No entries match your filters" 
              : "No records found"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((entry) => (
                  <tr key={`${entry.type}-${entry.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{entry.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.source === 'Contact Form' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {entry.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(entry.type, entry.id)}
                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </>
      )}
    </div>
  );
};

export default Page;
