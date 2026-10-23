import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RouterProvider, createMemoryRouter } from "react-router";
import { createAppRoutes } from "../routes";
import { ProgressServiceProvider } from "../hooks/useProgressService";
import facts from "../generated/build-facts.json";

function renderHome() {
  const router = createMemoryRouter(createAppRoutes(), { initialEntries: ["/"] });
  const { container } = render(
    <ProgressServiceProvider>
      <RouterProvider router={router} />
    </ProgressServiceProvider>,
  );

  return container.querySelector("main") ?? container;
}

describe("the proof page", () => {
  it("carries the headline, the positioning paragraph and a heading per section", () => {
    const main = renderHome();

    expect(main.querySelector("h1")?.textContent).toContain("small, finished things");
    expect(main.textContent).toContain("Module Federation");
    expect([...main.querySelectorAll("h2")].map((heading) => heading.textContent)).toEqual([
      "What I build",
      "Try one",
      "The proof",
      "Say hello",
    ]);
  });

  it("reads in one order: headline, what I build, puzzle, proof, contact", () => {
    const main = renderHome();
    const order = [...main.querySelectorAll("h1, h2")].map((heading) => heading.tagName + heading.textContent);

    expect(order.slice(0, 5)).toEqual(["H1I build small, finished things.", "H2What I build", "H2Try one", "H2The proof", "H2Say hello"]);
  });

  it("has exactly one h1 and no skipped heading level", () => {
    const main = renderHome();
    const levels = [...main.querySelectorAll("h1, h2, h3, h4")].map((heading) => Number(heading.tagName.slice(1)));

    expect(main.querySelectorAll("h1")).toHaveLength(1);
    expect(Math.max(...levels)).toBeLessThanOrEqual(3);
  });

  it("prints every figure from the build facts, and the gates as words", () => {
    const main = renderHome();

    for (const value of [facts.tests, facts.files, facts.remotes]) {
      expect(main.textContent).toContain(String(value));
    }

    for (const gate of facts.gates) {
      expect(main.textContent).toContain(`${gate.name}: ${gate.passing ? "passing" : "failing"}`);
    }
  });

  it("names a figure with no source instead of printing a stale number", () => {
    const main = renderHome();

    if (facts.levels === null) {
      expect(main.textContent).toContain("not measured yet");
    } else {
      expect(main.textContent).toContain(String(facts.levels));
    }
  });

  it("ends on a contact path with real links and no form", () => {
    const main = renderHome();

    expect(main.querySelector('a[href^="mailto:"]')).not.toBeNull();
    expect(main.querySelector("form")).toBeNull();
  });
});
