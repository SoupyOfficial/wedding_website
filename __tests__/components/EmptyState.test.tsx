import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders the title", () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<EmptyState title="Empty" icon="📭" />);
    expect(screen.getByText("📭")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<EmptyState title="Empty" subtitle="Try again later" />);
    expect(screen.getByText("Try again later")).toBeInTheDocument();
  });

  it("does not render icon when not provided", () => {
    const { container } = render(<EmptyState title="Empty" />);
    // No icon div should exist (icon div has text-4xl class)
    const iconDiv = container.querySelector(".text-4xl");
    expect(iconDiv).toBeNull();
  });

  it("does not render subtitle when not provided", () => {
    const { container } = render(<EmptyState title="Empty" />);
    const pTags = container.querySelectorAll("p");
    expect(pTags.length).toBe(1);
  });
});
