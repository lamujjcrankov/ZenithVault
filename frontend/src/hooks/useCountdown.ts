import { useState, useEffect, useMemo } from "react";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
  formatted: string;
}

export function useCountdown(targetTimestamp: bigint | number | undefined): CountdownResult {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!targetTimestamp) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalSeconds: 0,
        formatted: "00:00:00",
      };
    }

    const target = typeof targetTimestamp === "bigint"
      ? Number(targetTimestamp) * 1000
      : targetTimestamp * 1000;

    const diff = target - now;

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalSeconds: 0,
        formatted: "Ended",
      };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formatted: string;
    if (days > 0) {
      formatted = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      formatted = `${minutes}m ${seconds}s`;
    } else {
      formatted = `${seconds}s`;
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
      totalSeconds,
      formatted,
    };
  }, [targetTimestamp, now]);
}

// Hook for determining urgency level based on time remaining
export function useUrgencyLevel(targetTimestamp: bigint | number | undefined): "urgent" | "warning" | "normal" {
  const { totalSeconds, isExpired } = useCountdown(targetTimestamp);

  if (isExpired) return "normal";
  if (totalSeconds < 3600) return "urgent"; // < 1 hour
  if (totalSeconds < 86400) return "warning"; // < 1 day
  return "normal";
}
