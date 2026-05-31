"use client";
import { useState, useRef } from "react";
import Modal from "@/components/shared/Modal";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";

const MAX_CHARS = 500;

export default function CreatePostModal({ open, onClose, onPost }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [isSensitive, setIsSensitive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  async function handleFileChange(e) {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const { data } = await axios.post("/api/upload", fd);
          return data.data;
        })
      );
      setMedia((prev) => [...prev, ...results]);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!content.trim() && media.length === 0) { toast.error("Post cannot be empty"); return; }
    setSubmitting(true);
    try {
      const { data } = await axios.post("/api/posts", { content, media, isSensitive });
      onPost?.(data.data);
      setContent("");
      setMedia([]);
      setIsSensitive(false);
      onClose();
      toast.success("Posted!");
    } catch {
      toast.error("Failed to post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create post">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_CHARS}
        rows={4}
        placeholder="What's on your mind? Use #hashtags to tag topics"
        className="w-full resize-none border dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1 mb-3">
        <span>{content.length}/{MAX_CHARS}</span>
        {uploading && <span className="text-indigo-500">Uploading…</span>}
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {media.map((m, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-gray-200 dark:bg-gray-800 group">
              {m.type === "video"
                ? <video src={m.url} className="w-full h-full object-cover" />
                : <Image src={m.url} alt="" fill className="object-cover" />}
              <button onClick={() => setMedia((prev) => prev.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 text-xs hidden group-hover:flex items-center justify-center">&times;</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Media */}
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-500 transition px-2 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Media
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />

          {/* Sensitive toggle */}
          <button type="button" onClick={() => setIsSensitive(!isSensitive)}
            title="Mark as sensitive content"
            className={`flex items-center gap-1.5 text-sm transition px-2 py-1.5 rounded-xl ${
              isSensitive
                ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
                : "text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            {isSensitive ? "Sensitive" : "Safe"}
          </button>
        </div>

        <button onClick={handleSubmit} disabled={submitting || uploading}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm transition disabled:opacity-60">
          {submitting ? "Posting…" : "Post"}
        </button>
      </div>
    </Modal>
  );
}
