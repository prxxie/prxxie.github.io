import React from "react";
import { describe, expect, it, afterEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PostsApp from "./PostsApp";

const fetchSpy = vi.fn();
vi.stubGlobal("fetch", fetchSpy);

afterEach(() => {
  fetchSpy.mockClear();
});

describe("PostsApp", () => {
  it("lists the posts compiled at build time, newest first", () => {
    render(<PostsApp />);

    const titles = screen.getAllByRole("button").map((button) => button.textContent ?? "");

    expect(titles[0]).toContain("Markdown Verification");
    expect(titles[1]).toContain("Hello, Retro World!");
  });

  it("opens a post and renders its markdown without fetching anything", async () => {
    render(<PostsApp />);

    fireEvent.click(screen.getByText("Hello, Retro World!"));

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Hello, Retro World!" })).toBeInTheDocument();
    });
    expect(screen.getByText("DATE: 2026-05-28")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns to the list", async () => {
    render(<PostsApp />);

    fireEvent.click(screen.getByText("Markdown Verification"));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /BACK/ })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /BACK/ }));

    expect(screen.getByText("Hello, Retro World!")).toBeInTheDocument();
  });
});
