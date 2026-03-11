import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("@/lib/db", () => ({
  queryOne: vi.fn(),
  toBool: vi.fn((r: unknown) => r),
}));

import { queryOne } from "@/lib/db";
const mockQueryOne = vi.mocked(queryOne);

import Footer from "@/components/Footer";

beforeEach(() => vi.clearAllMocks());

describe("Footer", () => {
  it("renders with default settings when DB returns null", async () => {
    mockQueryOne.mockResolvedValue(null);
    const jsx = await Footer();
    render(<>{jsx}</>);
    expect(screen.getAllByText(/Jacob & Ashley/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Made with/)).toBeInTheDocument();
  });

  it("renders with custom settings from DB", async () => {
    mockQueryOne.mockResolvedValue({
      id: "singleton",
      coupleName: "Alex & Jordan",
      weddingHashtag: "#AlexAndJordan",
      venueName: "Garden Estate",
      venueAddress: "Miami, FL",
      photoShareLink: "https://photos.example.com",
      socialInstagram: "https://instagram.com/test",
      socialFacebook: "https://facebook.com/test",
      socialTikTok: "https://tiktok.com/@test",
    } as never);
    const jsx = await Footer();
    render(<>{jsx}</>);
    expect(screen.getByText("Alex & Jordan")).toBeInTheDocument();
    expect(screen.getByText("#AlexAndJordan")).toBeInTheDocument();
    expect(screen.getByText(/Garden Estate/)).toBeInTheDocument();
    expect(screen.getByText("Share Your Photos")).toBeInTheDocument();
    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
    expect(screen.getByLabelText("TikTok")).toBeInTheDocument();
  });

  it("renders quick links", async () => {
    mockQueryOne.mockResolvedValue(null);
    const jsx = await Footer();
    render(<>{jsx}</>);
    expect(screen.getByText("RSVP")).toBeInTheDocument();
    expect(screen.getByText("Event Details")).toBeInTheDocument();
    expect(screen.getByText("Registry")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("hides social links when not configured", async () => {
    mockQueryOne.mockResolvedValue({
      id: "singleton",
      coupleName: "Alex & Jordan",
    } as never);
    const jsx = await Footer();
    render(<>{jsx}</>);
    expect(screen.queryByLabelText("Instagram")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Facebook")).not.toBeInTheDocument();
    expect(screen.queryByText("Share Your Photos")).not.toBeInTheDocument();
  });
});
