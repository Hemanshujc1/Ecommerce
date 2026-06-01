import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaCalendarAlt, FaVenusMars, FaUserTag, FaSave, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { API_BASE_URL } from "@/lib/api.config";

const EditProfileForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    age: "",
    gender: "",
    password: "",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    username: "",
    email: "",
    age: "",
    gender: "",
    password: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          method: "GET",
          credentials: "include",
        });
        const responseData = await res.json();
        const data = responseData?.data || {};
        const profileInfo = {
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          age: data.age || "",
          gender: data.gender || "",
          password: "",
        };
        setFormData(profileInfo);
        setOriginalData(profileInfo);
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
    if (successMsg) setSuccessMsg("");
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
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
      const updatedInfo = { ...formData, password: "" };
      setFormData(updatedInfo);
      setOriginalData(updatedInfo);
      setIsEditing(false);
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
        <div className="animate-pulse space-y-6">
          <div className="h-7 bg-gray-150 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-150 rounded-2xl"></div>
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
    <div className="p-6 sm:p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h2>
        <p className="text-sm text-gray-500 font-light mt-1">Update your personal credentials and login details.</p>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-150 text-green-700 text-sm font-medium rounded-2xl flex items-center gap-3">
          <FaCheck className="text-green-500" />
          <span>{successMsg}</span>
        </div>
      )}
      
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-150 text-red-700 text-sm font-medium rounded-2xl flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inputFields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.name} className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {field.label}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Icon />
                  </div>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/30 text-black text-sm focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.name !== "password"}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            );
          })}

          {/* Gender Select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Gender
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FaVenusMars />
              </div>
              <select
                name="gender"
                className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/30 text-black text-sm focus:outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition shadow-inner appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                value={formData.gender}
                onChange={handleChange}
                required
                disabled={!isEditing}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="flex justify-end gap-3 pt-4">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-gray-800 transition active:scale-[0.98] shadow-md animate-fade-in"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setFormData(originalData);
                  setIsEditing(false);
                  setSuccessMsg("");
                  setErrorMsg("");
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-2xl transition active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-gray-800 disabled:opacity-50 transition active:scale-[0.98] shadow-md"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </form>

      {/* Security Notice */}
      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-0.5">Security Note</h4>
        <p className="text-xs text-blue-700 font-light leading-relaxed">
          Your credentials and passwords are encrypted using multi-tier hash algorithms. Leave the password field blank unless you wish to change it.
        </p>
      </div>
    </div>
  );
};

export default EditProfileForm;
