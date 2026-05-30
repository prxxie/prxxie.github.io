import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConsoleFrame from "./ConsoleFrame";
import { useUiStore } from "../store/uiStore";

describe("ConsoleFrame Responsive Menu", () => {
  beforeEach(() => {
    useUiStore.setState({ isMenuOpen: false });
  });

  it("renders standard horizontal buttons and hides mobile menu button by default", () => {
    render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    expect(screen.getByText("HOME")).toBeInTheDocument();

    const menuBtn = screen.getByRole("button", {
      name: "Toggle navigation menu",
    });
    expect(menuBtn).toBeInTheDocument();
    expect(menuBtn).toHaveClass("md:hidden");
  });

  it("opens offcanvas menu drawer when clicking [MENU]", () => {
    render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    const menuBtn = screen.getByRole("button", {
      name: "Toggle navigation menu",
    });
    fireEvent.click(menuBtn);

    expect(useUiStore.getState().isMenuOpen).toBe(true);

    expect(screen.getByText((content, el) => el?.tagName === "SPAN" && content.includes("MENU"))).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", {
      name: "Close navigation menu",
    });
    fireEvent.click(closeBtn);
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it("closes the drawer when pressing the Escape key", () => {
    useUiStore.setState({ isMenuOpen: true });
    render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    expect(screen.getByText((content, el) => el?.tagName === "SPAN" && content.includes("MENU"))).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it("closes the drawer when clicking the backdrop overlay", () => {
    useUiStore.setState({ isMenuOpen: true });
    const { container } = render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    const backdrop = container.querySelector(".bg-black\\/45");
    expect(backdrop).toBeInTheDocument();

    fireEvent.click(backdrop!);

    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it("toggles overflow-hidden class on document body and removes it on unmount", () => {
    const { unmount } = render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    expect(document.body).not.toHaveClass("overflow-hidden");

    act(() => {
      useUiStore.setState({ isMenuOpen: true });
    });
    expect(document.body).toHaveClass("overflow-hidden");

    act(() => {
      useUiStore.setState({ isMenuOpen: false });
    });
    expect(document.body).not.toHaveClass("overflow-hidden");

    act(() => {
      useUiStore.setState({ isMenuOpen: true });
    });
    expect(document.body).toHaveClass("overflow-hidden");

    act(() => {
      unmount();
    });
    expect(document.body).not.toHaveClass("overflow-hidden");
  });

  it("updates tab and closes drawer when a mobile navigation item is clicked", () => {
    const setTabSpy = vi.fn();
    useUiStore.setState({ isMenuOpen: true });

    render(
      <ConsoleFrame currentTab="home" setTab={setTabSpy}>
        <div>test</div>
      </ConsoleFrame>
    );

    const aboutBtn = screen.getByRole("button", { name: "[ ] ABOUT" });
    expect(aboutBtn).toBeInTheDocument();

    fireEvent.click(aboutBtn);

    expect(setTabSpy).toHaveBeenCalledWith("about");

    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });
});
