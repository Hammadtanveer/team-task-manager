import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { tasksApi, projectsApi, usersApi } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import TaskCard from "../components/TaskCard";

const COLUMNS = [
  { key: "TODO", label: "Todo", dot: "#818cf8" },
  { key: "IN_PROGRESS", label: "In Progress", dot: "#fbbf24" },
  { key: "DONE", label: "Done", dot: "#34d399" },
];

export default function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(false);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    due_date: "",
    project_id: "",
    assigned_to: "",
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getAll().then((r) => r.data.tasks),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.getAll().then((r) => r.data.projects),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.getAll().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created");
      setModal(false);
      resetForm();
    },
    onError: (e) => toast.error(e.response?.data?.detail || "Failed"),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }) => tasksApi.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(`Task moved to ${data.data.status.replace("_", " ")}`);
    },
    onError: (e) => toast.error(e.response?.data?.detail || "Failed to move task"),
  });

  const resetForm = () =>
    setForm({ title: "", description: "", status: "TODO", due_date: "", project_id: "", assigned_to: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.project_id) {
      toast.error("Title and project are required");
      return;
    }
    const payload = {
      ...form,
      project_id: parseInt(form.project_id),
      assigned_to: form.assigned_to ? parseInt(form.assigned_to) : null,
      due_date: form.due_date || null,
    };
    createMut.mutate(payload);
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("currentStatus", task.status);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("taskId");
    const currentStatus = e.dataTransfer.getData("currentStatus");
    if (currentStatus !== newStatus) {
      updateStatusMut.mutate({ id: parseInt(taskId), status: newStatus });
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[20px] font-semibold text-white mb-1">Tasks</h1>
            <p className="text-sm text-[#8A8F98]">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} across {COLUMNS.length} columns
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Task
            </button>
          )}
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-96 rounded-xl min-w-[300px] flex-1" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(({ key, label, dot }) => {
              const columnTasks = tasks.filter((t) => t.status === key);
              return (
                <div
                  key={key}
                  className={`kanban-column min-w-[300px] flex-1 ${dragOverCol === key ? "drag-over" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverCol(key);
                  }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={(e) => handleDrop(e, key)}
                >
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: dot }} />
                    <span className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
                      {label}
                    </span>
                    <span className="text-[13px] text-[#666666] font-mono ml-auto">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
                    ))}
                    {columnTasks.length === 0 && (
                      <p className="text-center text-xs text-[#333] py-8">
                        Drop tasks here
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.8)" }}
            onClick={() => setModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="card w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-white">New Task</h2>
                <button
                  onClick={() => setModal(false)}
                  className="text-[#8A8F98] hover:text-[#EAEAEA] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Task title"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional description"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Project</label>
                    <select
                      value={form.project_id}
                      onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                      className="input-field appearance-none cursor-pointer"
                    >
                      <option value="">Select project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="input-field appearance-none cursor-pointer"
                    >
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Due Date</label>
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Assign To</label>
                    <select
                      value={form.assigned_to}
                      onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                      className="input-field appearance-none cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button type="button" onClick={() => setModal(false)} className="btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">Create</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
