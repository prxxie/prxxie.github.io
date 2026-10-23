export interface PrerenderedPage {
  path: string;
  title: string;
  description: string;
  html: string;
}

export const SITE_ORIGIN: string;

export function canonicalUrl(route: string): string;
export function outputFiles(route: string): string[];
export function assertReadable(route: string, page: PrerenderedPage): void;
export function inject(template: string, page: PrerenderedPage): string;
export function metadata(page: PrerenderedPage): string;
export function sitemap(routes: string[]): string;
export function robotsTxt(): string;
export const SHARE_IMAGE: { path: string; alt: string; width: string; height: string };
