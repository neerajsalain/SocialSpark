"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useSocket } from "@/context/SocketContext";
import Avatar from "@/components/shared/Avatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import Link from "next/link";

export default function ChatWindow({ conversationId, otherUser, currentUser, onBack }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [clearing, setClearing] = useState(false);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversationId) return;
    setMessages([]);
    setLoading(true);
    axios.get(`/api/conversations/${conversationId}/messages`)
      .then(({ data }) => {
        if (data.success) { setMessages(data.data); setHasMore(data.hasMore); }
      })
      .finally(() => setLoading(false));
  }, [conversationId]);

  // Scroll to bottom on first load / new message
  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Socket: receive new message
  useEffect(() => {
    if (!socket) return;
    const onReceive = ({ conversationId: cid, message }) => {
      if (cid !== conversationId) return;
      if (String(message.sender?._id || message.sender) === currentUser.id) return;
      setMessages((prev) => {
        if (prev.find((m) => String(m._id) === String(message._id))) return prev;
        return [...prev, message];
      });
    };
    socket.on("dm:receive", onReceive);
    return () => socket.off("dm:receive", onReceive);
  }, [socket, conversationId, currentUser.id]);

  // Socket: edit
  useEffect(() => {
    if (!socket) return;
    const onEdit = ({ conversationId: cid, message }) => {
      if (cid !== conversationId) return;
      setMessages((prev) => prev.map((m) => String(m._id) === String(message._id) ? message : m));
    };
    socket.on("dm:edit", onEdit);
    return () => socket.off("dm:edit", onEdit);
  }, [socket, conversationId]);

  // Socket: delete
  useEffect(() => {
    if (!socket) return;
    const onDelete = ({ conversationId: cid, messageId }) => {
      if (cid !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === messageId
            ? { ...m, isDeleted: true, content: "This message was deleted." }
            : m
        )
      );
    };
    socket.on("dm:delete", onDelete);
    return () => socket.off("dm:delete", onDelete);
  }, [socket, conversationId]);

  // Socket: clear chat
  useEffect(() => {
    if (!socket) return;
    const onClear = ({ conversationId: cid }) => {
      if (cid !== conversationId) return;
      setMessages([]);
      setHasMore(false);
    };
    socket.on("dm:clear", onClear);
    return () => socket.off("dm:clear", onClear);
  }, [socket, conversationId]);

  // Load older messages
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !messages.length) return;
    setLoadingMore(true);
    const cursor = messages[0]?.createdAt;
    const { data } = await axios.get(`/api/conversations/${conversationId}/messages?cursor=${cursor}`);
    if (data.success) { setMessages((prev) => [...data.data, ...prev]); setHasMore(data.hasMore); }
    setLoadingMore(false);
  }, [hasMore, loadingMore, messages, conversationId]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    if (containerRef.current.scrollTop < 60 && hasMore && !loadingMore) loadMore();
  }, [hasMore, loadingMore, loadMore]);

  // Send message (optimistic)
  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      sender: { _id: currentUser.id, name: currentUser.name, avatar: currentUser.image },
      content,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };
    setMessages((prev) => [...prev, tempMsg]);
    try {
      const { data } = await axios.post(`/api/conversations/${conversationId}/messages`, { content });
      if (data.success) setMessages((prev) => prev.map((m) => m._id === tempMsg._id ? data.data : m));
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
      toast.error("Failed to send message");
    }
  }, [conversationId, currentUser]);

  // Delete a single message
  const handleDelete = useCallback(async (msgId) => {
    setMessages((prev) =>
      prev.map((m) => String(m._id) === msgId
        ? { ...m, isDeleted: true, content: "This message was deleted." }
        : m
      )
    );
    try {
      await axios.delete(`/api/conversations/${conversationId}/messages/${msgId}`);
    } catch {
      toast.error("Failed to delete message");
      // Revert if failed — refetch
      const { data } = await axios.get(`/api/conversations/${conversationId}/messages`);
      if (data.success) { setMessages(data.data); setHasMore(data.hasMore); }
    }
  }, [conversationId]);

  // Edit a message
  const handleEdit = useCallback(async (msgId, newContent) => {
    setMessages((prev) =>
      prev.map((m) => String(m._id) === msgId ? { ...m, content: newContent, editedAt: new Date().toISOString() } : m)
    );
    try {
      await axios.patch(`/api/conversations/${conversationId}/messages/${msgId}`, { content: newContent });
    } catch {
      toast.error("Failed to edit message");
      const { data } = await axios.get(`/api/conversations/${conversationId}/messages`);
      if (data.success) { setMessages(data.data); setHasMore(data.hasMore); }
    }
  }, [conversationId]);

  // Clear entire chat
  const handleClearChat = useCallback(async () => {
    if (!confirm("Clear all messages? This cannot be undone.")) return;
    setClearing(true);
    try {
      await axios.delete(`/api/conversations/${conversationId}/messages`);
      setMessages([]);
      setHasMore(false);
      toast.success("Chat cleared");
    } catch {
      toast.error("Failed to clear chat");
    } finally {
      setClearing(false);
    }
  }, [conversationId]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="md:hidden p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <Link href={`/profile/${otherUser.username}`} className="flex items-center gap-3 hover:opacity-80 transition flex-1 min-w-0">
          <Avatar src={otherUser.avatar} name={otherUser.name} size={38} />
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{otherUser.name}</p>
            <p className="text-xs text-gray-400 leading-tight">@{otherUser.username}</p>
          </div>
        </Link>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          <Link href={`/profile/${otherUser.username}`}
            className="p-2 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
            title="View profile">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </Link>

          {/* Clear chat — always visible */}
          <button
            onClick={handleClearChat}
            disabled={clearing}
            title="Clear chat"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-800 transition disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            {clearing ? "Clearing…" : "Clear"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin"
      >
        {loadingMore && (
          <div className="flex justify-center py-2">
            <div className="flex gap-1">
              {[0,1,2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }}/>
              ))}
            </div>
          </div>
        )}

        {!hasMore && messages.length > 0 && (
          <div className="flex items-center gap-3 py-4">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"/>
            <span className="text-[11px] text-gray-400 font-medium">Beginning of conversation</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"/>
          </div>
        )}

        {loading ? (
          <div className="space-y-3 pt-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className={`flex gap-2 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0"/>
                <div className={`h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse ${i % 2 === 0 ? "w-48" : "w-36"}`}/>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Say hello to {otherUser.name}!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={String(msg.sender?._id || msg.sender) === currentUser.id}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}

        <div ref={bottomRef}/>
      </div>

      <MessageInput onSend={sendMessage}/>
    </div>
  );
}
