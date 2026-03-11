import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageDisabled from "@/components/PageDisabled";

describe("PageDisabled", () => {
  it("renders the 'Page Not Available' heading", () => {
    render(<PageDisabled />);
    expect(screen.getByText("Page Not Available")).toBeInTheDocument();
  });

  it("renders a description message", () => {
    render(<PageDisabled />);
    expect(
      screen.getByText(/currently not available/i)
    ).toBeInTheDocument();
  });

  it("renders a link back to home", () => {
    render(<PageDisabled />);
    const link = screen.getByText("Back to Home");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/");
  });
});
