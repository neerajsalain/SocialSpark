import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Follow from "@/models/Follow";
import User from "@/models/User";
import Notification from "@/models/Notification";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (session.user.id === id) return Response.json({ success: false, error: "Cannot follow yourself" }, { status: 400 });

  await connectMongoose();
  const existing = await Follow.findOne({ follower: session.user.id, following: id });
  if (existing) return Response.json({ success: false, error: "Already following" }, { status: 409 });

  await Follow.create({ follower: session.user.id, following: id });
  await User.findByIdAndUpdate(session.user.id, { $inc: { followingCount: 1 } });
  await User.findByIdAndUpdate(id, { $inc: { followersCount: 1 } });

  const notif = await Notification.create({
    recipient: id, sender: session.user.id, type: "follow",
  });

  // Real-time notification
  try {
    const { default: getIO } = await import("@/lib/socket");
    getIO()?.to(`user:${id}`).emit("notification:new", notif);
  } catch {}

  return Response.json({ success: true, data: { following: true } });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await connectMongoose();
  await Follow.deleteOne({ follower: session.user.id, following: id });
  await User.findByIdAndUpdate(session.user.id, { $inc: { followingCount: -1 } });
  await User.findByIdAndUpdate(id, { $inc: { followersCount: -1 } });

  return Response.json({ success: true, data: { following: false } });
}
