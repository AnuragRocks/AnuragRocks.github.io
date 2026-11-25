# anuragrocks.github.io

Personal portfolio of **Anurag Sharma**, full-stack and DevOps/cloud engineer.

Live at **https://anuragrocks.github.io**

- React 19 + TypeScript, built with Vite and styled with the original hand-written CSS (plus Tailwind v4 utilities for React Bits components)
- "Ask me anything" chat landing, day/night switch, live sorting and binary-search-tree playground
- Deployed to GitHub Pages by the GitHub Actions workflow in `.github/workflows/deploy.yml` on every push to `main`

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and build to dist/
```

## Layout

- `src/components/` holds one component per page section; `ask/` is the hero chat, `lab/` the algorithm playground
- `src/styles/site.css` is the site stylesheet, loaded in its own cascade layer between Tailwind's theme and utilities
- `public/assets/` is served as-is (the résumé PDF)

## React Bits

[React Bits](https://reactbits.dev) is wired up through the shadcn registry:

- `components.json` registers `@react-bits` at `https://reactbits.dev/r/{name}.json`
- `.mcp.json` adds the shadcn MCP server, so Claude Code can search and install React Bits components when asked

Install one by hand with, for example:

```sh
npx shadcn@latest add @react-bits/SplitText-TS-TW
```

Prefer the `-TS-TW` (TypeScript + Tailwind) or `-TS-CSS` variants.
