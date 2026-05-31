import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/mongoose";
import User from "@/models/User";
import Follow from "@/models/Follow";

export async function GET(req, { params }) {
  await connectMongoose();
  const { id } = await params;
  const user = await User.findById(id).select("-password").lean();
  if (!user) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  return Response.json({ success: true, data: user });
}

export async function PUT(req, { params }) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (session.user.id !== id) return Response.json({ success: false, error: "Forbidden" }, { status: 403 });

  await connectMongoose();
  const body = await req.json();
  const allowed = ["name", "bio", "website", "location", "avatar", "coverImage", "coverText", "coverTextStyle", "username"];
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");
  return Response.json({ success: true, data: user });
}
