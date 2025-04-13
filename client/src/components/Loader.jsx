// src/components/Loader.jsx
import React from "react";
import { motion } from "framer-motion";

function Loader() {
  const loaderBars = {
    initial: { scaleY: 0.4, opacity: 0.5 },
    animate: {
      scaleY: [0.4, 1, 0.4],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 0.8,
        ease: "easeInOut",
        repeat: Infinity,
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
      <div className="flex space-x-2">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            className="w-2 h-8 bg-indigo-500 rounded"
            variants={loaderBars}
            initial="initial"
            animate="animate"
          />
        ))}
      </div>
    </div>
  );
}

export default Loader;