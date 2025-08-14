import { motion } from "framer-motion";
import LogoMark from "@/components/LogoMark";

export const Logo = () => (
  <div className="group flex items-center gap-3">
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="h-24 w-24 flex justify-center items-center relative p-2 rounded-3xl bg-gradient-to-br from-[#1E90FF] via-[#4169E1] to-[#000080] overflow-hidden shadow-lg"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ["-200%", "200%"] }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      />
      <LogoMark className="relative z-10 drop-shadow-lg w-14 h-14" />
    </motion.div>
  </div>
);
