"use client";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePostGrid({ posts }) {
  if (posts.length === 0) return <p className="text-center py-20 text-gray-400">No posts yet</p>;

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {posts.map((post) => {
        const firstMedia = post.media?.[0];
        return (
          <Link key={post._id} href={`/post/${post._id}`} className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
            {firstMedia ? (
              firstMedia.type === "video"
                ? <video src={firstMedia.url} className="w-full h-full object-cover" />
                : <Image src={firstMedia.url} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2 text-xs text-gray-500 line-clamp-4">{post.content}</div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-4 text-white text-sm font-semibold">
                <span>❤️ {post.likesCount}</span>
                <span>💬 {post.commentsCount}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
