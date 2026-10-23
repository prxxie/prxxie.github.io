export interface PrerenderedPage {
  path: string;
  title: string;
  html: string;
}

export const SITE_ORIGIN: string;

export function canonicalUrl(route: string): string;
export function outputFiles(route: string): string[];
export function assertReadable(route: string, page: PrerenderedPage): void;
export function inject(template: string, page: PrerenderedPage): string;
