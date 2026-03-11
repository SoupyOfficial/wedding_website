import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmButton from "@/components/ui/ConfirmButton";

describe("ConfirmButton", () => {
  it("renders children", () => {
    render(
      <ConfirmButton onConfirm={vi.fn()}>Delete</ConfirmButton>
    );
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls onConfirm when user confirms", () => {
    const onConfirm = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(
      <ConfirmButton onConfirm={onConfirm}>Delete</ConfirmButton>
    );
    fireEvent.click(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("does not call onConfirm when user cancels", () => {
    const onConfirm = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <ConfirmButton onConfirm={onConfirm}>Delete</ConfirmButton>
    );
    fireEvent.click(screen.getByText("Delete"));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("uses custom confirm message", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(
      <ConfirmButton onConfirm={vi.fn()} message="Really delete?">
        Delete
      </ConfirmButton>
    );
    fireEvent.click(screen.getByText("Delete"));
    expect(confirmSpy).toHaveBeenCalledWith("Really delete?");
  });

  it("applies custom className", () => {
    render(
      <ConfirmButton onConfirm={vi.fn()} className="btn-red">
        Go
      </ConfirmButton>
    );
    expect(screen.getByText("Go").className).toContain("btn-red");
  });
});
