import { describe, it, expect, vi } from "vitest";
import {
  logger,
  setUserContext,
  clearUserContext,
  logApiRequest,
  logApiResponse,
  logApiError,
} from "@/lib/logger";

describe("Logger", () => {
  it("exports logger instance", () => {
    expect(logger).toBeDefined();
    expect(logger.info).toBeInstanceOf(Function);
    expect(logger.error).toBeInstanceOf(Function);
    expect(logger.debug).toBeInstanceOf(Function);
    expect(logger.warn).toBeInstanceOf(Function);
  });

  it("setUserContext creates child logger with user info", () => {
    setUserContext("user123", "test@example.com");
    expect(logger).toBeDefined();
  });

  it("clearUserContext resets to base logger", () => {
    setUserContext("user123", "test@example.com");
    clearUserContext();
    expect(logger).toBeDefined();
  });

  describe("logApiRequest", () => {
    it("logs API requests with correct data", () => {
      const debugSpy = vi.spyOn(logger, "debug");

      logApiRequest("POST", "/api/notes", { title: "Test" });

      expect(debugSpy).toHaveBeenCalledWith({
        msg: "API Request",
        method: "POST",
        url: "/api/notes",
        data: { title: "Test" },
      });
    });
  });

  describe("logApiResponse", () => {
    it("logs API responses with status code", () => {
      const debugSpy = vi.spyOn(logger, "debug");

      logApiResponse("POST", "/api/notes", 201, { id: "123" });

      expect(debugSpy).toHaveBeenCalledWith({
        msg: "API Response",
        method: "POST",
        url: "/api/notes",
        status: 201,
        data: { id: "123" },
      });
    });
  });

  describe("logApiError", () => {
    it("logs API errors with error details", () => {
      const errorSpy = vi.spyOn(logger, "error");
      const testError = new Error("Test error");

      logApiError("POST", "/api/notes", testError, 500);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: "API Error",
          method: "POST",
          url: "/api/notes",
          status: 500,
          error: expect.objectContaining({
            message: "Test error",
            name: "Error",
          }),
        }),
      );
    });
  });
});
