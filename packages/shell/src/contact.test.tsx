import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router";
import Footer from "./components/regions/Footer";
import ContactBlock from "./components/ContactBlock";
import { CONTACT, mailtoHref } from "./contact";

describe("the contact path", () => {
  it("offers an email, a LinkedIn and a GitHub link, each with a name", () => {
    render(<ContactBlock />);

    expect(screen.getByRole("link", { name: /email prxxie/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /linkedin profile .*opens in a new tab/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /github profile .*opens in a new tab/i })).toBeInTheDocument();
  });

  it("opens the mail client with a subject and no body", () => {
    expect(mailtoHref()).toBe(`mailto:${CONTACT.email}?subject=Hello%20from%20prxxie.dev`);
    expect(mailtoHref()).not.toContain("body=");
  });

  it("says where an external link goes and that it leaves the site", () => {
    render(<ContactBlock />);

    for (const link of [screen.getByRole("link", { name: /linkedin/i }), screen.getByRole("link", { name: /github/i })]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    }
  });

  it("submits nothing and loads no third party: every contact link is a plain anchor", () => {
    const { container } = render(<ContactBlock />);
    const anchors = [...container.querySelectorAll("a")];

    expect(anchors).toHaveLength(3);
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
    expect(anchors.map((anchor) => anchor.getAttribute("href"))).toEqual([
      mailtoHref(),
      CONTACT.linkedin,
      CONTACT.github,
    ]);
  });

  it("is in the footer, so every page carries it without JavaScript", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const contentinfo = screen.getByRole("contentinfo");

    expect(contentinfo.querySelector('a[href^="mailto:"]')).not.toBeNull();
  });
});
