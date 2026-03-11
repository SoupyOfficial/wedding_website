import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("@/lib/db", () => ({
  queryOne: vi.fn(),
  toBool: vi.fn((r: unknown) => r),
}));

import { queryOne } from "@/lib/db";
const mockQueryOne = vi.mocked(queryOne);

import AnnouncementBanner from "@/components/AnnouncementBanner";

beforeEach(() => vi.clearAllMocks());

describe("AnnouncementBanner", () => {
  it("returns null when no settings provided and DB returns null", async () => {
    mockQueryOne.mockResolvedValue(null);
    const Component = await AnnouncementBanner({});
    expect(Component).toBeNull();
  });

  it("returns null when bannerActive is false", async () => {
    const Component = await AnnouncementBanner({
      settings: {
        bannerActive: false,
        bannerText: "Hey!",
        bannerUrl: "",
        bannerColor: "gold",
      },
    });
    expect(Component).toBeNull();
  });

  it("returns null when bannerText is empty", async () => {
    const Component = await AnnouncementBanner({
      settings: {
        bannerActive: true,
        bannerText: "",
        bannerUrl: "",
        bannerColor: "gold",
      },
    });
    expect(Component).toBeNull();
  });

  it("renders banner text without link when no URL", async () => {
    const jsx = await AnnouncementBanner({
      settings: {
        bannerActive: true,
        bannerText: "Welcome to our wedding!",
        bannerUrl: "",
        bannerColor: "gold",
      },
    });
    render(<>{jsx}</>);
    expect(screen.getByText("Welcome to our wedding!")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders banner with link when URL is provided", async () => {
    const jsx = await AnnouncementBanner({
      settings: {
        bannerActive: true,
        bannerText: "Click here",
        bannerUrl: "https://example.com",
        bannerColor: "forest",
      },
    });
    render(<>{jsx}</>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("Click here")).toBeInTheDocument();
  });

  it("applies forest color class", async () => {
    const jsx = await AnnouncementBanner({
      settings: {
        bannerActive: true,
        bannerText: "Forest banner",
        bannerUrl: "",
        bannerColor: "forest",
      },
    });
    const { container } = render(<>{jsx}</>);
    expect(container.firstElementChild?.className).toContain("bg-forest");
  });

  it("applies gold color class by default", async () => {
    const jsx = await AnnouncementBanner({
      settings: {
        bannerActive: true,
        bannerText: "Gold banner",
        bannerUrl: "",
        bannerColor: "gold",
      },
    });
    const { container } = render(<>{jsx}</>);
    expect(container.firstElementChild?.className).toContain("bg-gold");
  });

  it("fetches from DB when no settings prop provided", async () => {
    mockQueryOne.mockResolvedValue({
      id: "singleton",
      bannerActive: true,
      bannerText: "DB banner",
      bannerUrl: "",
      bannerColor: "gold",
    } as never);
    const jsx = await AnnouncementBanner({});
    render(<>{jsx}</>);
    expect(screen.getByText("DB banner")).toBeInTheDocument();
    expect(mockQueryOne).toHaveBeenCalled();
  });
});
