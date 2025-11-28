import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: "lift" | "glow" | "border" | "none";
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  hoverEffect = "lift",
}: AnimatedCardProps) {
  const hoverClasses = {
    lift: "hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/10",
    glow: "hover:shadow-lg hover:shadow-primary-500/20",
    border: "hover:border-primary-500/50",
    none: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: hoverEffect === "lift" ? 1.02 : 1 }}
      className={cn(
        "bg-dark-800 border border-dark-600 rounded-xl transition-all duration-300",
        hoverClasses[hoverEffect],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// Floating card with continuous animation
interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  floatDistance?: number;
  duration?: number;
}

export function FloatingCard({
  children,
  className,
  floatDistance = 10,
  duration = 3,
}: FloatingCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-dark-800 border border-dark-600 rounded-xl",
        className
      )}
      animate={{
        y: [-floatDistance / 2, floatDistance / 2, -floatDistance / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Reveal on scroll card
interface RevealCardProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

const directionVariants = {
  up: { opacity: 0, y: 50 },
  down: { opacity: 0, y: -50 },
  left: { opacity: 0, x: 50 },
  right: { opacity: 0, x: -50 },
};

export function RevealCard({
  children,
  className,
  direction = "up",
}: RevealCardProps) {
  return (
    <motion.div
      initial={directionVariants[direction]}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "bg-dark-800 border border-dark-600 rounded-xl",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
