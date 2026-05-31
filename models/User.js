import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    username: { type: String, unique: true, sparse: true, trim: true, lowercase: true, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    avatar: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    coverText: { type: String, default: "", maxlength: 100 },
    coverTextStyle: { type: String, default: "" },
    bio: { type: String, maxlength: 160, default: "" },
    website: { type: String, default: "" },
    location: { type: String, default: "" },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    pinnedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", userSchema);
