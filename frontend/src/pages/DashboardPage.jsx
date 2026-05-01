import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { projectsApi, tasksApi } from "../api/axios";
import StatsCard from "../components/StatsCard";

const PIE_COLORS = ["#818cf8", "#fbbf24", "#34d399"];

export default function DashboardPage() {
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.getAll().then((r) => r.data.projects),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getAll().then((r) => r.data.tasks),
  });

  const totalProjects = projects?.length || 0;
  const totalTasks = tasks?.length || 0;
  const overdueTasks = tasks?.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE').length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'DONE').length || 0;

  const barData = [
    { name: "Todo", count: tasks.filter((t) => t.status === "TODO").length, fill: "#818cf8" },
    { name: "In Progress", count: tasks.filter((t) => t.status === "IN_PROGRESS").length, fill: "#fbbf24" },
    { name: "Done", count: completedTasks, fill: "#34d399" },
  ];

  const pieData = barData.filter((d) => d.count > 0);

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="card px-3 py-2 bg-[#111111]">
          <p className="text-[13px] text-[#EAEAEA]">
            {payload[0].name}: <span className="font-mono">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-[20px] font-semibold text-white mb-1">Dashboard</h1>
        <p className="text-sm text-[#8A8F98] mb-6">Overview of your workspace</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard label="Projects" value={totalProjects} icon={FolderKanban} color="#8B5CF6" delay={0} />
          <StatsCard label="Total Tasks" value={totalTasks} icon={CheckSquare} color="#3b82f6" delay={0.05} />
          <StatsCard label="Overdue" value={overdueTasks} icon={AlertTriangle} color="#ef4444" delay={0.1} />
          <StatsCard label="Completed" value={completedTasks} icon={CheckCircle2} color="#10b981" delay={0.15} />
        </div>

        {/* Charts */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Bar chart */}
          <div className="card w-full lg:w-[58%] flex flex-col justify-center h-[280px]">
            <h2 className="text-[14px] font-semibold text-[#e2e8f0] mb-6">Task Status</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#666666", fontSize: 12 }}
                  axisLine={{ stroke: "#2B2B2B" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#666666", fontSize: 12 }}
                  axisLine={{ stroke: "#2B2B2B" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card w-full lg:w-[40%] flex flex-col justify-center h-[280px]">
            <h2 className="text-[14px] font-semibold text-[#e2e8f0] mb-6">Distribution</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    strokeWidth={0}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-[#52525b] text-sm">
                No tasks yet
              </div>
            )}
            <div className="flex justify-center gap-5 mt-2">
              {barData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                  <span className="text-xs text-[#52525b]">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent tasks */}
        <div className="card overflow-hidden w-full" style={{ padding: 0 }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #1e2029" }}>
            <h2 className="text-[14px] font-semibold text-[#e2e8f0]">Recent Tasks</h2>
          </div>
          {recentTasks.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#52525b]">
              No tasks created yet
            </div>
          ) : (
            <div className="divide-y divide-[#1e2029]">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between px-5 py-[14px]">
                  <div className="flex items-center gap-3">
                    <Clock className="w-3.5 h-3.5 text-[#52525b]" />
                    <span className="text-sm text-white">{task.title}</span>
                  </div>
                  <span
                    className={`badge ${
                      task.status === "DONE"
                        ? "badge-done"
                        : task.status === "IN_PROGRESS"
                        ? "badge-in-progress"
                        : "badge-todo"
                    }`}
                  >
                    {task.status === "IN_PROGRESS" ? "In Progress" : task.status === "DONE" ? "Done" : "Todo"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
