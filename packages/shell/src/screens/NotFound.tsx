import React from "react";
import { Link } from "react-router";

export default function NotFound(): React.ReactElement {
  return (
    <section className="flex flex-col gap-4 py-8">
      <p className="font-code text-[12px] text-muted">404 · Page not found</p>
      <h1 className="font-display text-[36px] leading-tight text-ink">This page does not exist</h1>
      <p className="text-body max-w-prose">
        The address was mistyped, or the page moved. Everything the site keeps lives behind one of the three doors below.
      </p>
      <ul className="flex flex-wrap gap-3">
        {[
          { to: "/", label: "Home" },
          { to: "/games", label: "Games" },
          { to: "/devlog", label: "Devlog" },
        ].map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="btn inline-block no-underline text-ink hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
