"use client";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api.config";
import {
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoYoutube,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoWhatsapp,
} from "react-icons/io5";
import { Link2, Save, X, ExternalLink, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const initialLinks = {
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  whatsapp: "",
};

const platforms = [
  {
    key: "facebook",
    label: "Facebook",
    color: "hover:border-blue-500 hover:ring-blue-100",
    icon: <IoLogoFacebook className="text-blue-600 text-2xl" />,
    placeholder: "facebook.com/yourpage",
    description: "Shown on footer social bar"
  },
  {
    key: "twitter",
    label: "Twitter / X",
    color: "hover:border-slate-800 hover:ring-slate-100",
    icon: <IoLogoTwitter className="text-slate-800 text-2xl" />,
    placeholder: "twitter.com/yourhandle",
    description: "Shown on footer social bar"
  },
  {
    key: "instagram",
    label: "Instagram",
    color: "hover:border-pink-500 hover:ring-pink-100",
    icon: <IoLogoInstagram className="text-pink-600 text-2xl" />,
    placeholder: "instagram.com/yourprofile",
    description: "Shown on footer social bar & CTA button"
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    color: "hover:border-blue-700 hover:ring-blue-100",
    icon: <IoLogoLinkedin className="text-blue-700 text-2xl" />,
    placeholder: "linkedin.com/in/yourprofile",
    description: "Shown on footer social bar"
  },
  {
    key: "youtube",
    label: "YouTube",
    color: "hover:border-red-600 hover:ring-red-100",
    icon: <IoLogoYoutube className="text-red-600 text-2xl" />,
    placeholder: "youtube.com/c/yourchannel",
    description: "Shown on footer social bar"
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    color: "hover:border-green-500 hover:ring-green-100",
    icon: <IoLogoWhatsapp className="text-green-500 text-2xl" />,
    placeholder: "wa.me/yournumber",
    description: "Shown on footer social bar"
  },
];

const Page = () => {
  const [socialLinks, setSocialLinks] = useState(initialLinks);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/social-links`);
        const result = await res.json();
        if (result && result.data) {
          // Strictly map database fields to state keys, ignoring any ApiResponse metadata (like statusCode)
          setSocialLinks({
            facebook: result.data.facebook || "",
            twitter: result.data.twitter || "",
            instagram: result.data.instagram || "",
            linkedin: result.data.linkedin || "",
            youtube: result.data.youtube || "",
            whatsapp: result.data.whatsapp || "",
          });
        }
      } catch (err) {
        console.error("Failed to load social links", err);
        toast.error("Failed to load social links from server");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  const handleChange = (key, value) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

  const clearField = (key) => {
    setSocialLinks((prev) => ({ ...prev, [key]: "" }));
  };

  const getValidUrl = (url) => {
    if (!url || url.trim() === "") return "";
    let trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Format all URLs automatically
    const formattedLinks = {};
    Object.keys(socialLinks).forEach((key) => {
      formattedLinks[key] = getValidUrl(socialLinks[key]);
    });

    try {
      const res = await fetch(`${API_BASE_URL}/social-links`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedLinks),
      });

      if (!res.ok) {
        throw new Error("Failed to update social links");
      }

      setSocialLinks(formattedLinks);
      toast.success("Social links updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error saving social links");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 w-full max-w-4xl space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-4xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200/80 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Link2 className="h-7 w-7 text-blue-600" />
            Social Media Configuration
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your brand's social links displayed in the website footer.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => {
            const value = socialLinks[platform.key] || "";
            const isValidUrl = value.trim() !== "";
            const previewUrl = getValidUrl(value);

            return (
              <div
                key={platform.key}
                className={`bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm transition-all duration-300 ${platform.color} hover:shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gray-50 rounded-xl">
                        {platform.icon}
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-800 text-sm">
                          {platform.label}
                        </h2>
                        <span className="text-[10px] text-gray-400">
                          {platform.description}
                        </span>
                      </div>
                    </div>

                    {isValidUrl && (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline transition"
                      >
                        Preview <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  <div className="relative mt-2">
                    <input
                      type="text"
                      name={platform.key}
                      value={value}
                      onChange={(e) => handleChange(platform.key, e.target.value)}
                      placeholder={platform.placeholder}
                      className="w-full pl-3 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-sm text-gray-700 transition"
                    />

                    {value && (
                      <button
                        type="button"
                        onClick={() => clearField(platform.key)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-blue-500/10 flex items-center gap-2 transition disabled:opacity-50 hover:scale-[1.01] active:scale-95"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                Save Social Links
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;
