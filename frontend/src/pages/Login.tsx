import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Crown, Sparkles, Shield, User, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export const Login: React.FC = () => {
  const { login, loginAsDemo, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await api.auth.login({ email, password });
      login(res.access_token, res.user);
      navigate(res.user.role === "admin" ? "/admin" : "/costumes");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = async (role: "customer" | "admin") => {
    try {
      await loginAsDemo(role);
      navigate(role === "admin" ? "/admin" : "/costumes");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not login as demo user");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-md">
            <Crown className="w-8 h-8 text-red-950" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Sign in to YakshaVastra</h2>
          <p className="text-xs text-stone-500">
            Access your costume rentals, reservations, and troupe accounts
          </p>
        </div>

        {/* 1-Click Demo Login Sandbox */}
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Client Demo 1-Click Access</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoClick("customer")}
              className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center space-x-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Demo Customer</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDemoClick("admin")}
              className="p-2.5 rounded-xl bg-red-950 hover:bg-red-900 text-amber-200 border border-amber-500/50 font-bold text-xs shadow-sm transition-colors flex items-center justify-center space-x-1"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-red-900 hover:bg-red-800 text-amber-100 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{submitting ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-stone-500">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-semibold text-red-900 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
