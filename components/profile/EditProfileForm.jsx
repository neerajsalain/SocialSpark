"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Avatar from "@/components/shared/Avatar";

const COVER_TEMPLATES = [
  { label: "Violet Dream",  value: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)" },
  { label: "Ocean Sunset",  value: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #ec4899 100%)" },
  { label: "Aurora",        value: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)" },
  { label: "Coral Blaze",   value: "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)" },
  { label: "Golden Hour",   value: "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)" },
  { label: "Emerald",       value: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)" },
  { label: "Midnight",      value: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)" },
  { label: "Rose Gold",     value: "linear-gradient(135deg, #fda4af 0%, #f472b6 50%, #e879f9 100%)" },
  { label: "Forest",        value: "linear-gradient(135deg, #166534 0%, #15803d 50%, #4ade80 100%)" },
  { label: "Slate",         value: "linear-gradient(135deg, #334155 0%, #475569 50%, #64748b 100%)" },
];

export default function EditProfileForm({ user }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
    website: user.website || "",
    location: user.location || "",
  });
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [coverImage, setCoverImage] = useState(user.coverImage || "");
  const [coverText, setCoverText] = useState(user.coverText || "");
  const [coverTextStyle, setCoverTextStyle] = useState(() => {
    try { return JSON.parse(user.coverTextStyle || "{}"); } catch { return {}; }
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);

  async function uploadFile(file, setter, setLoading) {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await axios.post("/api/upload", fd);
      setter(data.data.url);
      toast.success("Uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/api/users/${user._id}`, { ...form, avatar, coverImage, coverText, coverTextStyle: JSON.stringify(coverTextStyle) });
      toast.success("Profile updated!");
      router.push(`/profile/${form.username || user.username}`);
      router.refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Cover image */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Cover preview */}
        <div className="relative h-40 group"
          style={{ background: coverImage?.startsWith("linear-gradient") || coverImage?.startsWith("radial-gradient")
            ? coverImage : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)" }}>
          {coverImage && !coverImage.startsWith("linear-gradient") && !coverImage.startsWith("radial-gradient") && (
            <Image src={coverImage} alt="cover" fill className="object-cover" />
          )}
          {/* Live text preview */}
          {coverText && (
            <div className={`absolute inset-0 flex items-center pointer-events-none px-6 ${
              coverTextStyle.align === "left" ? "justify-start" :
              coverTextStyle.align === "right" ? "justify-end" : "justify-center"
            }`}>
              <p style={{
                fontSize: coverTextStyle.size === "sm" ? "14px" : coverTextStyle.size === "lg" ? "28px" : coverTextStyle.size === "xl" ? "40px" : "20px",
                fontWeight: coverTextStyle.weight === "normal" ? 400 : 700,
                fontStyle: coverTextStyle.italic ? "italic" : "normal",
                color: coverTextStyle.color || "#ffffff",
                textAlign: coverTextStyle.align || "center",
                textShadow: coverTextStyle.shadow === false ? "none" : "0 2px 8px rgba(0,0,0,0.6)",
              }} className="leading-snug break-words max-w-full">
                {coverText}
              </p>
            </div>
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition cursor-pointer">
            <span className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2 bg-black/60 text-white text-sm font-medium px-4 py-2 rounded-xl backdrop-blur">
              {uploadingCover ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              )}
              {uploadingCover ? "Uploading…" : "Upload photo"}
            </span>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => uploadFile(e.target.files?.[0], setCoverImage, setUploadingCover)} />
          </label>
        </div>

        {/* Template picker */}
        <div className="px-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Choose a template</p>
          <div className="grid grid-cols-5 gap-2">
            {COVER_TEMPLATES.map((t) => (
              <button key={t.label} type="button" title={t.label}
                onClick={() => setCoverImage(t.value)}
                className={`h-10 rounded-xl transition ring-2 ring-offset-2 hover:scale-105 active:scale-95 ${
                  coverImage === t.value
                    ? "ring-indigo-500 dark:ring-offset-gray-900"
                    : "ring-transparent"
                }`}
                style={{ background: t.value }}
              />
            ))}
          </div>
        </div>

        {/* Cover text + styles */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Cover text
            <span className="ml-2 text-gray-400 font-normal normal-case">{coverText.length}/100</span>
          </label>

          <input type="text" value={coverText} maxLength={100} placeholder="Add a tagline or quote…"
            onChange={(e) => setCoverText(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition" />

          {/* Style controls — only show when there's text */}
          {coverText && (
            <div className="space-y-2.5 pt-1">
              {/* Row 1: Size + Weight + Italic + Shadow */}
              <div className="flex flex-wrap gap-2">
                {/* Font size */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 text-xs font-medium">
                  {[["sm","S"],["md","M"],["lg","L"],["xl","XL"]].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setCoverTextStyle(s => ({ ...s, size: val }))}
                      className={`px-3 py-1.5 transition ${(coverTextStyle.size || "md") === val ? "bg-indigo-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Bold */}
                <button type="button" title="Bold"
                  onClick={() => setCoverTextStyle(s => ({ ...s, weight: s.weight === "normal" ? "bold" : "normal" }))}
                  className={`px-3 py-1.5 rounded-xl border text-sm font-bold transition ${(coverTextStyle.weight || "bold") === "bold" ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  B
                </button>

                {/* Italic */}
                <button type="button" title="Italic"
                  onClick={() => setCoverTextStyle(s => ({ ...s, italic: !s.italic }))}
                  className={`px-3 py-1.5 rounded-xl border text-sm italic font-semibold transition ${coverTextStyle.italic ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  I
                </button>

                {/* Shadow */}
                <button type="button" title="Text shadow"
                  onClick={() => setCoverTextStyle(s => ({ ...s, shadow: s.shadow === false ? true : false }))}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${coverTextStyle.shadow === false ? "border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" : "bg-indigo-600 border-indigo-600 text-white"}`}>
                  Shadow
                </button>
              </div>

              {/* Row 2: Alignment */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 w-fit">
                {[
                  ["left", <svg key="l" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h12"/></svg>],
                  ["center", <svg key="c" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M6 18h12"/></svg>],
                  ["right", <svg key="r" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M8 18h12"/></svg>],
                ].map(([val, icon]) => (
                  <button key={val} type="button" onClick={() => setCoverTextStyle(s => ({ ...s, align: val }))}
                    className={`px-3 py-2 transition ${(coverTextStyle.align || "center") === val ? "bg-indigo-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                    {icon}
                  </button>
                ))}
              </div>

              {/* Row 3: Color palette */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 mr-1">Color:</span>
                {["#ffffff","#000000","#fbbf24","#f87171","#34d399","#60a5fa","#c084fc","#fb7185","#f8fafc"].map((color) => (
                  <button key={color} type="button" title={color}
                    onClick={() => setCoverTextStyle(s => ({ ...s, color }))}
                    style={{ background: color }}
                    className={`w-6 h-6 rounded-full border-2 transition hover:scale-110 active:scale-95 ${
                      (coverTextStyle.color || "#ffffff") === color
                        ? "border-indigo-500 scale-110"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="px-5 pb-5">
          <div className="flex items-end gap-4 -mt-10">
            <div className="relative z-10 ring-4 ring-white dark:ring-gray-900 rounded-full shrink-0">
              <Avatar src={avatar} name={form.name} size={80} />
              <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/50 transition cursor-pointer group">
                <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => uploadFile(e.target.files?.[0], setAvatar, setUploadingAvatar)} />
              </label>
            </div>
            <div className="pb-1">
              <p className="font-semibold">{form.name || "Your name"}</p>
              <p className="text-sm text-gray-500">@{form.username || "username"}</p>
            </div>
          </div>
          {uploadingAvatar && <p className="text-xs text-indigo-500 mt-2">Uploading avatar…</p>}
        </div>
      </div>

      {/* Fields */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Profile info</h2>

        {[
          { key: "name", label: "Display name", type: "text", placeholder: "Your name", max: 50 },
          { key: "username", label: "Username", type: "text", placeholder: "username", max: 30 },
          { key: "location", label: "Location", type: "text", placeholder: "City, Country", max: 100 },
          { key: "website", label: "Website", type: "url", placeholder: "https://yoursite.com", max: 200 },
        ].map(({ key, label, type, placeholder, max }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
            <input type={type} value={form[key]} maxLength={max} placeholder={placeholder}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition" />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Bio
            <span className="ml-2 text-xs text-gray-400 font-normal">{form.bio.length}/160</span>
          </label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3} maxLength={160} placeholder="Tell people about yourself…"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition resize-none" />
        </div>
      </div>

      <button type="submit" disabled={saving || uploadingAvatar || uploadingCover}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition disabled:opacity-60 shadow-sm shadow-indigo-500/20">
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
