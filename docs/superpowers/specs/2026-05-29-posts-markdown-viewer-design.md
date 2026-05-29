# Spec: Rich Markdown Viewer for Posts MFE

## 1. Overview and Goals
This specification details the design for rendering rich Markdown posts within the `posts` microfrontend (MFE). The viewer will parse GitHub Flavored Markdown (GFM) and apply retro styling configured to look like a cozy notebook paper sheet (Option B).

### Core Features:
- Complete GFM parsing (headings, bold, italics, tables, blockquotes, and lists).
- GFM task lists support (interactive or visual checkbox rendering).
- Code syntax highlighting for multiple languages inside code blocks.
- Notebook paper aesthetic (cream background, vertical pink margin line, pixel border).

---

## 2. Architecture & Dependencies

### Dependencies
We will add these libraries to `packages/posts/package.json`:
- `marked` (v12.x) - Extremely fast, extensible markdown parser.
- `prismjs` (v1.29.0) - Lightweight syntax highlighter.

### Custom Component Flow
1. **Fetch**: `PostsApp` fetches the raw `.md` file using React Query.
2. **Metadata extraction**: A custom frontmatter parser extracts the post's YAML metadata (title, date, author, category).
3. **Markdown Parsing**: `marked.parse` compiles the raw Markdown body into an HTML string.
4. **Syntax Highlighting**: We hook into the `marked` parse process, intercepting code blocks and passing them to `prismjs.highlight` to inject token spans.
5. **Renderer**: The component outputs the compiled HTML inside a React component wrapper using `dangerouslySetInnerHTML`.

---

## 3. Styling & Layout: Cozy Notebook Theme

The rendered post viewer uses Tailwind CSS to style the notebook layout.

### CSS Theme Configuration (Option B)
- **Container**:
  - Background color: `#fdfbf7` (warm cream paper).
  - Borders: `border-2 border-[#8c8273]` (solid earthy brown retro book border).
  - Left Margin Line: `border-l-2 border-l-red-300` (or `border-l-2 border-l-rose-300` padding-left to simulate notebook margins).
- **Element Styles (`.markdown-body`)**:
  - **Headers**: Styled in `#5c3c24` (dark brown), monospaced.
  - **Inline Code**: Soft warm cream background with rounded corners (`bg-amber-50 px-1 py-0.5 rounded text-red-700`).
  - **Code Blocks**:
    - Background: `#eae3d5` (soft tan/gray).
    - Border: `1px solid #c2b59b`.
    - Prism classes: Style `.token.keyword`, `.token.string`, `.token.comment`, etc. in soft readable colors matching the palette.
  - **Tables**: Solid borders, light warm headers (`bg-[#eae3d5]`), padding.
  - **Blockquotes**: Thick left border (`border-l-4 border-[#c2b59b]`), padding, italics.
  - **Lists & Tasks**: Custom bullets, task list checkboxes styled using tailwind accent colors.

---

## 4. Test & Verification Plan

### Test MD Post
Create `public/posts/markdown-test.md` containing:
- Headings (H1 to H4)
- Text formatting (bold, italic, strikethrough, inline code)
- A blockquote
- A list (ordered, unordered, and a task list)
- A table
- Code blocks (JS, bash, CSS)

### Unit Tests
Verify `parsePost` in `packages/posts/src/PostsApp.test.jsx` or similar test file:
- Correctly parses title, date, author.
- Gracefully handles missing frontmatter.

### Integration
- Rebuild via `npm run build:static` to ensure clean bundling with Vite Module Federation.
- Open locally to verify the visual style.
