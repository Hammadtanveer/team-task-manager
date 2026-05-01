import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "MEMBER",
  });
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role } = form;

    if (!name || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await signup(name, email, password, role);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#0d0d12]">
      {/* Lofi Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-40 mix-blend-lighten"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#0d0d12]/50 to-[#0d0d12]" />
      
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[340px] z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#EAEAEA] flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Zap className="w-6 h-6 text-[#111111]" fill="currentColor" />
          </div>
          <h1 className="text-xl font-semibold text-[#EAEAEA]">Create account</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Full Name</label>
            <input
              id="signup-name"
              type="text"
              value={form.name}
              onChange={update("name")}
              placeholder="John Doe"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Email</label>
            <input
              id="signup-email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Password</label>
            <input
              id="signup-password"
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder="Min. 6 characters"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Confirm Password</label>
            <input
              id="signup-confirm-password"
              type="password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Role</label>
            <select
              id="signup-role"
              value={form.role}
              onChange={update("role")}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-2"
          >
            {submitting ? (
              <LoadingSpinner size={16} />
            ) : (
              <>
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#666666] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#EAEAEA] hover:underline transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
