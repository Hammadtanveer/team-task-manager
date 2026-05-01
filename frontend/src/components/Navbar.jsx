import { useAuth } from "../hooks/useAuth";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar({ collapsed }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="flex items-center justify-between px-6 h-[60px] fixed top-0 right-0 z-30 transition-all duration-300"
        style={{
          left: collapsed ? '72px' : '240px',
          background: "#111318",
          borderBottom: "1px solid #1e2029",
        }}
      >
        {/* Mobile menu button */}
        <button
          className="md:hidden text-[#a1a1aa]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Left side: Breadcrumb */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm font-medium text-[#e2e8f0]">Dashboard</span>
          <span className="text-sm text-[#6b7280]">/</span>
          <span className="text-sm text-[#94a3b8]">Overview</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-[#7c3aed]/15 text-[#a78bfa] border border-[#7c3aed]/30">
            {user?.role}
          </span>

          <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-sm font-semibold text-white shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.9)" }}
        >
          <nav className="flex flex-col items-center justify-center h-full gap-6">
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/projects", label: "Projects" },
              { to: "/tasks", label: "Tasks" },
              { to: "/profile", label: "Profile" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="text-lg text-[#a1a1aa] hover:text-white transition-colors"
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
