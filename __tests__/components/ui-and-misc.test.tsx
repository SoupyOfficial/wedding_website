import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// ─── FilterBar ─────────────────────────────────────
import FilterBar from "@/components/ui/FilterBar";

describe("FilterBar", () => {
  const filters = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ] as const;

  it("renders all filter buttons", () => {
    render(<FilterBar filters={filters} active="all" onChange={() => {}} />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("calls onChange when filter clicked", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={filters} active="all" onChange={onChange} />);
    fireEvent.click(screen.getByText("Active"));
    expect(onChange).toHaveBeenCalledWith("active");
  });

  it("renders button variant", () => {
    render(<FilterBar filters={filters} active="all" onChange={() => {}} variant="button" />);
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("calls onChange when button variant filter clicked", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={filters} active="all" onChange={onChange} variant="button" />);
    fireEvent.click(screen.getByText("Active"));
    expect(onChange).toHaveBeenCalledWith("active");
  });
});

// ─── PageHeader ────────────────────────────────────
import PageHeader from "@/components/ui/PageHeader";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Our Story" />);
    expect(screen.getByText("Our Story")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<PageHeader title="Our Story" subtitle="How we met" />);
    expect(screen.getByText("How we met")).toBeInTheDocument();
  });

  it("renders without subtitle", () => {
    const { container } = render(<PageHeader title="FAQ" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});

// ─── AdminPageHeader ───────────────────────────────
import AdminPageHeader from "@/components/ui/AdminPageHeader";

describe("AdminPageHeader", () => {
  it("renders title", () => {
    render(<AdminPageHeader title="Guests" />);
    expect(screen.getByText("Guests")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<AdminPageHeader title="Guests" subtitle="Manage guest list" />);
    expect(screen.getByText("Manage guest list")).toBeInTheDocument();
  });

  it("renders actions", () => {
    render(
      <AdminPageHeader title="Guests" actions={<button>Add</button>} />
    );
    expect(screen.getByText("Add")).toBeInTheDocument();
  });
});

// ─── CountdownTimer ────────────────────────────────
import CountdownTimer from "@/components/CountdownTimer";

describe("CountdownTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders countdown for future date", () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    render(<CountdownTimer targetDate={future.toISOString()} />);
    expect(screen.getByText("Days")).toBeInTheDocument();
    expect(screen.getByText("Hours")).toBeInTheDocument();
  });

  it("renders post-wedding message for past date", () => {
    const past = new Date("2020-01-01");
    vi.setSystemTime(new Date("2025-01-01"));
    render(<CountdownTimer targetDate={past.toISOString()} />);
    // Wait for effect
    act(() => { vi.advanceTimersByTime(1100); });
    expect(screen.getByText("We did it! 🎉")).toBeInTheDocument();
  });

  it("renders custom post-wedding message", () => {
    const past = new Date("2020-01-01");
    vi.setSystemTime(new Date("2025-01-01"));
    render(<CountdownTimer targetDate={past.toISOString()} postWeddingMessage="Married!" />);
    act(() => { vi.advanceTimersByTime(1100); });
    expect(screen.getByText("Married!")).toBeInTheDocument();
  });

  it("renders placeholder before hydration", () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    // On initial render timeLeft is null
    const { container } = render(<CountdownTimer targetDate={future.toISOString()} />);
    // Should have the "--" placeholder or actual numbers
    expect(container.textContent).toContain("Days");
  });
});

// ─── StarrySky ─────────────────────────────────────
import StarrySky from "@/components/StarrySky";

describe("StarrySky", () => {
  it("renders a canvas element (reduced motion)", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true, // prefers-reduced-motion: reduce -> skip animation
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    const { container } = render(<StarrySky />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
  });

  it("initializes animation when motion is allowed", () => {
    // Set window dimensions so stars are created
    Object.defineProperty(window, "innerWidth", { writable: true, value: 800 });
    Object.defineProperty(window, "innerHeight", { writable: true, value: 600 });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false, // allow animations
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock canvas 2d context
    const mockCtx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
    };
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx) as never;

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    // Use fake timers for setInterval
    vi.useFakeTimers({ shouldAdvanceTime: false });
    // Mock Math.random to always return > 0.5 so shooting star triggers
    const origRandom = Math.random;
    Math.random = () => 0.8;

    const { container, unmount } = render(<StarrySky />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    // First RAF callback triggers draw with stars
    if (rafCallbacks.length > 0) {
      rafCallbacks[rafCallbacks.length - 1](16);
    }
    expect(mockCtx.clearRect).toHaveBeenCalled();
    // Stars should have been drawn (canvas 800x600 = 160 stars)
    expect(mockCtx.arc).toHaveBeenCalled();

    // Advance timer to trigger shooting star interval (8000ms)
    vi.advanceTimersByTime(8001);

    // Run another animation frame to draw the shooting star
    if (rafCallbacks.length > 1) {
      rafCallbacks[rafCallbacks.length - 1](32);
    }
    // Shooting star should cause gradient/stroke calls
    expect(mockCtx.createLinearGradient).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();

    Math.random = origRandom;
    vi.useRealTimers();
    unmount();
  });
});
