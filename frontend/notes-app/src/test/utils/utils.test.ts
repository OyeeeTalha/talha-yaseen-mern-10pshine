import { describe, it, expect } from "vitest";
import {
  formatDate,
  getGreeting,
  getDeterministicColor,
  calculateTimeRemaining,
} from "@/lib/utils";

describe("Utils Functions", () => {
  describe("formatDate", () => {
    it("formats recent date as relative time", () => {
      const twoHoursAgo = new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString();
      const formatted = formatDate(twoHoursAgo);
      expect(formatted).toMatch(/\d+h ago/);
    });

    it("formats date from this year correctly", () => {
      const date = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const formatted = formatDate(date);
      expect(formatted).toMatch(
        /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/,
      );
    });

    it('returns "Just now" for very recent dates', () => {
      const justNow = new Date().toISOString();
      const result = formatDate(justNow);
      expect(result).toBe("Just now");
    });

    it("handles invalid date gracefully", () => {
      const result = formatDate("invalid-date");
      expect(result).toBeTruthy(); // Should not crash
    });
  });

  describe("getGreeting", () => {
    it("returns greeting based on current time", () => {
      const greeting = getGreeting();
      expect(["Good Morning", "Good Afternoon", "Good Evening"]).toContain(
        greeting,
      );
    });

    it("greeting is a non-empty string", () => {
      const greeting = getGreeting();
      expect(greeting.length).toBeGreaterThan(0);
      expect(greeting).toMatch(/Good (Morning|Afternoon|Evening)/);
    });
  });

  describe("getDeterministicColor", () => {
    it("returns consistent color for same input", () => {
      const color1 = getDeterministicColor(5);
      const color2 = getDeterministicColor(5);
      expect(color1).toBe(color2);
    });

    it("returns different colors for different inputs", () => {
      const color1 = getDeterministicColor(1);
      const color2 = getDeterministicColor(2);
      expect(color1).not.toBe(color2);
    });

    it("returns valid hex color code", () => {
      const color = getDeterministicColor(10);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe("calculateTimeRemaining", () => {
    it("calculates days remaining correctly", () => {
      // trashedAt is the time when note was trashed (in seconds)
      // Function adds 30 days to it and calculates remaining time
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysAgo = now - 7 * 24 * 60 * 60;
      const result = calculateTimeRemaining(sevenDaysAgo);

      expect(result.formattedTime).toMatch(/\d+d \d+h/);
      expect(result.isExpired).toBe(false);
      expect(result.daysLeft).toBeGreaterThan(20); // Should have ~23 days left
    });

    it("calculates hours remaining when days are 0", () => {
      // Set trashedAt to 30 days ago minus 3 hours (so 3 hours remaining)
      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysAgoMinus3Hours = now - 30 * 24 * 60 * 60 + 3 * 60 * 60;
      const result = calculateTimeRemaining(thirtyDaysAgoMinus3Hours);

      // Should show hours and minutes format (no days)
      expect(result.formattedTime).toMatch(/\d+h \d+m/);
      expect(result.isExpired).toBe(false);
    });

    it("detects expired time correctly", () => {
      // Set trashedAt to more than 30 days ago
      const now = Math.floor(Date.now() / 1000);
      const overThirtyDaysAgo = now - 31 * 24 * 60 * 60;
      const result = calculateTimeRemaining(overThirtyDaysAgo);

      expect(result.isExpired).toBe(true);
      expect(result.formattedTime).toBe("Expired");
    });

    it("handles edge case of 30 days", () => {
      // Trashed just now, should have full 30 days remaining
      const now = Math.floor(Date.now() / 1000);
      const result = calculateTimeRemaining(now);

      expect(result.formattedTime).toMatch(/\d+d \d+h/);
      expect(result.isExpired).toBe(false);
      expect(result.daysLeft).toBeGreaterThanOrEqual(29);
    });

    it("formats minutes and seconds correctly", () => {
      // Set trashedAt to 30 days ago minus 2 minutes (so 2 minutes remaining)
      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysAgoMinus2Min = now - 30 * 24 * 60 * 60 + (2 * 60 + 30);
      const result = calculateTimeRemaining(thirtyDaysAgoMinus2Min);

      // Should show minutes and seconds format
      expect(result.formattedTime).toMatch(/\d+m \d+s/);
      expect(result.isExpired).toBe(false);
    });
  });
});
