import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, CheckSquare, FolderKanban } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { tasksApi, projectsApi } from "../api/axios";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getAll().then((r) => r.data),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.getAll().then((r) => r.data),
  });

  const myTasks = tasks.filter((t) => t.assigned_to === user?.id);
  const completedTasks = myTasks.filter((t) => t.status === "DONE").length;
  const pendingTasks = myTasks.filter((t) => t.status !== "DONE").length;

  const stats = [
    { label: "Projects", value: projects.length, icon: FolderKanban, color: "#8B5CF6" },
    { label: "Assigned", value: myTasks.length, icon: CheckSquare, color: "#3b82f6" },
    { label: "Completed", value: completedTasks, icon: CheckSquare, color: "#10b981" },
    { label: "Pending", value: pendingTasks, icon: CheckSquare, color: "#f59e0b" },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 className="text-[20px] font-semibold text-white mb-6">Profile</h1>

        {/* User info card */}
        <div className="card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold shadow-sm"
              style={{ background: "#111318", border: "1px solid #1e2029", color: "#EAEAEA" }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-white">{user?.name}</h2>
              <span className={`badge ${user?.role === "ADMIN" ? "badge-admin" : "badge-member"} mt-1`}>
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-3" style={{ borderTop: "1px solid #1e2029", paddingTop: "1.5rem" }}>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#8A8F98]" />
              <span className="text-[13px] text-[#8A8F98]">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-[#8A8F98]" />
              <span className="text-[13px] text-[#8A8F98]">{user?.role}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-[#8A8F98]" />
              <span className="text-[13px] text-[#8A8F98] font-mono">ID: {user?.id}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card flex flex-col items-center justify-center text-center">
              <Icon className="w-5 h-5 mb-3" style={{ color }} />
              <p className="text-3xl font-bold text-white font-mono">{value}</p>
              <p className="text-[13px] text-[#8A8F98] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
