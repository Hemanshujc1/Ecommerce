import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaCalendarAlt, FaVenusMars, FaUserTag, FaSave, FaCheck, FaExclamationTriangle } from "react-icons/fa";

const EditProfileForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    age: "",
    gender: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("http://localhost:4001/users/profile", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setFormData({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          age: data.age || "",
          gender: data.gender || "",
          password: "",
        });
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setErrorMsg("Failed to load profile data");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    if (successMsg) setSuccessMsg("");
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:4001/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }

      setSuccessMsg("Profile updated successfully!");
      // Clear password field after successful update
      setFormData(prev => ({ ...prev, password: "" }));
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const inputFields = [
    { name: "name", type: "text", placeholder: "Full Name", icon: FaUser, label: "Full Name" },
    { name: "username", type: "text", placeholder: "Username", icon: FaUserTag, label: "Username" },
    { name: "email", type: "email", placeholder: "Email Address", icon: FaEnvelope, label: "Email" },
    { name: "age", type: "number", placeholder: "Age", icon: FaCalendarAlt, label: "Age" },
    { name: "password", type: "password", placeholder: "New Password (leave blank to keep current)", icon: FaLock, label: "Password" },
  ];

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
          <p className="text-gray-600">Update your personal information and account preferences</p>
        </div>

        {/* Alert Messages */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <FaCheck className="text-green-500 mr-3" />
            <span className="text-green-700">{successMsg}</span>
          </div>
        )}
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-3" />
            <span className="text-red-700">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inputFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.name} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      value={formData[field.name]}
                      onChange={handleChange}
                      required={field.name !== "password"}
                    />
                  </div>
                </div>
              );
            })}

            {/* Gender Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaVenusMars className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="gender"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 appearance-none bg-white"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Security Notice</h3>
          <p className="text-sm text-blue-700">
            Your password is encrypted and secure. Leave the password field blank if you don't want to change it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProfileForm;
