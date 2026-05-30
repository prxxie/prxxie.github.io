import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConsoleFrame from "./ConsoleFrame";
import { useUiStore } from "../store/uiStore";
import { setAudioMuted } from "../utils/audio";

const originalAudioCtor = (globalThis as { AudioContext?: typeof AudioContext })
  .AudioContext;

beforeEach(() => {
  useUiStore.setState({ isMenuOpen: false });
  localStorage.clear();
  setAudioMuted(true);
  (globalThis as { AudioContext?: typeof AudioContext }).AudioContext = vi
    .fn()
    .mockImplementation(() => ({
      state: "running",
      currentTime: 0,
      destination: {},
      resume: vi.fn(),
      createOscillator: vi.fn(() => ({
        type: "",
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createGain: vi.fn(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
    }));
});

afterEach(() => {
  setAudioMuted(true);
  localStorage.clear();
});

afterAll(() => {
  if (originalAudioCtor) {
    (globalThis as { AudioContext?: typeof AudioContext }).AudioContext =
      originalAudioCtor;
  } else {
    delete (globalThis as { AudioContext?: typeof AudioContext }).AudioContext;
  }
});

describe("ConsoleFrame", () => {
  it("does not render top horizontal nav buttons (matrix moved to side panels)", () => {
    render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    expect(screen.queryByRole("button", { name: "HOME" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ABOUT" })).not.toBeInTheDocument();
  });

  it("renders the audio toggle button defaulting to OFF", () => {
    render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    const audioBtn = screen.getByRole("button", { name: "Toggle Audio Beeps" });
    expect(audioBtn).toBeInTheDocument();
    expect(audioBtn).toHaveTextContent("SOUND: OFF");
  });

  it("toggles audio state when clicking the SOUND button", () => {
    render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    const audioBtn = screen.getByRole("button", { name: "Toggle Audio Beeps" });
    fireEvent.click(audioBtn);
    expect(audioBtn).toHaveTextContent("SOUND: ON");

    fireEvent.click(audioBtn);
    expect(audioBtn).toHaveTextContent("SOUND: OFF");
  });

  it("opens the offcanvas drawer when clicking [MENU]", () => {
    render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    const menuBtn = screen.getByRole("button", { name: "Toggle navigation menu" });
    fireEvent.click(menuBtn);
    expect(useUiStore.getState().isMenuOpen).toBe(true);

    expect(screen.getByText("MOBILE_CTRL")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Close navigation menu" });
    fireEvent.click(closeBtn);
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it("closes the drawer when pressing Escape", () => {
    useUiStore.setState({ isMenuOpen: true });
    render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    expect(screen.getByText("MOBILE_CTRL")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it("closes the drawer when clicking the backdrop", () => {
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

  it("manages overflow-hidden on body across menu state changes", () => {
    const { unmount } = render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    expect(document.body).not.toHaveClass("overflow-hidden");
    act(() => useUiStore.setState({ isMenuOpen: true }));
    expect(document.body).toHaveClass("overflow-hidden");
    act(() => useUiStore.setState({ isMenuOpen: false }));
    expect(document.body).not.toHaveClass("overflow-hidden");
    act(() => useUiStore.setState({ isMenuOpen: true }));
    expect(document.body).toHaveClass("overflow-hidden");
    act(() => unmount());
    expect(document.body).not.toHaveClass("overflow-hidden");
  });

  it("calls setTab and closes drawer when matrix item in drawer is clicked", () => {
    const setTabSpy = vi.fn();
    useUiStore.setState({ isMenuOpen: true });

    render(
      <ConsoleFrame currentTab="home" setTab={setTabSpy}>
        <div>test</div>
      </ConsoleFrame>
    );

    const aboutBtn = screen.getByRole("button", { name: /\[AB\]\s+about/i });
    fireEvent.click(aboutBtn);

    expect(setTabSpy).toHaveBeenCalledWith("about");
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });
});
