import { motion } from "framer-motion";
import { Trash2, Edit3, FolderKanban, Calendar } from "lucide-react";

export default function ProjectCard({ project, onEdit, onDelete, isAdmin }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#7c3aed]" />
            <h3 className="text-base font-semibold text-white">{project.name}</h3>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(project)}
                className="p-1.5 rounded-md text-[#8A8F98] hover:text-[#EAEAEA] hover:bg-[#1a1d27] transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(project.id)}
                className="p-1.5 rounded-md text-[#8A8F98] hover:text-[#ef4444] hover:bg-[#1a1d27] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-[#8A8F98] leading-relaxed line-clamp-2 mb-4">
          {project.description || "No description"}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[#8A8F98]">
        <Calendar className="w-3 h-3" />
        <span className="text-xs font-mono">
          {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
}
