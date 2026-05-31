import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 300 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);
