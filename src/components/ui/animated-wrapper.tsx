"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedWrapperProps {
  children: ReactNode;
  animation?: "fadeIn" | "slideIn" | "scaleIn";
  delay?: number;
  className?: string;
}

const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
};

export function AnimatedWrapper({
  children,
  animation = "fadeIn",
  delay = 0,
  className = "",
}: AnimatedWrapperProps) {
  return (
    <motion.div
      initial={animations[animation].initial}
      animate={animations[animation].animate}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
