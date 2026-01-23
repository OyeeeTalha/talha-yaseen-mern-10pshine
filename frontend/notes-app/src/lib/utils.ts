import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TRASH_PERIOD_SECONDS } from "../config/trash.config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDeterministicColor(num: number): string {
  const hash = Math.abs(num);
  // Golden angle approximation to ensure well-distributed colors
  const hue = (hash * 137.508) % 360;
  // Fixed saturation and lightness for consistent vibrant look
  const saturation = 70;
  const lightness = 50;

  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}

export const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return "Just now";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const calculateTimeRemaining = (
  trashedAt: number,
): {
  isExpired: boolean;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  formattedTime: string;
} => {
  const currentTime = Math.floor(Date.now() / 1000);
  const deleteAt = trashedAt + TRASH_PERIOD_SECONDS;
  const secondsRemaining = deleteAt - currentTime;

  if (secondsRemaining <= 0) {
    return {
      isExpired: true,
      daysLeft: 0,
      hoursLeft: 0,
      minutesLeft: 0,
      secondsLeft: 0,
      formattedTime: "Expired",
    };
  }

  const daysLeft = Math.floor(secondsRemaining / 86400);
  const hoursLeft = Math.floor((secondsRemaining % 86400) / 3600);
  const minutesLeft = Math.floor((secondsRemaining % 3600) / 60);
  const secondsLeft = secondsRemaining % 60;

  let formattedTime = "";
  if (daysLeft > 0) {
    formattedTime = `${daysLeft}d ${hoursLeft}h`;
  } else if (hoursLeft > 0) {
    formattedTime = `${hoursLeft}h ${minutesLeft}m`;
  } else if (minutesLeft > 0) {
    formattedTime = `${minutesLeft}m ${secondsLeft}s`;
  } else {
    formattedTime = `${secondsLeft}s`;
  }

  return {
    isExpired: false,
    daysLeft,
    hoursLeft,
    minutesLeft,
    secondsLeft,
    formattedTime,
  };
};

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) & {
  flush: () => void;
  cancel: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFunc = (...args: Parameters<T>) => {
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  // Immediately execute pending function
  debouncedFunc.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  // Cancel pending execution
  debouncedFunc.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFunc;
}
