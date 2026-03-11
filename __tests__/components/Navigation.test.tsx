import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
}));

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

const mockUsePathname = vi.mocked(usePathname);

describe("Navigation", () => {
  it("renders home link", () => {
    render(<Navigation />);
    expect(screen.getByText("J & A")).toBeInTheDocument();
  });

  it("renders nav links", () => {
    render(<Navigation />);
    expect(screen.getAllByText("Our Story").length).toBeGreaterThan(0);
    expect(screen.getAllByText("RSVP").length).toBeGreaterThan(0);
  });

  it("filters out links when feature flag is disabled", () => {
    render(
      <Navigation featureFlags={{ ourStoryPageEnabled: false, galleryPageEnabled: false }} />
    );
    expect(screen.queryByText("Our Story")).not.toBeInTheDocument();
    expect(screen.queryByText("Gallery")).not.toBeInTheDocument();
    // Other links should still appear
    expect(screen.getAllByText("RSVP").length).toBeGreaterThan(0);
  });

  it("shows all links when all feature flags are true", () => {
    render(
      <Navigation
        featureFlags={{
          ourStoryPageEnabled: true,
          galleryPageEnabled: true,
          rsvpEnabled: true,
          contactPageEnabled: true,
        }}
      />
    );
    expect(screen.getAllByText("Our Story").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gallery").length).toBeGreaterThan(0);
  });

  it("sets aria-current on active link", () => {
    mockUsePathname.mockReturnValue("/our-story");
    render(<Navigation />);
    const activeLinks = screen.getAllByText("Our Story");
    // At least one should have aria-current="page"
    const withAria = activeLinks.filter(
      (el) => el.getAttribute("aria-current") === "page"
    );
    expect(withAria.length).toBeGreaterThan(0);
  });

  it("opens mobile menu when button is clicked", () => {
    render(<Navigation />);
    const button = screen.getByLabelText("Open menu");
    fireEvent.click(button);
    // After click, aria-label should change
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
  });
});
