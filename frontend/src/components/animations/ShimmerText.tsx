import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p";
}

export function ShimmerText({ children, className, as: Component = "span" }: ShimmerTextProps) {
  return (
    <Component
      className={cn(
        "relative inline-block bg-gradient-to-r from-white via-primary-200 to-white bg-clip-text text-transparent bg-[length:200%_100%]",
        className
      )}
      style={{
        animation: "shimmer-text 3s ease-in-out infinite",
      }}
    >
      {children}
      <style>{`
        @keyframes shimmer-text {
          0%, 100% {
            background-position: 200% center;
          }
          50% {
            background-position: 0% center;
          }
        }
      `}</style>
    </Component>
  );
}

// Animated gradient text
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p";
  gradient?: "primary" | "accent" | "mixed";
}

const gradientClasses = {
  primary: "from-primary-400 via-primary-500 to-primary-400",
  accent: "from-accent-400 via-accent-500 to-accent-400",
  mixed: "from-primary-400 via-accent-400 to-primary-400",
};

export function GradientText({
  children,
  className,
  as: Component = "span",
  gradient = "mixed",
}: GradientTextProps) {
  return (
    <Component
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        gradientClasses[gradient],
        className
      )}
    >
      {children}
    </Component>
  );
}

// Typewriter effect
interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export function TypewriterText({ text, className, speed = 50 }: TypewriterTextProps) {
  return (
    <motion.span className={className}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * (speed / 1000) }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
