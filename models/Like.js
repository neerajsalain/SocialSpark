import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetModel: { type: String, enum: ["Post", "Comment"], required: true },
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, target: 1 }, { unique: true });

export default mongoose.models.Like || mongoose.model("Like", likeSchema);
