import { motion } from "framer-motion";

export default function StatsCard({ label, value, icon: Icon, color = "#8B5CF6", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-[1px]">
          {label}
        </span>
        <div className="flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#6b7280]" />
        </div>
      </div>
      <p className="text-4xl md:text-[48px] font-[700] text-[#ffffff] font-mono leading-none mt-[12px]">{value}</p>
    </motion.div>
  );
}
