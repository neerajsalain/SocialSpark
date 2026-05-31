# SocialSpark — Social Media Platform · Claude Code Project Guide

## Overview

A full-stack social media platform built with **Next.js 15 (App Router)** + Tailwind CSS.
Users can create profiles, share posts (text/image/video), like and comment on posts,
follow each other, receive real-time notifications, and explore trending content.
Backend powered by Express + MongoDB. File uploads via Cloudinary.

---

## ⚠️ Critical Notes — Read Before Starting

> **NextAuth v5 + MongoDB Edge Runtime split (REQUIRED):**
> Same rule as always: `proxy.ts` (middleware) runs on Edge Runtime — no MongoDB/Mongoose there.
> - `auth.config.js` — providers only, NO adapter, NO DB imports → used in `proxy.ts`
> - `lib/auth.js` — full config with MongoDBAdapter → used in API routes and server components ONLY
>
> **Image/Video uploads:** Never write to disk on Render. Always stream directly to Cloudinary.
> **Next.js 15 middleware filename:** File is `proxy.ts` (not `middleware.ts`).
> **Render free tier:** Add `GET /api/health` → 200 OK and ping via UptimeRobot every 5 min.
> **Feed pagination:** Use cursor-based pagination (createdAt + _id), NOT offset/limit pages — avoids duplicates when new posts arrive.
> **Trending algorithm:** Score = (likes × 3) + (comments × 2) + (shares × 1) / (hoursOld + 2)^1.5 — recalculate every 15 min via a cron-like setInterval in server.js.

---

## Tech Stack

| Layer         | Technology              | Free Tier                   |
| ------------- | ----------------------- | --------------------------- |
| Framework     | Next.js 15 (App Router) | MIT open source             |
| Styling       | Tailwind CSS v3         | MIT open source             |
| Database      | MongoDB Atlas           | Free M0 (512 MB)            |
| ODM           | Mongoose 8              | MIT open source             |
| Auth          | NextAuth.js v5 beta     | Free, built for Next.js     |
| File Storage  | Cloudinary              | Free 25 GB / 25k transforms |
| Hosting       | Render.com              | Free 750 hrs/mo             |
| State         | Zustand 4               | MIT open source             |
| Real-time     | Socket.io 4             | MIT open source             |
| Validation    | Zod 3                   | MIT open source             |
| Custom Server | Express 4               | MIT open source             |

---

## Project Structure

```
social-spark/
├── CLAUDE.md
├── server.js                    # Entry: Express + Socket.io + Next.js handler
├── auth.config.js               # Edge-safe auth (providers only, NO DB imports)
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.js
├── proxy.ts                     # Next.js 15 middleware (auth.config.js ONLY)
├── .env.local
├── .env.example
├── .gitignore
├── package.json
│
├── app/
│   ├── layout.jsx               # Root layout (fonts, providers, toaster)
│   ├── page.jsx                 # Redirect → /feed or /login
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── register/page.jsx
│   ├── feed/page.jsx            # Home feed (following + trending mix)
│   ├── explore/page.jsx         # Trending posts + discover users
│   ├── notifications/page.jsx   # All notifications
│   ├── profile/
│   │   ├── [username]/page.jsx  # Public profile view
│   │   └── edit/page.jsx        # Edit own profile
│   ├── post/
│   │   └── [postId]/page.jsx    # Single post + comments thread
│   └── api/
│       ├── auth/[...nextauth]/route.js
│       ├── health/route.js
│       ├── users/
│       │   ├── route.js                    # POST /api/users (register)
│       │   ├── [id]/route.js               # GET / PUT profile
│       │   ├── [id]/follow/route.js        # POST follow / DELETE unfollow
│       │   ├── [id]/followers/route.js     # GET followers list
│       │   └── [id]/following/route.js     # GET following list
│       ├── posts/
│       │   ├── route.js                    # GET feed / POST create post
│       │   ├── [id]/route.js               # GET / PUT / DELETE post
│       │   ├── [id]/like/route.js          # POST like / DELETE unlike
│       │   ├── [id]/comments/route.js      # GET / POST comments
│       │   └── [id]/share/route.js         # POST share (repost)
│       ├── explore/route.js                # GET trending posts + suggested users
│       ├── notifications/route.js          # GET / PATCH mark-read
│       ├── search/route.js                 # GET ?q= search posts + users
│       ├── tags/[tag]/route.js             # GET posts by hashtag
│       └── upload/route.js                 # POST multipart → Cloudinary
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── feed/
│   │   ├── Feed.jsx                        # Infinite scroll feed
│   │   ├── PostCard.jsx                    # Post with like/comment/share actions
│   │   ├── CreatePostModal.jsx             # Text + media upload form
│   │   ├── CommentSection.jsx
│   │   ├── CommentBubble.jsx
│   │   ├── LikeButton.jsx                  # Optimistic UI update
│   │   └── ShareButton.jsx
│   ├── explore/
│   │   ├── TrendingFeed.jsx
│   │   ├── TrendingTags.jsx
│   │   └── SuggestedUsers.jsx
│   ├── profile/
│   │   ├── ProfileHeader.jsx               # Avatar, bio, follow button, stats
│   │   ├── ProfilePostGrid.jsx             # 3-column grid like Instagram
│   │   ├── FollowButton.jsx
│   │   └── EditProfileForm.jsx
│   ├── notifications/
│   │   ├── NotificationList.jsx
│   │   └── NotificationItem.jsx
│   ├── layout/
│   │   ├── Navbar.jsx                      # Top nav with search bar
│   │   ├── Sidebar.jsx                     # Left sidebar: nav links + trending tags
│   │   ├── RightPanel.jsx                  # Suggested users + trending topics
│   │   └── MobileNav.jsx                   # Bottom nav for mobile
│   └── shared/
│       ├── Avatar.jsx
│       ├── Modal.jsx
│       ├── InfiniteScroll.jsx
│       ├── MediaViewer.jsx                 # Image/video lightbox
│       ├── HashtagLink.jsx
│       └── EmojiPicker.jsx
│
├── context/
│   └── SocketContext.jsx                   # Socket.io client for real-time notifs
│
├── hooks/
│   ├── useSocket.js
│   ├── useFeed.js                          # Cursor-based infinite feed
│   ├── usePost.js
│   ├── useFollow.js
│   └── useNotifications.js
│
├── lib/
│   ├── db.js                               # MongoClient singleton (NextAuth adapter)
│   ├── mongoose.js                         # Mongoose connection singleton
│   ├── cloudinary.js
│   ├── auth.js                             # Full NextAuth config — Node.js only
│   └── trending.js                         # Trending score calculator
│
├── models/
│   ├── User.js
│   ├── Post.js
│   ├── Comment.js
│   ├── Like.js
│   ├── Follow.js
│   ├── Notification.js
│   └── Tag.js
│
├── socket/
│   ├── index.js                            # Register all socket namespaces
│   ├── notificationEvents.js              # Real-time notification delivery
│   └── presenceEvents.js
│
└── utils/
    ├── formatTime.js
    ├── sanitize.js
    ├── extractHashtags.js                  # Parse #tags from post content
    ├── trendingScore.js
    └── constants.js
```

---

## Auth Architecture (Edge Runtime Split)

```
proxy.ts ──imports──▶ auth.config.js (providers only, edge-safe)
                              │
                              ▼
                       lib/auth.js ──▶ MongoDBAdapter + lib/db.js + bcrypt
                              │
                              ▼
              Used by: API routes, Server Components
              NEVER imported by proxy.ts
```

### auth.config.js
```js
// Edge-safe. NO mongoose, NO mongodb, NO lib/db imports.
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { z } from "zod"

export default {
  providers: [
    Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }),
    Credentials({
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }).safeParse(credentials)
        if (!parsed.success) return null
        return { email: parsed.data.email }
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
}
```

### lib/auth.js
```js
// Node.js only. NEVER import in proxy.ts.
import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "./db"
import authConfig from "../auth.config"
import { connectMongoose } from "./mongoose"
import User from "../models/User"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(client),
  callbacks: {
    async signIn({ user, credentials }) {
      if (!credentials) return true // OAuth
      await connectMongoose()
      const dbUser = await User.findOne({ email: credentials.email })
      if (!dbUser) return false
      return bcrypt.compare(credentials.password, dbUser.password)
    },
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.username = token.username
      return session
    },
    async jwt({ token, user }) {
      if (user) token.username = user.username
      return token
    },
  },
})
```

### proxy.ts
```ts
import NextAuth from "next-auth"
import authConfig from "./auth.config"
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isPublic = req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname.startsWith("/explore")
  if (!isLoggedIn && !isPublic) {
    return Response.redirect(new URL("/login", req.nextUrl.origin))
  }
  if (isLoggedIn && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
    return Response.redirect(new URL("/feed", req.nextUrl.origin))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## Database Models

### User
```
_id, name, username (unique, slug), email, password (bcrypt),
avatar (Cloudinary URL), coverImage (Cloudinary URL),
bio (String, max 160), website (String), location (String),
followersCount (Number), followingCount (Number), postsCount (Number),
isVerified (Boolean), createdAt
```

### Post
```
_id, author (ObjectId → User),
content (String, max 500),
media [{ url, type: 'image'|'video', publicId }],
tags [String],                         ← extracted hashtags e.g. ["javascript","webdev"]
likesCount, commentsCount, sharesCount,
trendingScore (Number),                ← recalculated every 15 min
isRepost (Boolean), originalPost (ObjectId → Post),
createdAt, updatedAt
```

### Comment
```
_id, post (ObjectId → Post), author (ObjectId → User),
content (String, max 300),
parentComment (ObjectId → Comment),    ← for nested replies
likesCount, createdAt
```

### Like
```
_id, user (ObjectId → User),
target (ObjectId),                     ← post or comment
targetModel ('Post' | 'Comment'),
createdAt
Compound unique index: { user, target }
```

### Follow
```
_id, follower (ObjectId → User), following (ObjectId → User),
createdAt
Compound unique index: { follower, following }
```

### Notification
```
_id, recipient (ObjectId → User), sender (ObjectId → User),
type ('like' | 'comment' | 'follow' | 'mention' | 'share'),
post (ObjectId → Post),                ← null for follow notifications
isRead (Boolean, default false),
createdAt
```

### Tag
```
_id, name (String, unique lowercase), postsCount (Number),
trendingScore (Number), updatedAt
```

---

## REST API Endpoints

### Auth / Users
```
POST   /api/users                        register
GET    /api/users/:id                    get profile by id
PUT    /api/users/:id                    update profile (name, bio, website, location, avatar, cover)
POST   /api/users/:id/follow             follow user
DELETE /api/users/:id/follow             unfollow user
GET    /api/users/:id/followers          list followers
GET    /api/users/:id/following          list following
```

### Posts
```
GET    /api/posts?cursor=&limit=10       home feed (following posts, cursor-based)
POST   /api/posts                        create post (text + optional media)
GET    /api/posts/:id                    single post detail
PUT    /api/posts/:id                    edit own post
DELETE /api/posts/:id                    delete own post
POST   /api/posts/:id/like               like post
DELETE /api/posts/:id/like               unlike post
GET    /api/posts/:id/comments           get comments (cursor-based)
POST   /api/posts/:id/comments           add comment
POST   /api/posts/:id/share              repost
```

### Explore / Search
```
GET    /api/explore?tab=trending|people  trending posts OR suggested users
GET    /api/search?q=&type=posts|users   search
GET    /api/tags/:tag                    posts by hashtag
```

### Notifications
```
GET    /api/notifications                list notifications (newest first)
PATCH  /api/notifications                mark all as read
PATCH  /api/notifications/:id            mark one as read
```

### Upload / Health
```
POST   /api/upload                       multipart → Cloudinary { url, publicId, type }
GET    /api/health                       200 OK (Render keep-alive)
```

### Response shape (all routes)
```json
{ "success": true, "data": {}, "error": null }
```

---

## Socket.io Events (Real-time Notifications)

### Server → Client
| Event                | Payload                                         | Description             |
| -------------------- | ----------------------------------------------- | ----------------------- |
| `notification:new`   | `{ type, sender, post, message }`               | Push new notification   |
| `post:liked`         | `{ postId, likesCount }`                        | Live like count update  |
| `post:commented`     | `{ postId, commentsCount }`                     | Live comment count      |
| `user:online`        | `{ userId }`                                    | Presence indicator      |
| `user:offline`       | `{ userId }`                                    | Presence indicator      |

### Client → Server
| Event          | Payload          | Description               |
| -------------- | ---------------- | ------------------------- |
| `subscribe`    | `{ userId }`     | Subscribe to own notifs   |
| `unsubscribe`  | `{ userId }`     | Cleanup on logout         |

---

## Trending Score Algorithm

```js
// lib/trending.js — recalculate every 15 min via setInterval in server.js
function trendingScore(post) {
  const hoursOld = (Date.now() - post.createdAt) / 3600000
  return (post.likesCount * 3 + post.commentsCount * 2 + post.sharesCount) /
    Math.pow(hoursOld + 2, 1.5)
}
```

---

## Feed Algorithm

- **Home feed:** Posts from users the current user follows, sorted by `createdAt` DESC, cursor-based
- **Explore/Trending:** All posts sorted by `trendingScore` DESC, last 48 hours only
- **Hashtag feed:** Posts containing the tag, sorted by `createdAt` DESC
- **Profile feed:** All posts by user, sorted by `createdAt` DESC

---

## Implementation Phases

### Phase 1 — Project Setup
- [ ] `npx create-next-app@latest` (Next.js 15, App Router, Tailwind, ESLint)
- [ ] Install all dependencies (see package.json below)
- [ ] Create `server.js` — Express + Socket.io + Next.js handler
- [ ] Create `lib/db.js` — MongoClient singleton
- [ ] Create `lib/mongoose.js` — Mongoose singleton
- [ ] Configure `.env.local`
- [ ] Verify `npm run dev` starts without errors

### Phase 2 — Auth
- [ ] `auth.config.js` — Credentials + Google (edge-safe)
- [ ] `lib/auth.js` — full config with MongoDBAdapter + bcrypt DB check
- [ ] `models/User.js` — bcrypt pre-save hook, username auto-generated from email
- [ ] `POST /api/users` — register route (Zod → bcrypt → save)
- [ ] `app/api/auth/[...nextauth]/route.js`
- [ ] `proxy.ts` — middleware (auth.config.js ONLY)
- [ ] Login + Register pages (email/password + Google OAuth button)
- [ ] Test: register → login → redirect to /feed

### Phase 3 — Core Post System
- [ ] `models/Post.js`, `models/Comment.js`, `models/Like.js`
- [ ] `POST /api/posts` — create post with text + optional media upload
- [ ] `GET /api/posts` — cursor-based home feed
- [ ] `POST /api/posts/:id/like` + `DELETE` — toggle like, update `likesCount`
- [ ] `GET/POST /api/posts/:id/comments` — comment thread
- [ ] `GET /api/health`
- [ ] `utils/extractHashtags.js` — parse #tags on post save, upsert Tag documents

### Phase 4 — Frontend Feed UI
- [ ] Layout: Left sidebar (nav) + Center feed + Right panel (suggested/trending)
- [ ] `Feed.jsx` — IntersectionObserver infinite scroll, cursor-based
- [ ] `PostCard.jsx` — avatar, content, media preview, like/comment/share buttons
- [ ] `CreatePostModal.jsx` — textarea with char counter, drag-drop image/video upload
- [ ] `LikeButton.jsx` — optimistic UI (update count instantly, rollback on error)
- [ ] `CommentSection.jsx` — expandable inline comments
- [ ] `MediaViewer.jsx` — lightbox for images/videos

### Phase 5 — Profiles + Follow System
- [ ] `models/Follow.js`
- [ ] `POST/DELETE /api/users/:id/follow` — follow/unfollow, update `followersCount`
- [ ] `app/profile/[username]/page.jsx` — profile page with posts grid + stats
- [ ] `ProfileHeader.jsx` — avatar, cover image, bio, follow button, follower/following counts
- [ ] `ProfilePostGrid.jsx` — 3-column responsive grid
- [ ] `EditProfileForm.jsx` — update name, bio, website, avatar, cover image

### Phase 6 — Explore + Trending
- [ ] `lib/trending.js` + `setInterval` in `server.js` (every 15 min)
- [ ] `GET /api/explore` — trending posts (trendingScore DESC, last 48h) + suggested users
- [ ] `GET /api/tags/:tag` — hashtag feed
- [ ] `GET /api/search` — full-text search on posts (content) and users (name, username)
- [ ] `explore/page.jsx` — tab switcher: Trending | People
- [ ] `TrendingTags.jsx` in right sidebar
- [ ] `SuggestedUsers.jsx` — users with most followers not yet followed

### Phase 7 — Notifications (Real-time)
- [ ] `models/Notification.js`
- [ ] Create notification documents on: like, comment, follow, mention (@username)
- [ ] `socket/notificationEvents.js` — emit `notification:new` to recipient's socket room
- [ ] `SocketContext.jsx` — join `user:{id}` room on connect
- [ ] `GET /api/notifications` + `PATCH` mark-read
- [ ] `notifications/page.jsx` + bell icon with unread badge in Navbar
- [ ] `NotificationItem.jsx` — icon per type, relative timestamp, link to post

### Phase 8 — Polish + Deploy
- [ ] Dark mode (Tailwind `dark:` classes + `localStorage` toggle)
- [ ] Mobile responsive — bottom nav for mobile (`MobileNav.jsx`)
- [ ] Hashtag clickable links → `/explore?tag=javascript`
- [ ] `npm run build` — fix all errors
- [ ] Push to GitHub (private repo)
- [ ] Deploy to Render.com (Node.js Web Service, start: `node server.js`)
- [ ] Set all env vars in Render dashboard
- [ ] UptimeRobot → ping `/api/health` every 5 min
- [ ] Verify: create post → like → comment → follow → receive notification (two browser tabs)

---

## Bash Commands

```bash
# Install dependencies
npm install

# Development (nodemon)
npm run dev

# Production build
npm run build

# Production start
node server.js

# Lint
npm run lint
```

---

## Environment Variables (.env.local)

```env
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=           # openssl rand -base64 32

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/socialspark

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Port
PORT=3000
```

---

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "tailwindcss": "^3",
    "express": "^4.18",
    "socket.io": "^4.7",
    "socket.io-client": "^4.7",
    "mongoose": "^8",
    "mongodb": "^6",
    "next-auth": "5.0.0-beta.25",
    "@auth/mongodb-adapter": "^3",
    "bcryptjs": "^2.4",
    "zod": "^3",
    "cloudinary": "^2",
    "multer": "^1.4",
    "multer-storage-cloudinary": "^4",
    "zustand": "^4",
    "axios": "^1.6",
    "date-fns": "^3",
    "react-hot-toast": "^2",
    "express-rate-limit": "^7",
    "emoji-mart": "^5"
  },
  "devDependencies": {
    "nodemon": "^3",
    "autoprefixer": "^10",
    "postcss": "^8",
    "eslint": "^8",
    "eslint-config-next": "^15"
  },
  "scripts": {
    "dev": "nodemon server.js",
    "build": "next build",
    "start": "node server.js",
    "lint": "next lint"
  }
}
```

---

## Security Rules

- Passwords hashed with bcrypt (rounds: 12)
- Sessions: NextAuth JWT in httpOnly cookies
- API routes protected with `auth()` from `lib/auth.js`
- All inputs validated with Zod before any DB operation
- File uploads: whitelist MIME types (`image/jpeg`, `image/png`, `image/gif`, `image/webp`, `video/mp4`, `video/webm`), max 10 MB images / 50 MB videos
- Socket.io: verify `socket.handshake.auth.token` (user ID) before joining rooms
- CORS: restrict Socket.io to `NEXTAUTH_URL` only
- Rate limiting: 10 req/min on `/api/users` (register), 20 req/min on `/api/posts`
- Sanitize post content to prevent XSS — strip HTML tags, keep plain text + hashtags

---

## Key Files Reference

| File                          | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `server.js`                   | Express + Socket.io + Next.js — production entry     |
| `auth.config.js`              | Edge-safe auth (providers only) → used by proxy.ts   |
| `lib/auth.js`                 | Full NextAuth config (adapter + DB) — Node.js only   |
| `proxy.ts`                    | Next.js 15 middleware — route protection             |
| `lib/db.js`                   | MongoClient singleton (NextAuth adapter)              |
| `lib/mongoose.js`             | Mongoose connection singleton (for models)            |
| `lib/trending.js`             | Trending score calculator                             |
| `utils/extractHashtags.js`    | Parse #tags from post content on save                 |
| `socket/notificationEvents.js`| Real-time notification delivery via Socket.io         |
| `context/SocketContext.jsx`   | Client Socket.io provider                             |
| `hooks/useFeed.js`            | Cursor-based infinite feed with IntersectionObserver  |
| `components/feed/LikeButton.jsx` | Optimistic UI like button                          |

---

## Known Gotchas

1. **Edge runtime crash** — proxy.ts must NEVER import lib/auth.js, mongoose, or mongodb driver.
2. **Render ephemeral filesystem** — pipe all uploads directly to Cloudinary, never disk.
3. **Cursor vs offset pagination** — always use cursor (createdAt + _id) for feeds. Offset skips posts when new content is added while user scrolls.
4. **Like race condition** — use MongoDB `$inc` + upsert on Like model, not read-then-write.
5. **Trending score stale** — recalculate with `setInterval` in server.js, NOT in API routes (too slow per-request).
6. **Hashtags lowercase** — always `.toLowerCase()` before saving to Tag model.
7. **Google OAuth users have no password** — guard bcrypt compare behind `if (credentials)` in signIn callback.
8. **Mongoose singleton in dev** — use `global._mongooseConnection` cache to prevent hundreds of connections on hot reload.
9. **lib/db.js vs lib/mongoose.js** — two separate DB utilities: `lib/db.js` = raw MongoClient for NextAuth adapter; `lib/mongoose.js` = Mongoose for models. Do NOT mix.
10. **Video uploads** — use Cloudinary's `resource_type: 'video'` for mp4/webm. Default is `image` only.

---

## When Compacting

Always preserve:
1. Full list of modified files in the current session
2. Current phase and incomplete checklist items
3. Any unresolved errors or open decisions
4. The auth split architecture (auth.config.js vs lib/auth.js) — easy to break during refactors
5. Socket.io event names exactly as defined — frontend and backend must stay in sync
6. Trending score formula and the 15-min recalculation strategy
