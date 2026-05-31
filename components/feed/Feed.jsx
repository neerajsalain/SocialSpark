"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import { useFeed } from "@/hooks/useFeed";
import InfiniteScrollWrapper from "@/components/shared/InfiniteScrollWrapper";
import Avatar from "@/components/shared/Avatar";

export default function Feed() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: session } = useSession();
  const { posts, loading, hasMore, loadMore, addPost, removePost } = useFeed();

  return (
    <div className="space-y-3">
      {/* Create post */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <Avatar src={session?.user?.image} name={session?.user?.name} size={40} />
          <button onClick={() => setModalOpen(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-750 transition">
            What&apos;s on your mind?
          </button>
        </div>
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Photo / Video
          </button>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
            Post
          </button>
        </div>
      </div>

      <CreatePostModal open={modalOpen} onClose={() => setModalOpen(false)} onPost={addPost} />

      <InfiniteScrollWrapper onLoadMore={loadMore} hasMore={hasMore}>
        {posts.map((post) => <PostCard key={post._id} post={post} onDelete={removePost} />)}
      </InfiniteScrollWrapper>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded-full w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-1/4" />
                </div>
              </div>
              <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <p className="text-lg font-semibold">Your feed is empty</p>
          <p className="text-sm mt-1 text-gray-400">Follow people to see their posts here</p>
        </div>
      )}
    </div>
  );
}
