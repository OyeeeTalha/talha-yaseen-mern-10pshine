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
      // Simulate expiration in 23 days
      const now = Math.floor(Date.now() / 1000);
      const expireIn23Days = now + 23 * 24 * 60 * 60;
      const result = calculateTimeRemaining(expireIn23Days);

      expect(result.formattedTime).toMatch(/\d+d \d+h/);
      expect(result.isExpired).toBe(false);
      expect(result.daysLeft).toBe(23);
    });

    it("calculates hours remaining when days are 0", () => {
      // Simulate expiration in 3 hours
      const now = Math.floor(Date.now() / 1000);
      const expireIn3Hours = now + 3 * 60 * 60;
      const result = calculateTimeRemaining(expireIn3Hours);

      // Should show hours and minutes format (no days)
      expect(result.formattedTime).toMatch(/\d+h \d+m/);
      expect(result.isExpired).toBe(false);
    });

    it("detects expired time correctly", () => {
      // Set expireAt to a past date
      const now = Math.floor(Date.now() / 1000);
      const expiredYesterday = now - 24 * 60 * 60;
      const result = calculateTimeRemaining(expiredYesterday);

      expect(result.isExpired).toBe(true);
      expect(result.formattedTime).toBe("Expired");
    });

    it("handles edge case of 30 days", () => {
      // Expire in exactly 30 days
      const now = Math.floor(Date.now() / 1000);
      const expireIn30Days = now + 30 * 24 * 60 * 60;
      const result = calculateTimeRemaining(expireIn30Days);

      expect(result.formattedTime).toMatch(/\d+d \d+h/);
      expect(result.isExpired).toBe(false);
      expect(result.daysLeft).toBe(30);
    });

    it("formats minutes and seconds correctly", () => {
      // Expire in 2 minutes 30 seconds
      const now = Math.floor(Date.now() / 1000);
      const expireIn2Min30s = now + 2 * 60 + 30;
      const result = calculateTimeRemaining(expireIn2Min30s);

      // Should show minutes and seconds format
      expect(result.formattedTime).toMatch(/\d+m \d+s/);
      expect(result.isExpired).toBe(false);
    });
  });
});
