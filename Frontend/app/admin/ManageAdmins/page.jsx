"use client";
import React, { useState, useEffect } from "react";
import AdminSearchFilter from "@/components/AdminSearchFilter/AdminSearchFilter";
import AdminPagination from "@/components/AdminPagination/AdminPagination";

const Page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4001/admins/getAllAdmins", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setAccessDenied(true);
          return;
        }
        console.error("Failed to fetch admins:", data.message);
        throw new Error("Failed to fetch admins");
      }
      setAdmins(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch("http://localhost:4001/admins/profile", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAdminProfile(data);
          
          // Only fetch admins if user is main_admin
          if (data.role === 'main_admin') {
            await fetchAdmins();
          } else {
            setAccessDenied(true);
            setLoading(false);
          }
        } else {
          setAccessDenied(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch admin profile", err);
        setAccessDenied(true);
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  useEffect(() => {
    filterAndSortAdmins();
  }, [admins, searchTerm, sortBy, sortOrder]);

  const filterAndSortAdmins = () => {
    let filtered = [...admins];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.id.toString().includes(searchTerm)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAdmins(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdmins = filteredAdmins.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("id");
    setSortOrder("desc");
  };

  // Sort options
  const sortOptions = [
    { value: "id", label: "ID" },
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "role", label: "Role" },
  ];
  

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:4001/admins/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }
      setAdmins((prev) => [...prev, data]); // optional: if backend returns newly created admin
      // ✅ Clear input fields
    setName("");
    setEmail("");
    setPassword("");
    // ✅ Refresh admin list
    await fetchAdmins();

      
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      const res = await fetch(
        `http://localhost:4001/admins/deleteAdmin/${adminId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete admin");
      }

      setAdmins((prevAdmins) =>
        prevAdmins.filter((admin) => admin.id !== adminId)
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete admin");
    }
  };

  const handleEdit = async (adminId, updatedAdminData) => {
    try {
      const res = await fetch(
        `http://localhost:4001/admins/editAdmin/${adminId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updatedAdminData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to edit admin");
      }

      setAdmins((prevAdmins) =>
        prevAdmins.map((admin) =>
          admin.id === adminId ? { ...admin, ...updatedAdminData } : admin
        )
      );
      setEditMode(null);
    } catch (err) {
      console.error(err);
      setError("Failed to edit admin");
    }
  };

  const startEdit = (admin) => {
    setEditMode(admin.id);
    setEditData({ name: admin.name, email: admin.email });
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

  if (accessDenied) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-center max-w-md">
            You don't have permission to access this page. Only the main administrator can manage admin accounts.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Admins</h1>
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredAdmins.length)} of {filteredAdmins.length} admins
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-black mb-4">
            Create Admin Account
          </h2>

          <form onSubmit={handleAdminRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                placeholder="John Doe"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                value={email}
                type="email"
                placeholder="admin@example.com"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                value={password}
                type="password"
                placeholder="••••••••"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="main_admin">Main Admin</option>
              </select>
              <p className="text-xs text-gray-500">
                Main Admin has full access including managing other admins
              </p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition uppercase text-sm font-medium"
            >
              Create Admin
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Admins:</span>
              <span className="font-semibold">{admins.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Sessions:</span>
              <span className="font-semibold text-green-600">1</span>
            </div>
          </div>
        </div>
      </div>

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
        totalItems={admins.length}
        filteredItems={filteredAdmins.length}
        placeholder="Search admins by name, email, or ID..."
      />

      {currentAdmins.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {filteredAdmins.length === 0 && admins.length > 0 
              ? "No admins match your filters" 
              : "No admins found"}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editMode === admin.id ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        admin.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editMode === admin.id ? (
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        admin.email
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.role === 'main_admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {admin.role === 'main_admin' ? 'Main Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editMode === admin.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(admin.id, editData)}
                            className="text-green-600 hover:text-green-900 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditMode(null)}
                            className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(admin)}
                            className="text-yellow-600 hover:text-yellow-900 px-3 py-1 rounded hover:bg-yellow-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
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
            totalItems={filteredAdmins.length}
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
