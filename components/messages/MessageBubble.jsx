"use client";
import { useState, useRef, useEffect } from "react";
import { timeAgo } from "@/utils/formatTime";

export default function MessageBubble({ message, isOwn, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [menuOpen, setMenuOpen] = useState(false);
  const editRef = useRef(null);
  const menuRef = useRef(null);
  const time = timeAgo(message.createdAt);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, [editing]); // eslint-disable-line

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const submitEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === message.content) { setEditing(false); return; }
    onEdit(message._id, trimmed);
    setEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitEdit(); }
    if (e.key === "Escape") { setEditText(message.content); setEditing(false); }
  };

  const isDeleted = message.isDeleted;

  return (
    <div className={`flex gap-2 items-end group ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`max-w-[72%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>

        {/* Bubble + action row */}
        <div className={`flex items-end gap-1.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>

          {/* Action buttons — own messages only, visible on hover */}
          {isOwn && !isDeleted && !message.isTemp && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mb-1.5 relative" ref={menuRef}>
              {/* Edit */}
              <button
                onClick={() => { setEditing(true); setMenuOpen(false); }}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                title="Edit"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              {/* Delete */}
              <button
                onClick={() => { onDelete(message._id); setMenuOpen(false); }}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                title="Delete"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          )}

          {/* Bubble */}
          {editing ? (
            <div className="flex flex-col gap-1.5 min-w-[180px] max-w-[280px]">
              <textarea
                ref={editRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-sm border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                style={{ minHeight: 44 }}
              />
              <div className="flex gap-1.5 justify-end">
                <button
                  onClick={() => { setEditText(message.content); setEditing(false); }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                isOwn
                  ? `text-white rounded-br-md ${message.isTemp ? "opacity-70" : ""}`
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md"
              } ${isDeleted ? "italic opacity-50" : ""}`}
              style={isOwn && !isDeleted ? {
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 2px 10px rgba(99,102,241,0.25)",
              } : isOwn && isDeleted ? { background: "rgba(99,102,241,0.15)" } : {}}
            >
              <p style={{ whiteSpace: "pre-wrap" }}>{message.content}</p>
            </div>
          )}
        </div>

        {/* Timestamp + edited badge */}
        {!editing && (
          <div className={`flex items-center gap-1.5 mt-1 mx-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? "flex-row-reverse" : ""}`}>
            <span className="text-[10px] text-gray-400/60">{time}</span>
            {message.editedAt && !isDeleted && (
              <span className="text-[10px] text-gray-400/50 italic">edited</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
