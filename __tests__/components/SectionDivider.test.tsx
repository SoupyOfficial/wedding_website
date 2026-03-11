import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionDivider from "@/components/SectionDivider";

describe("SectionDivider", () => {
  it("renders with aria-hidden", () => {
    const { container } = render(<SectionDivider />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
  });

  it("renders an SVG icon", () => {
    const { container } = render(<SectionDivider />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
