"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="w-full max-w-[400px] text-center">
        <h2 className="text-[1.875rem] font-normal mb-4" style={{ color: "var(--or-dark-blue)" }}>
          Registration Successful
        </h2>
        <p className="text-sm text-[var(--or-subtle-gray)] mb-6">
          Please check your email to verify your account, then start submitting your rubbish.
        </p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 text-sm text-white"
          style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px]">
      <h2 className="text-[1.875rem] font-normal mb-2 text-center" style={{ color: "var(--or-dark-blue)" }}>
        Sign Up
      </h2>
      <p className="text-sm text-[var(--or-subtle-gray)] text-center mb-6">
        Join the academic rubbish community.
      </p>

      <form onSubmit={handleRegister} className="space-y-3">
        <div>
          <label htmlFor="username" className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Username</label>
          <input
            id="username"
            type="text"
            placeholder="your_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
            style={{ borderRadius: 0 }}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="researcher@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
            style={{ borderRadius: 0 }}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold mb-1" style={{ color: "var(--or-dark-blue)" }}>Password</label>
          <input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-[38px] px-3 text-sm border border-[#ccc] focus:outline-none focus:border-[var(--or-green)]"
            style={{ borderRadius: 0 }}
          />
        </div>
        {error && <p className="text-sm" style={{ color: "var(--destructive)" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[38px] text-sm text-white border-0 cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: "var(--or-green)", borderRadius: 0 }}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <p className="text-sm text-[var(--or-subtle-gray)] text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">Log In</Link>
      </p>
    </div>
  );
}
