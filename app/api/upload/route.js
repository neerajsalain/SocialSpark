import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req) {
  const session = await auth();
  if (!session) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) return Response.json({ success: false, error: "No file provided" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ success: false, error: "File type not allowed" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_SIZE) {
    return Response.json({ success: false, error: "File too large" }, { status: 400 });
  }

  const isVideo = file.type.startsWith("video/");
  const buffer = Buffer.from(arrayBuffer);
  const b64 = buffer.toString("base64");
  const dataURI = `data:${file.type};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: "socialspark",
    resource_type: isVideo ? "video" : "image",
  });

  return Response.json({
    success: true,
    data: { url: result.secure_url, publicId: result.public_id, type: isVideo ? "video" : "image" },
  });
}
