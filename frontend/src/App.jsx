import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import ProfilePage from "./pages/ProfilePage";

import { useAuth } from "./hooks/useAuth";

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

function AnimatedPage({ children }) {
  return <motion.div {...pageTransition}>{children}</motion.div>;
}

function AppLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen app-background">
      <Sidebar collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
      <Navbar collapsed={isCollapsed} />
      
      <div 
        style={{
          marginLeft: isCollapsed ? '72px' : '240px',
          marginTop: '60px',
          padding: '32px 40px',
          minHeight: 'calc(100vh - 60px)',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <main>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/dashboard"
                element={
                  <AnimatedPage>
                    <DashboardPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/projects"
                element={
                  <AnimatedPage>
                    <ProjectsPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/tasks"
                element={
                  <AnimatedPage>
                    <TasksPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/profile"
                element={
                  <AnimatedPage>
                    <ProfilePage />
                  </AnimatedPage>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-[#7c3aed] border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={isAuthPage ? "auth" : "app"}>
        {/* Public routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />}
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
