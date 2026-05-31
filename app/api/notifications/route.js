import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Notification from "@/models/Notification";

export async function GET(req) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectMongoose();
  const notifs = await Notification.find({ recipient: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("sender", "name username avatar")
    .populate("post", "content media")
    .lean();
  return Response.json({ success: true, data: notifs });
}

export async function PATCH(req) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectMongoose();
  await Notification.updateMany({ recipient: session.user.id, isRead: false }, { isRead: true });
  return Response.json({ success: true, data: null });
}
