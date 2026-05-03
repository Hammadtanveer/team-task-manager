import { useAuth } from "../hooks/useAuth";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar({ collapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 h-[60px] fixed top-0 right-0 z-30 transition-all duration-300 navbar-responsive"
      style={{
        '--sidebar-width': collapsed ? '72px' : '240px',
        background: "#111318",
        borderBottom: "1px solid #1e2029",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          className="md:hidden text-[#a1a1aa] p-2 -ml-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Left side: Breadcrumb */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm font-medium text-[#e2e8f0]">Dashboard</span>
          <span className="text-sm text-[#6b7280]">/</span>
          <span className="text-sm text-[#94a3b8]">Overview</span>
        </div>

        {/* Mobile Logo (Visible only on mobile) */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7c3aed] flex items-center justify-center">
            <span className="text-white font-bold text-xs">TF</span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        <span className="hidden xs:inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[#7c3aed]/15 text-[#a78bfa] border border-[#7c3aed]/30">
          {user?.role}
        </span>

        <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-sm font-semibold text-white shadow-sm">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-2 md:px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
