import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import StorySlideshow from "@/app/(public)/our-story/StorySlideshow";
import {
  storySlideshowImages,
  type StorySlide,
} from "@/app/(public)/our-story/story-slideshow.data";

const slides: StorySlide[] = [
  { src: "/slide-1.jpg", alt: "Slide one", caption: "Where it all began", position: "50% 40%" },
  { src: "/slide-2.jpg", alt: "Slide two", caption: "Under the stars" },
  { src: "/slide-3.jpg", alt: "Slide three", caption: "Adventures together" },
  { src: "/slide-4.jpg", alt: "Slide four", caption: "The proposal" },
  { src: "/slide-5.jpg", alt: "Slide five", caption: "Forever begins soon" },
];

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
    render(<StorySlideshow slides={slides} />);

    expect(screen.getByText("Where it all began")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to photo 1")).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByLabelText("Go to photo 2")).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("applies the active slide's object-position to the image", () => {
    const { container } = render(<StorySlideshow slides={slides} />);

    const img = container.querySelector("img");
    expect(img).toHaveStyle({ objectPosition: "50% 40%" });
  });

  it("advances on next and wraps from first to last on previous", () => {
    render(<StorySlideshow slides={slides} />);

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
    render(<StorySlideshow slides={slides} />);

    fireEvent.click(screen.getByLabelText("Go to photo 3"));
    expect(screen.getByLabelText("Go to photo 3")).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByText("Adventures together")).toBeInTheDocument();
  });

  it("auto-advances to the next slide after the interval", () => {
    vi.useFakeTimers();
    render(<StorySlideshow slides={slides} />);

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

describe("storySlideshowImages", () => {
  it("has 18 slides with empty captions, ordered src paths, and focal positions", () => {
    expect(storySlideshowImages).toHaveLength(18);
    storySlideshowImages.forEach((slide, i) => {
      expect(slide.src).toBe(`/images/story-slideshow/slide-${String(i + 1).padStart(2, "0")}.jpg`);
      expect(slide.caption).toBe("");
      expect(slide.position).toBeDefined();
    });
  });
});
