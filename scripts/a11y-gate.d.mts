/** Types for the accessibility gate, so the test suite can import its pure parts. */
export interface ContrastPair {
  foreground: string;
  background: string;
  minimum: number;
  note: string;
}

export interface ContrastMeasurement {
  pair: string;
  ratio: number;
  minimum: number;
  note: string;
}

export interface ContrastFinding {
  pair: string;
  reason: string;
  note?: string;
}

export interface AxeResults {
  violations: {
    id: string;
    impact?: string | null;
    help: string;
    nodes: { target: string[] }[];
  }[];
}

export interface SeriousViolation {
  id: string;
  impact: string | null;
  help: string;
  nodes: string[];
}

export const CONTRAST_PAIRS: ContrastPair[];
export function luminance(hex: string): number;
export function contrastRatio(foreground: string, background: string): number;
export function readTokens(css: string): Map<string, string>;
export function checkContrast(tokens: Map<string, string>): {
  measured: ContrastMeasurement[];
  findings: ContrastFinding[];
};
export function seriousViolations(results: AxeResults): SeriousViolation[];
