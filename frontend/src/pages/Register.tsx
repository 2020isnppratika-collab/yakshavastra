import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Crown, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Udupi");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await api.auth.register({
        name,
        email,
        phone,
        password,
        address: { line1: "", city, state: "Karnataka", pincode: "" },
      });
      login(res.access_token, res.user);
      navigate("/costumes");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center mx-auto shadow-md">
            <Crown className="w-8 h-8 text-red-950" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Create an Account</h2>
          <p className="text-xs text-stone-500">
            Join YakshaVastra to book character sets, crowns & accessories
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Full Name / Troupe Lead
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anand Hegde"
              required
              className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anand@example.com"
              required
              className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98800 12345"
              required
              className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Password (min 6 chars)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Preferred Hub City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:border-red-900 focus:outline-none font-medium"
            >
              <option value="Udupi">Udupi (ಉಡುಪಿ)</option>
              <option value="Mangaluru">Mangaluru (ಮಂಗಳೂರು)</option>
              <option value="Kundapura">Kundapura (ಕುಂದಾಪುರ)</option>
              <option value="Bengaluru">Bengaluru (ಬೆಂಗಳೂರು)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-red-900 hover:bg-red-800 text-amber-100 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            <span>{submitting ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-stone-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-red-900 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
