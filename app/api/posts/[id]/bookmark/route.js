import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import Bookmark from "@/models/Bookmark";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectMongoose();
  await Bookmark.findOneAndUpdate(
    { user: session.user.id, post: params.id },
    { user: session.user.id, post: params.id },
    { upsert: true }
  );
  return Response.json({ success: true });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectMongoose();
  await Bookmark.deleteOne({ user: session.user.id, post: params.id });
  return Response.json({ success: true });
}
