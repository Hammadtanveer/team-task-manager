import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  User,
  ChevronLeft,
  Zap,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex flex-col h-screen fixed top-0 left-0 z-40"
      style={{
        background: "#111318",
        borderRight: "1px solid #1e2029",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-[60px]" style={{ borderBottom: "1px solid #1e2029" }}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-6 w-full"}`}>
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[18px] font-[700] text-white whitespace-nowrap overflow-hidden"
              >
                TaskFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-[16px] px-[12px] mt-[24px] flex flex-col">
        {links.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center ${collapsed ? "justify-center" : "gap-[14px] pr-[16px]"} py-[12px] mb-[6px] rounded-[10px] text-[15px] font-[500] transition-all group relative overflow-hidden`}
              style={{
                color: isActive ? "#a78bfa" : "#94a3b8",
                background: isActive ? "rgba(124,58,237,0.2)" : "transparent",
                borderLeft: isActive ? "3px solid #7c3aed" : "3px solid transparent",
                paddingLeft: collapsed ? undefined : (isActive ? "13px" : "13px"),
              }}
            >
              {/* Hover background for non-active */}
              {!isActive && (
                <div className="absolute inset-0 bg-[#1a1d27] opacity-0 group-hover:opacity-100 transition-opacity z-0 rounded-[10px]" />
              )}
              
              <Icon className="flex-shrink-0 relative z-10" style={{ width: '20px', height: '20px' }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 mt-auto">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-10 rounded-lg transition-colors hover:bg-[#1a1d27]"
          style={{ color: "#6b7280", border: "1px solid #1e2029" }}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </button>
      </div>
    </motion.aside>
  );
}
