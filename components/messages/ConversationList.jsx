"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Avatar from "@/components/shared/Avatar";
import { timeAgo } from "@/utils/formatTime";

export default function ConversationList({ conversations, setConversations, activeConvId, onSelect, currentUserId }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/conversations")
      .then(({ data }) => {
        if (data.success) setConversations(data.data);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) {
    return (
      <div className="flex-1 p-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl animate-pulse">
            <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded-full w-2/3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <svg className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No conversations yet</p>
        <p className="text-xs text-gray-400 mt-1">Start a new message above</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
      {conversations.map((conv) => {
        const other = conv.other || conv.participants?.find((p) => String(p._id) !== currentUserId);
        if (!other) return null;
        const isActive = String(conv._id) === activeConvId;
        const hasUnread = conv.unread > 0;

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(String(conv._id))}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
              isActive
                ? "bg-indigo-50 dark:bg-indigo-950/40"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
            }`}
          >
            <div className="relative shrink-0">
              <Avatar src={other.avatar} name={other.name} size={44} />
              {hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white dark:border-gray-900" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm truncate ${hasUnread ? "font-bold text-gray-900 dark:text-white" : "font-semibold text-gray-800 dark:text-gray-200"}`}>
                  {other.name}
                </span>
                {conv.lastMessageAt && (
                  <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                )}
              </div>
              <p className={`text-xs truncate mt-0.5 ${hasUnread ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-400"}`}>
                {conv.lastMessage?.content || "Start a conversation"}
              </p>
            </div>
            {hasUnread && (
              <span className="shrink-0 min-w-[18px] h-[18px] bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {conv.unread > 9 ? "9+" : conv.unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
