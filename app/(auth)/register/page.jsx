import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";

export const metadata = { title: "Create account — SocialSpark" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-32 right-10 w-72 h-72 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute bottom-16 left-10 w-64 h-64 rounded-full bg-purple-300/30 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold">SocialSpark</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">Join the community today</h1>
          <p className="text-lg text-white/80 mb-12">Millions of people share their moments on SocialSpark every day.</p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "10K+", label: "Active users" },
              { value: "50K+", label: "Posts daily" },
              { value: "99%", label: "Uptime" },
              { value: "Free", label: "Forever" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/50 text-sm">© 2026 SocialSpark. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50 dark:bg-gray-950 overflow-y-auto">
        <div className="w-full max-w-sm my-auto">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-indigo-600">SocialSpark</span>
          </div>

          <div className="card shadow-card p-8">
            <h2 className="text-2xl font-bold mb-1">Create your account</h2>
            <p className="text-gray-500 text-sm mb-6">It&apos;s free and only takes a minute</p>
            <RegisterForm />
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
