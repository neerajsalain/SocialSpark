import { z } from "zod";
import { connectMongoose } from "@/lib/mongoose";
import User from "@/models/User";

const schema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }
    await connectMongoose();
    const { name, email, password, username } = parsed.data;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return Response.json({ success: false, error: "Email or username already in use" }, { status: 409 });
    }
    const user = await User.create({ name, email, password, username });
    return Response.json({ success: true, data: { id: user._id, email: user.email, username: user.username } }, { status: 201 });
  } catch (err) {
    return Response.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
