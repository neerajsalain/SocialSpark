import mongoose from "mongoose";

const directMessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 2000, trim: true },
    mediaUrl: { type: String, default: "" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    editedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

directMessageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.models.DirectMessage || mongoose.model("DirectMessage", directMessageSchema);
