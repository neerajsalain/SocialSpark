"use client";
import { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import NewMessageModal from "./NewMessageModal";

export default function MessagesLayout({ session }) {
  const socket = useSocket();
  const [activeConvId, setActiveConvId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [newMsgOpen, setNewMsgOpen] = useState(false);

  // Update conversation list when a DM arrives
  useEffect(() => {
    if (!socket) return;
    const handler = ({ conversationId, message }) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => String(c._id) === conversationId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unread: activeConvId === conversationId ? 0 : (updated[idx].unread || 0) + 1,
        };
        // Bubble to top
        const [item] = updated.splice(idx, 1);
        return [item, ...updated];
      });
    };
    socket.on("dm:receive", handler);
    return () => socket.off("dm:receive", handler);
  }, [socket, activeConvId]);

  const handleNewConversation = (conv) => {
    setConversations((prev) => {
      const exists = prev.find((c) => String(c._id) === String(conv._id));
      if (exists) return prev;
      return [{ ...conv, unread: 0 }, ...prev];
    });
    setActiveConvId(String(conv._id));
    setNewMsgOpen(false);
  };

  const activeConv = conversations.find((c) => String(c._id) === activeConvId);
  const otherUser = activeConv?.participants?.find((p) => String(p._id) !== session.user.id);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] gap-0 py-4">
      {/* Left: conversation list */}
      <div className={`w-full md:w-80 flex-shrink-0 flex flex-col card ${activeConvId ? "hidden md:flex" : "flex"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <h1 className="font-bold text-[17px]">Messages</h1>
          <button
            onClick={() => setNewMsgOpen(true)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
            title="New message"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
        </div>

        <ConversationList
          conversations={conversations}
          setConversations={setConversations}
          activeConvId={activeConvId}
          onSelect={(id) => {
            setActiveConvId(id);
            // Clear unread
            setConversations((prev) =>
              prev.map((c) => String(c._id) === id ? { ...c, unread: 0 } : c)
            );
          }}
          currentUserId={session.user.id}
        />
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-gray-100 dark:bg-gray-800 mx-0" />

      {/* Right: chat window */}
      <div className={`flex-1 flex flex-col card md:rounded-l-none relative ${activeConvId ? "flex" : "hidden md:flex"}`}>
        {activeConvId && otherUser ? (
          <ChatWindow
            conversationId={activeConvId}
            otherUser={otherUser}
            currentUser={session.user}
            onBack={() => setActiveConvId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 dark:text-white">Your messages</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">Send private messages to people you follow or who follow you.</p>
            <button onClick={() => setNewMsgOpen(true)} className="btn-primary mt-5 px-5 py-2.5 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              New message
            </button>
          </div>
        )}
      </div>

      {newMsgOpen && (
        <NewMessageModal
          currentUserId={session.user.id}
          onStart={handleNewConversation}
          onClose={() => setNewMsgOpen(false)}
        />
      )}
    </div>
  );
}
