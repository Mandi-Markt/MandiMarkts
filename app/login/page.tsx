"use client";

import { useState } from "react";
import { createClient } from "@/src/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();

    if (isSignup) {
      // Sign up flow
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create profile
        const role = email === "raj.markts@gmail.com" ? "admin" : "user";
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: email,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        setSuccess("Account created! You can now sign in.");
        setIsSignup(false);
        setPassword("");
        setConfirmPassword("");
      }
    } else {
      // Login flow
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Set role based on email
        const role = email === "raj.markts@gmail.com" ? "admin" : "user";
        
        // Store/update profile
        await supabase.from("profiles").upsert({
          id: data.session.user.id,
          email: email,
          role: role,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

        // Redirect to catalog
        router.push("/catalog");
        router.refresh();
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFECB3] to-[#FFD700] flex flex-col">
      {/* Header with Blinkit-style yellow */}
      <header className="bg-[#FFD700] px-4 py-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-black">Mandi Markt</span>
            <span className="text-xs font-bold bg-black text-[#FFD700] px-2 py-1 rounded">INSTANT</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Toggle tabs */}
          <div className="flex bg-white rounded-2xl shadow-sm p-1 mb-6">
            <button
              onClick={() => {
                setIsSignup(false);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                !isSignup
                  ? "bg-[#FFD700] text-black shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignup(true);
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                isSignup
                  ? "bg-[#FFD700] text-black shadow-md"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900">
              {isSignup ? "Create Account" : "Welcome Back!"}
            </h2>
            <p className="mt-2 text-gray-600 font-medium">
              {isSignup 
                ? "Sign up to start ordering wholesale products" 
                : "Sign in to order wholesale products"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#FFD700] focus:bg-white transition-all"
                />
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#FFD700] focus:bg-white transition-all"
                />
              </div>

              {/* Confirm Password - only for signup */}
              {isSignup && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required={isSignup}
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#FFD700] focus:bg-white transition-all"
                  />
                </div>
              )}

              {/* Forgot password - only for login */}
              {!isSignup && (
                <div className="text-right">
                  <button type="button" className="text-sm font-semibold text-[#2E7D32] hover:underline">
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit button - Blinkit yellow */}
              <button
                type="submit"
                disabled={loading || !email || !password || (isSignup && !confirmPassword)}
                className="w-full rounded-xl bg-[#FFD700] px-5 py-4 text-lg font-black text-black hover:bg-[#FFC107] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading 
                  ? (isSignup ? "Creating Account..." : "Signing in...") 
                  : (isSignup ? "Create Account" : "Sign In")}
              </button>
            </form>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-600 text-sm font-semibold text-center">{success}</p>
              </div>
            )}

            {/* Divider - only show for login */}
            {!isSignup && (
              <>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm font-medium text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Demo accounts */}
                <div className="mt-6 space-y-3">
                  <p className="text-center text-sm font-medium text-gray-500">Quick Demo Login</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("raj.markts@gmail.com");
                        setPassword("admin123");
                        setIsSignup(false);
                      }}
                      className="px-3 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-bold hover:bg-[#1B5E20] transition-colors"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("user@demo.com");
                        setPassword("user123");
                        setIsSignup(false);
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                      Retailer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Switch mode link */}
          <p className="mt-6 text-center text-gray-600 font-medium">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
                setSuccess(null);
              }}
              className="text-[#2E7D32] font-bold hover:underline"
            >
              {isSignup ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-4">
        <p className="text-center text-sm text-gray-500 font-medium">
          © 2025 Mandi Markt - Wholesale Made Easy
        </p>
      </div>
    </div>
  );
}
