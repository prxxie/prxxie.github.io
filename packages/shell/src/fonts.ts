/**
 * The three shipped families, self-hosted from Fontsource so the artifact never
 * asks a third-party origin for a font (ADR-0001, NFR-21). Only the weights the
 * design system uses are imported; every extra weight is a real download.
 *
 * Licences: all three are SIL Open Font License 1.1 — see
 * `packages/shell/src/fonts/LICENSE-NOTES.md`.
 */
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-700.css";
