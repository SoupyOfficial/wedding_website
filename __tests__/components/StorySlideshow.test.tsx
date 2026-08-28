import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import StorySlideshow from "@/app/(public)/our-story/StorySlideshow";
import { storySlideshowImages } from "@/app/(public)/our-story/story-slideshow.data";

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("StorySlideshow", () => {
  it("renders the first slide initially", () => {
    render(<StorySlideshow slides={storySlideshowImages} />);

    expect(screen.getByText("Where it all began")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to photo 1")).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByLabelText("Go to photo 2")).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("advances on next and wraps from first to last on previous", () => {
    render(<StorySlideshow slides={storySlideshowImages} />);

    fireEvent.click(screen.getByLabelText("Next photo"));
    expect(screen.getByLabelText("Go to photo 2")).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByText("Under the stars")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Previous photo"));
    expect(screen.getByLabelText("Go to photo 1")).toHaveAttribute(
      "aria-current",
      "true"
    );

    fireEvent.click(screen.getByLabelText("Previous photo"));
    expect(screen.getByLabelText("Go to photo 5")).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByText("Forever begins soon")).toBeInTheDocument();
  });

  it("jumps to a slide when its dot is clicked", () => {
    render(<StorySlideshow slides={storySlideshowImages} />);

    fireEvent.click(screen.getByLabelText("Go to photo 3"));
    expect(screen.getByLabelText("Go to photo 3")).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByText("Adventures together")).toBeInTheDocument();
  });

  it("auto-advances to the next slide after the interval", () => {
    vi.useFakeTimers();
    render(<StorySlideshow slides={storySlideshowImages} />);

    expect(screen.getByLabelText("Go to photo 1")).toHaveAttribute(
      "aria-current",
      "true"
    );

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(screen.getByLabelText("Go to photo 2")).toHaveAttribute(
      "aria-current",
      "true"
    );
  });
});
