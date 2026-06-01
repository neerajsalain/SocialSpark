// Run with: node scripts/seed-users.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const userSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true, maxlength: 50 },
    username:       { type: String, unique: true, sparse: true, trim: true, lowercase: true, maxlength: 30 },
    email:          { type: String, required: true, unique: true, lowercase: true },
    password:       { type: String },
    avatar:         { type: String, default: "" },
    coverImage:     { type: String, default: "" },
    bio:            { type: String, maxlength: 160, default: "" },
    website:        { type: String, default: "" },
    location:       { type: String, default: "" },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount:     { type: Number, default: 0 },
    isVerified:     { type: Boolean, default: false },
    pinnedPost:     { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const accounts = [
  {
    name:     "Sarah Chen",
    username: "sarahchen_vc",
    email:    "sarah.chen@dummy.socialspark.io",
    password: "Demo@1234",
    bio:      "Venture Capitalist & Tech Entrepreneur · Forbes 30 Under 30 · Invested in 40+ startups · AI/ML enthusiast · Speaker @ TechCrunch",
    location: "San Francisco, CA",
    website:  "https://sarahchen.vc",
    isVerified: true,
    followersCount: 18400,
    followingCount: 312,
    postsCount: 214,
    coverImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    name:     "Marcus Rivera",
    username: "marcusrivera",
    email:    "marcus.rivera@dummy.socialspark.io",
    password: "Demo@1234",
    bio:      "Full-Stack Engineer · Open Source · Building @DevToolsHQ · TypeScript · Rust · ex-Google · 12k+ GitHub stars · Coffee addict ☕",
    location: "Austin, TX",
    website:  "https://marcusrivera.dev",
    isVerified: false,
    followersCount: 9200,
    followingCount: 540,
    postsCount: 387,
    coverImage: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  },
  {
    name:     "Emma Larsson",
    username: "emmadesigns",
    email:    "emma.larsson@dummy.socialspark.io",
    password: "Demo@1234",
    bio:      "Product Designer & UX Lead · Figma ambassador · Designing for humans · Previously @Spotify @Airbnb · Mentor @ADPList",
    location: "Stockholm, Sweden",
    website:  "https://emmadesigns.io",
    isVerified: true,
    followersCount: 23100,
    followingCount: 890,
    postsCount: 156,
    coverImage: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    name:     "David Kim",
    username: "davidkim_sec",
    email:    "david.kim@dummy.socialspark.io",
    password: "Demo@1234",
    bio:      "Cybersecurity Researcher · CISSP · Bug Bounty Hunter · CTF Player · Red Team Lead @CrowdStrike · Opinions are my own",
    location: "Seoul, South Korea",
    website:  "https://davidkim.security",
    isVerified: false,
    followersCount: 14700,
    followingCount: 430,
    postsCount: 298,
    coverImage: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
  },
  {
    name:     "Priya Sharma",
    username: "priyasharma_ds",
    email:    "priya.sharma@dummy.socialspark.io",
    password: "Demo@1234",
    bio:      "Data Scientist · ML Engineer @DeepMind · Kaggle Grandmaster · PhD CS @Stanford · Turning data into decisions · she/her",
    location: "London, UK",
    website:  "https://priyasharma.ai",
    isVerified: true,
    followersCount: 31500,
    followingCount: 720,
    postsCount: 442,
    coverImage: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("MONGODB_URI not found in .env.local"); process.exit(1); }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB\n");

  for (const acc of accounts) {
    const exists = await User.findOne({ $or: [{ email: acc.email }, { username: acc.username }] });
    if (exists) {
      console.log(`⚠️  Skipped  @${acc.username} — already exists`);
      continue;
    }
    const hashed = await bcrypt.hash(acc.password, 12);
    await User.create({ ...acc, password: hashed });
    console.log(`✅ Created  @${acc.username}  (${acc.name})`);
  }

  console.log("\nDone.");
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
