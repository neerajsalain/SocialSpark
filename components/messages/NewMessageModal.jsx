"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Avatar from "@/components/shared/Avatar";
import toast from "react-hot-toast";

export default function NewMessageModal({ currentUserId, onStart, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    axios.get("/api/contacts")
      .then(({ data }) => { if (data.success) setContacts(data.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = contacts.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const startConversation = async (userId) => {
    setStarting(userId);
    try {
      const { data } = await axios.post("/api/conversations", { recipientId: userId });
      if (data.success) onStart(data.data);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not start conversation");
    } finally {
      setStarting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-popup overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-base">New Message</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts…"
              className="input pl-9 py-2"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="max-h-72 overflow-y-auto scrollbar-thin py-1">
          {loading && (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-2 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400">
                {search ? `No contacts matching "${search}"` : "No contacts yet. Follow someone first!"}
              </p>
            </div>
          )}

          {!loading && filtered.map((u) => (
            <button
              key={u._id}
              onClick={() => startConversation(String(u._id))}
              disabled={starting === String(u._id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition text-left disabled:opacity-60"
            >
              <Avatar src={u.avatar} name={u.name} size={40} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{u.name}</p>
                <p className="text-xs text-gray-400">@{u.username}</p>
              </div>
              {starting === String(u._id) ? (
                <svg className="w-4 h-4 animate-spin text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
