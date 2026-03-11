import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Alert from "@/components/ui/Alert";

describe("Alert", () => {
  it("renders the message", () => {
    render(<Alert type="success" message="All good!" />);
    expect(screen.getByText("All good!")).toBeInTheDocument();
  });

  it("has role='alert'", () => {
    render(<Alert type="error" message="Something failed" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("has aria-live='polite'", () => {
    render(<Alert type="info" message="Info msg" />);
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "polite");
  });

  it("applies success styles", () => {
    render(<Alert type="success" message="ok" />);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("bg-green");
  });

  it("applies error styles", () => {
    render(<Alert type="error" message="err" />);
    expect(screen.getByRole("alert").className).toContain("bg-red");
  });

  it("applies warning styles", () => {
    render(<Alert type="warning" message="warn" />);
    expect(screen.getByRole("alert").className).toContain("bg-amber");
  });

  it("applies info styles", () => {
    render(<Alert type="info" message="info" />);
    expect(screen.getByRole("alert").className).toContain("bg-blue");
  });

  it("applies custom className", () => {
    render(<Alert type="info" message="x" className="mt-4" />);
    expect(screen.getByRole("alert").className).toContain("mt-4");
  });
});
