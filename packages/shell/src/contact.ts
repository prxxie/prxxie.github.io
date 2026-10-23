/**
 * Where the site says hello. One module, so changing an address is one edit
 * (US-SITE-006).
 */
export const CONTACT = {
  email: "hey@prxxie.dev",
  linkedin: "https://www.linkedin.com/in/prxxie",
  github: "https://github.com/prxxie",
  /** The subject a mail client opens with — the body stays empty by design. */
  emailSubject: "Hello from prxxie.dev",
} as const;

export function mailtoHref(): string {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(CONTACT.emailSubject)}`;
}
