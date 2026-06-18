import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ROLES = [
  "AI / ML Researcher",
  "Full-stack Builder",
  "Data Nerd",
  "World-model curious",
];

export default function RotatingTitle() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % ROLES.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="relative inline-flex items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROLES[i]}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold"
        >
          {ROLES[i]}
        </motion.span>
      </AnimatePresence>
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1.0, repeat: Infinity, ease: "linear" }}
        className="ml-1 w-[2px] h-5 sm:h-6 bg-gray-600 dark:bg-gray-300 inline-block align-middle"
      />
    </span>
  );
}
