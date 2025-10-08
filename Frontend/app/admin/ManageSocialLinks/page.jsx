"use client";

import React, { useEffect, useState } from "react";

const initialLinks = {
  instagram: "",
  twitter: "",
  facebook: "",
  linkedin: "https://www.linkedin.com/in/hemanshuchoudhary/",
  youtube: "https://www.youtube.com/",
  whatsapp: " ",
};

const Page = () => {
  const [socialLinks, setSocialLinks] = useState(initialLinks);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch("http://localhost:4001/social-links");
        const data = await res.json();
        setSocialLinks(data);
      } catch (err) {
        console.error("Failed to load social links", err);
      }
    };

    fetchLinks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4001/social-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialLinks),
      });

      if (!res.ok) {
        throw new Error("Failed to update links");
      }

      alert("Social links updated successfully");
    } catch (err) {
      console.error(err);
      alert("Error updating social links");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Manage Social Links</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-xl shadow"
      >
        {Object.keys(socialLinks).map((platform) => (
          <div key={platform} className="space-y-1">
            <label className="capitalize block font-semibold">
              {platform}
            </label>
            <input
              type="url"
              name={platform}
              value={socialLinks[platform]}
              onChange={handleChange}
              placeholder={`Enter ${platform} URL`}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Links"}
        </button>
      </form>
    </div>
  );
};

export default Page;
