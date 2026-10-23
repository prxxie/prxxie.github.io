# Shipped fonts

All three families are installed from Fontsource packages and are **SIL Open Font License 1.1**. The
`@fontsource/*` packages carry the upstream licence files, and the official OFL 1.1 text is published at
<https://openfontlicense.org/open-font-license-official-text/>.

| Family | Package | Version | Weights imported | Licence |
|--------|---------|---------|------------------|---------|
| Inter | `@fontsource/inter` | 5.3.0 | 400, 500, 600, 700 | OFL-1.1 |
| Cormorant Garamond | `@fontsource/cormorant-garamond` | 5.3.0 | 400 | OFL-1.1 |
| JetBrains Mono | `@fontsource/jetbrains-mono` | 5.3.0 | 400, 500, 700 | OFL-1.1 |

Each import pulls only the `latin` subset and declares `font-display: swap`
(`packages/shell/src/fonts.ts`). No third party is contacted at runtime: the `woff2` files are hashed
into `dist/assets/` by the build.
