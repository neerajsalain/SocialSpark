"use client";
import { useState, useRef } from "react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
      <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl px-3.5 py-2.5 focus-within:border-indigo-400/50 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all duration-150">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          rows={1}
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none max-h-28 py-0.5 leading-relaxed"
          style={{ height: "auto" }}
        />
        <button
          onClick={submit}
          disabled={!hasText}
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-95 ${
            hasText
              ? "text-white shadow-brand"
              : "bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed"
          }`}
          style={hasText ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" } : {}}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-gray-300/60 dark:text-white/15 text-center mt-1.5">Enter to send · Shift+Enter for newline</p>
    </div>
  );
}
