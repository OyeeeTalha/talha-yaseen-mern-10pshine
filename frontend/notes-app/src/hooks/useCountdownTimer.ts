import { useState, useEffect } from "react";
import { calculateTimeRemaining } from "@/lib/utils";

interface CountdownResult {
    timeLeft: string;
    isExpired: boolean;
    daysLeft: number;
    hoursLeft: number;
    minutesLeft: number;
    secondsLeft: number;
}

/**
 * Custom hook for countdown timer functionality.
 * Uses the existing calculateTimeRemaining utility from lib/utils.
 * 
 * @param targetDate - The target date/time to count down to (Date, string, or Unix timestamp)
 * @param options - Optional configuration
 * @returns CountdownResult with formatted time and individual components
 */
export function useCountdownTimer(
    targetDate: Date | string | number | null | undefined,
    options?: {
        onExpire?: () => void;
        updateInterval?: number;
    }
): CountdownResult {
    const [result, setResult] = useState<CountdownResult>({
        timeLeft: "",
        isExpired: false,
        daysLeft: 0,
        hoursLeft: 0,
        minutesLeft: 0,
        secondsLeft: 0,
    });

    useEffect(() => {
        if (!targetDate) {
            setResult({
                timeLeft: "",
                isExpired: true,
                daysLeft: 0,
                hoursLeft: 0,
                minutesLeft: 0,
                secondsLeft: 0,
            });
            return;
        }

        const updateTimer = () => {
            const remaining = calculateTimeRemaining(targetDate);

            setResult({
                timeLeft: remaining.formattedTime,
                isExpired: remaining.isExpired,
                daysLeft: remaining.daysLeft,
                hoursLeft: remaining.hoursLeft,
                minutesLeft: remaining.minutesLeft,
                secondsLeft: remaining.secondsLeft,
            });

            if (remaining.isExpired && options?.onExpire) {
                options.onExpire();
            }
        };

        updateTimer(); // Initial call
        const interval = setInterval(updateTimer, options?.updateInterval ?? 1000);

        return () => clearInterval(interval);
    }, [targetDate, options?.onExpire, options?.updateInterval]);

    return result;
}

/**
 * Calculates the next allowed time based on a cooldown period.
 * Useful for rate-limiting UI elements.
 * 
 * @param lastTimestamp - Unix timestamp (seconds) of the last action
 * @param cooldownSeconds - Cooldown period in seconds
 * @returns Target Date for countdown, or null if cooldown has passed
 */
export function getCooldownTargetDate(
    lastTimestamp: number | null | undefined,
    cooldownSeconds: number
): Date | null {
    if (!lastTimestamp) return null;

    const nextAllowedTime = (lastTimestamp + cooldownSeconds) * 1000;
    if (Date.now() >= nextAllowedTime) return null;

    return new Date(nextAllowedTime);
}
