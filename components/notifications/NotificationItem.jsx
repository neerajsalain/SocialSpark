import Link from "next/link";
import Avatar from "@/components/shared/Avatar";
import { timeAgo } from "@/utils/formatTime";

const icons = {
  like: "❤️", comment: "💬", follow: "👤", mention: "@", share: "🔁",
};

const messages = {
  like: "liked your post",
  comment: "commented on your post",
  follow: "started following you",
  mention: "mentioned you",
  share: "reposted your post",
};

export default function NotificationItem({ notif }) {
  const href = notif.post ? `/post/${notif.post._id}` : `/profile/${notif.sender?.username}`;

  return (
    <Link href={href} className={`flex items-start gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${!notif.isRead ? "bg-indigo-50 dark:bg-indigo-900/10" : ""}`}>
      <div className="relative">
        <Avatar src={notif.sender?.avatar} name={notif.sender?.name} size={40} />
        <span className="absolute -bottom-1 -right-1 text-sm">{icons[notif.type]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">{notif.sender?.name}</span>{" "}
          {messages[notif.type]}
        </p>
        {notif.post?.content && <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.post.content}</p>}
        <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
      </div>
      {!notif.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />}
    </Link>
  );
}
