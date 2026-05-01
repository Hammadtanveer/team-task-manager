import { motion } from "framer-motion";
import { Clock, AlertTriangle, User } from "lucide-react";

const statusBadge = {
  TODO: "badge-todo",
  IN_PROGRESS: "badge-in-progress",
  DONE: "badge-done",
};

const statusLabel = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function TaskCard({ task, onDragStart }) {
  const isOverdue =
    task.status !== "DONE" &&
    task.due_date &&
    new Date(task.due_date) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      draggable
      onDragStart={(e) => onDragStart?.(e, task)}
      className="p-4 rounded-xl cursor-grab active:cursor-grabbing transition-colors"
      style={{
        background: "#111318",
        border: "1px solid #1e2029",
      }}
      whileHover={{ borderColor: "#7c3aed" }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-white leading-snug pr-2">
          {task.title}
        </h4>
        <span className={`badge ${statusBadge[task.status]} flex-shrink-0`}>
          {statusLabel[task.status]}
        </span>
      </div>

      {task.description && (
        <p className="text-[13px] text-[#94a3b8] mb-4 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {task.due_date && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-[#ef4444]" : "text-[#8A8F98]"}`}>
              {isOverdue ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              <span className="font-mono">
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        {task.assignee && (
          <div className="flex items-center gap-1 text-xs text-[#8A8F98]">
            <User className="w-3 h-3" />
            <span>{task.assignee.name}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
