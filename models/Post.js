import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  url: String,
  type: { type: String, enum: ["image", "video"] },
  publicId: String,
});

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, maxlength: 500, default: "" },
    media: [mediaSchema],
    tags: [{ type: String, lowercase: true }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    isSensitive: { type: Boolean, default: false },
    isRepost: { type: Boolean, default: false },
    originalPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

postSchema.index({ trendingScore: -1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1, createdAt: -1 });

export default mongoose.models.Post || mongoose.model("Post", postSchema);
