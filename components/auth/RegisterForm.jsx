"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import axios from "axios";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/users", form);
      const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (res?.ok) { router.push("/feed"); router.refresh(); }
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const field = (key, label, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type} required
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field("name", "Full name", "text", "Your name")}
      {field("username", "Username", "text", "username (a-z, 0-9, _)")}
      {field("email", "Email", "email", "you@example.com")}
      {field("password", "Password", "password", "Min 6 characters")}
      <button
        type="submit" disabled={loading}
        className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
      </p>
    </form>
  );
}
