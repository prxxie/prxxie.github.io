import React from "react";
import { CONTACT, mailtoHref } from "../contact";

/**
 * The contact path with no backend (US-SITE-006): three links, each with a name
 * a screen reader announces, no form, no third-party script.
 */
export default function ContactBlock(): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-body">
        <li>
          <a className="text-primary-active underline underline-offset-4" href={mailtoHref()}>
            Email prxxie ({CONTACT.email})
          </a>
        </li>
        <li>
          <a
            className="text-primary-active underline underline-offset-4"
            href={CONTACT.linkedin}
            rel="me noopener noreferrer"
            target="_blank"
          >
            LinkedIn profile (opens in a new tab)
          </a>
        </li>
        <li>
          <a
            className="text-primary-active underline underline-offset-4"
            href={CONTACT.github}
            rel="me noopener noreferrer"
            target="_blank"
          >
            GitHub profile (opens in a new tab)
          </a>
        </li>
      </ul>
    </div>
  );
}
