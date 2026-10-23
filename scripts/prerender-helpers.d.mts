export interface PrerenderedPage {
  path: string;
  title: string;
  html: string;
}

export function outputFile(route: string): string;
export function assertReadable(route: string, page: PrerenderedPage): void;
export function inject(template: string, page: PrerenderedPage): string;
