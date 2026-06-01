import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConsoleFrame from "./ConsoleFrame";
import { setAudioMuted } from "../utils/audio";

const originalAudioCtor = (globalThis as { AudioContext?: typeof AudioContext })
  .AudioContext;

beforeEach(() => {
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

  it("does not render a [MENU] button in the header (mobile nav via HUD)", () => {
    render(
      <ConsoleFrame currentTab="home" setTab={() => {}}>
        <div>test</div>
      </ConsoleFrame>
    );

    expect(
      screen.queryByRole("button", { name: "Toggle navigation menu" })
    ).not.toBeInTheDocument();
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
});
