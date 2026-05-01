import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import { projectsApi } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import ProjectCard from "../components/ProjectCard";

export default function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, editing: null });
  const [formData, setFormData] = useState({ name: "", description: "" });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.getAll().then((r) => r.data.projects),
  });

  const createMut = useMutation({
    mutationFn: (data) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created");
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.detail || "Failed"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated");
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.detail || "Failed"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: (e) => toast.error(e.response?.data?.detail || "Failed"),
  });

  const openCreate = () => {
    setFormData({ name: "", description: "" });
    setModal({ open: true, editing: null });
  };

  const openEdit = (project) => {
    setFormData({ name: project.name, description: project.description || "" });
    setModal({ open: true, editing: project });
  };

  const closeModal = () => {
    setModal({ open: false, editing: null });
    setFormData({ name: "", description: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Project name required");
      return;
    }
    if (modal.editing) {
      updateMut.mutate({ id: modal.editing.id, data: formData });
    } else {
      createMut.mutate(formData);
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[20px] font-semibold text-white mb-1">Projects</h1>
            <p className="text-sm text-[#8A8F98]">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 w-56"
              />
            </div>
            {isAdmin && (
              <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> New
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-36 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center text-center min-h-[200px]">
            <p className="text-sm text-[#8A8F98]">
              {search ? "No projects match your search" : "No projects yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={openEdit}
                onDelete={(id) => deleteMut.mutate(id)}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.8)" }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="card w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-white">
                  {modal.editing ? "Edit Project" : "New Project"}
                </h2>
                <button onClick={closeModal} className="text-[#8A8F98] hover:text-[#EAEAEA] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Project name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#8A8F98] mb-1.5 block">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <button type="button" onClick={closeModal} className="btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {modal.editing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
