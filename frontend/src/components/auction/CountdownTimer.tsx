import { motion } from "framer-motion";
import { Clock, AlertTriangle, Timer } from "lucide-react";
import { useCountdown, useUrgencyLevel } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endTime: bigint | number;
  variant?: "default" | "compact" | "large";
  showLabel?: boolean;
  className?: string;
}

export function CountdownTimer({
  endTime,
  variant = "default",
  showLabel = true,
  className,
}: CountdownTimerProps) {
  const countdown = useCountdown(endTime);
  const urgency = useUrgencyLevel(endTime);

  const urgencyStyles = {
    urgent: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      glow: "shadow-red-500/20",
    },
    warning: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-400",
      glow: "shadow-yellow-500/20",
    },
    normal: {
      bg: "bg-dark-700",
      border: "border-dark-600",
      text: "text-gray-300",
      glow: "",
    },
  };

  const styles = urgencyStyles[urgency];

  if (countdown.isExpired) {
    return (
      <div className={cn("flex items-center gap-2 text-gray-500", className)}>
        <Timer className="w-4 h-4" />
        <span>Auction Ended</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border",
          styles.bg,
          styles.border,
          styles.text,
          className
        )}
      >
        <Clock className="w-3 h-3" />
        <span className="font-mono text-sm">{countdown.formatted}</span>
      </div>
    );
  }

  if (variant === "large") {
    return (
      <div className={cn("text-center", className)}>
        {showLabel && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {urgency === "urgent" && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </motion.div>
            )}
            <span className={cn("text-sm font-medium", styles.text)}>
              {urgency === "urgent"
                ? "Ending Soon!"
                : urgency === "warning"
                ? "Time Running Low"
                : "Time Remaining"}
            </span>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          {countdown.days > 0 && (
            <TimeUnit value={countdown.days} label="Days" styles={styles} />
          )}
          <TimeUnit value={countdown.hours} label="Hours" styles={styles} />
          <TimeUnit value={countdown.minutes} label="Mins" styles={styles} />
          <TimeUnit value={countdown.seconds} label="Secs" styles={styles} animate />
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border",
        styles.bg,
        styles.border,
        urgency === "urgent" && "shadow-lg",
        styles.glow,
        className
      )}
    >
      <Clock className={cn("w-4 h-4", styles.text)} />
      <div className="flex items-center gap-2 font-mono">
        {countdown.days > 0 && (
          <span className={styles.text}>{countdown.days}d</span>
        )}
        <span className={styles.text}>
          {String(countdown.hours).padStart(2, "0")}:
          {String(countdown.minutes).padStart(2, "0")}:
          {String(countdown.seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

interface TimeUnitProps {
  value: number;
  label: string;
  styles: {
    bg: string;
    border: string;
    text: string;
  };
  animate?: boolean;
}

function TimeUnit({ value, label, styles, animate }: TimeUnitProps) {
  return (
    <div className="text-center">
      <motion.div
        key={animate ? value : undefined}
        initial={animate ? { scale: 1.1 } : undefined}
        animate={animate ? { scale: 1 } : undefined}
        className={cn(
          "w-16 h-16 rounded-xl flex items-center justify-center border",
          styles.bg,
          styles.border
        )}
      >
        <span className={cn("font-mono text-2xl font-bold", styles.text)}>
          {String(value).padStart(2, "0")}
        </span>
      </motion.div>
      <span className="text-xs text-gray-500 mt-1 block">{label}</span>
    </div>
  );
}

// Animated pulse countdown for urgent auctions
interface PulseCountdownProps {
  endTime: bigint | number;
  className?: string;
}

export function PulseCountdown({ endTime, className }: PulseCountdownProps) {
  const countdown = useCountdown(endTime);
  const urgency = useUrgencyLevel(endTime);

  if (countdown.isExpired || urgency !== "urgent") {
    return null;
  }

  return (
    <motion.div
      className={cn(
        "fixed bottom-4 right-4 z-50 p-4 rounded-xl",
        "bg-red-500/10 border border-red-500/30 backdrop-blur-sm",
        className
      )}
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(239, 68, 68, 0)",
          "0 0 0 10px rgba(239, 68, 68, 0.1)",
          "0 0 0 0 rgba(239, 68, 68, 0)",
        ],
      }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <div>
          <p className="text-sm font-medium text-red-300">Auction Ending!</p>
          <p className="font-mono text-lg text-red-400">{countdown.formatted}</p>
        </div>
      </div>
    </motion.div>
  );
}
