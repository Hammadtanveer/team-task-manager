import { motion } from "framer-motion";

export default function LoadingSpinner({ size = 40, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            border: `2px solid #1f1f1f`,
            borderTopColor: "#7c3aed",
          }}
        />
      </motion.div>
    </div>
  );
}
