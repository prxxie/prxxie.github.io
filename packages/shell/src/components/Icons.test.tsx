import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { PixelPawIcon } from "./Icons";

describe("PixelPawIcon", () => {
  it("renders a heart-shaped main pad containing a bottom-center tip rect at x=7, y=12", () => {
    const { container } = render(<PixelPawIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    // Check for the bottom-center tip of the heart main pad: rect with x="7" and y="12"
    const heartTip = container.querySelector('rect[x="7"][y="12"]');
    expect(heartTip).toBeInTheDocument();
  });
});
