import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export const metadata = { title: "Sign in — SocialSpark" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #4338ca 0%, #6d28d9 45%, #be185d 100%)" }}>

        {/* Decoration blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)", filter: "blur(50px)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", filter: "blur(60px)" }} />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight">SocialSpark</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4 tracking-tight">
            Connect with the world
          </h1>
          <p className="text-lg text-white/70 mb-12 leading-relaxed">
            Share your story, discover trending content, and build real connections.
          </p>

          <div className="space-y-4">
            {[
              { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", text: "Follow people who inspire you" },
              { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", text: "Like and comment on posts" },
              { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", text: "Discover what&apos;s trending" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/12 border border-white/15 flex items-center justify-center shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon}/>
                  </svg>
                </div>
                <span className="text-white/85 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/40 text-xs font-medium">© 2026 SocialSpark. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50 dark:bg-gray-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SocialSpark</span>
          </div>

          <div className="card shadow-card p-8">
            <h2 className="text-2xl font-bold mb-1 tracking-tight">Welcome back</h2>
            <p className="text-gray-400 text-sm mb-7">Sign in to your account to continue</p>
            <LoginForm />
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
