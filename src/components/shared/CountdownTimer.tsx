"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { formatTimeRemaining } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: number;
  onExpire?: () => void;
  className?: string;
  showIcon?: boolean;
}

export function CountdownTimer({ expiresAt, onExpire, className, showIcon = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const remaining = expiresAt - Date.now();
      setTimeLeft(remaining);
      if (remaining <= 0 && onExpire) {
        onExpire();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (timeLeft === null) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-md border bg-zinc-50 border-zinc-200 text-zinc-500", className)}>
        {showIcon && <Clock className="w-3.5 h-3.5 text-zinc-400" />}
        <span>15:00</span>
      </div>
    );
  }

  const { minutes, seconds, isExpired } = formatTimeRemaining(timeLeft);
  const isUrgent = minutes < 3 && !isExpired;

  if (isExpired) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900", className)}>
        {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
        <span>Response Window Expired</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-md border transition-colors",
        isUrgent
          ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700 animate-pulse"
          : "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        className
      )}
    >
      {showIcon && <Clock className={cn("w-3.5 h-3.5", isUrgent ? "text-amber-600 animate-spin" : "text-blue-600")} />}
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")} remaining
      </span>
    </div>
  );
}
