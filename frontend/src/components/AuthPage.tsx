import React, { useState } from "react";
import { motion } from "motion/react";
import {
  GraduationCap,
  Mail,
  Lock,
  User as UserIcon,
  Building,
} from "lucide-react";
import { authService } from "../services/api";

interface AuthPageProps {
  onLogin: (user: any, token: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
    department: "General",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const data = await authService.login(formData.email, formData.password);
        onLogin(data.user, data.token);
      } else {
        await authService.register(formData);
        setIsLogin(true);
        alert("Registration successful! Please login.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="p-8 bg-slate-800 text-white flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <GraduationCap size={40} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">ASTU Tracker</h1>
            <p className="text-slate-400 text-sm mt-1">
              Complaint Management System
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${isLogin ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${!isLogin ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-500"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  placeholder="name@astu.edu.et"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-rose-500 text-xs font-medium ml-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50 mt-4"
            >
              {loading
                ? "Processing..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
