import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, lowercase: true, trim: true },
    postsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Tag || mongoose.model("Tag", tagSchema);
