<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 1DNT project conventions

- Use Node 24 for local development and CI. Run `npm run check` for ESLint, TypeScript, and formatting, and `npm run build` to verify the production build.
- Keep catalogue rules, prices, discounts, and availability in `src/domain/commerce`. Reuse them in the storefront and in server code.
- Keep payment, delivery, and storage adapters on the server. The storefront calls server operations through HTTP routes.
- After changing a storefront interaction, verify the affected flow on a narrow viewport and check keyboard navigation.
