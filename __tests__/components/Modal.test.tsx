import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "@/components/ui/Modal";

describe("Modal", () => {
  it("renders title and children", () => {
    render(
      <Modal title="Confirm Action" onClose={vi.fn()}>
        <p>Are you sure?</p>
      </Modal>
    );
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    fireEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("applies custom maxWidth", () => {
    const { container } = render(
      <Modal title="Wide" onClose={vi.fn()} maxWidth="max-w-lg">
        <p>Body</p>
      </Modal>
    );
    const inner = container.querySelector(".max-w-lg");
    expect(inner).toBeInTheDocument();
  });
});
