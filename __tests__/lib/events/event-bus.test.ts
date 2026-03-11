import { describe, it, expect, vi, beforeEach } from "vitest";
import { eventBus } from "@/lib/events/event-bus";

beforeEach(() => {
  // Clear all listeners between tests
  eventBus.off("test-event");
  eventBus.off("other");
  eventBus.off("error-event");
});

describe("EventBus", () => {
  describe("on / emit", () => {
    it("calls handler when event is emitted", async () => {
      const handler = vi.fn();
      eventBus.on("test-event", handler);
      await eventBus.emit("test-event", { foo: 1 });
      expect(handler).toHaveBeenCalledWith({ foo: 1 });
    });

    it("supports multiple handlers for same event", async () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      eventBus.on("test-event", h1);
      eventBus.on("test-event", h2);
      await eventBus.emit("test-event", "data");
      expect(h1).toHaveBeenCalledWith("data");
      expect(h2).toHaveBeenCalledWith("data");
    });

    it("does not call handlers for other events", async () => {
      const handler = vi.fn();
      eventBus.on("test-event", handler);
      await eventBus.emit("other", "x");
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("unsubscribe", () => {
    it("returns unsubscribe function that removes handler", async () => {
      const handler = vi.fn();
      const unsub = eventBus.on("test-event", handler);
      unsub();
      await eventBus.emit("test-event", null);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("off", () => {
    it("removes all handlers for an event", async () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      eventBus.on("test-event", h1);
      eventBus.on("test-event", h2);
      eventBus.off("test-event");
      await eventBus.emit("test-event", null);
      expect(h1).not.toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
    });
  });

  describe("listenerCount", () => {
    it("returns 0 for unknown event", () => {
      expect(eventBus.listenerCount("nonexistent")).toBe(0);
    });

    it("returns correct count", () => {
      eventBus.on("test-event", vi.fn());
      eventBus.on("test-event", vi.fn());
      expect(eventBus.listenerCount("test-event")).toBe(2);
    });
  });

  describe("error handling", () => {
    it("does not throw when a handler errors", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      eventBus.on("error-event", () => {
        throw new Error("handler failure");
      });
      // Should not throw
      await eventBus.emit("error-event", null);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("emit with no handlers", () => {
    it("resolves without error", async () => {
      await expect(eventBus.emit("no-handlers", {})).resolves.toBeUndefined();
    });
  });
});
