<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# W-Vibe

Global discovery and verification platform for vibe-coded apps, AI tools, MCP servers, AI skills, agents, templates, and open-source projects.

View your app in AI Studio: https://ai.studio/apps/a9cb00bc-75a9-456f-a589-7839985cdc67

## Run Locally

**Prerequisites:** Node.js, Bun (the repo ships `bun.lock`; `npm` also works)

1. Install dependencies:
   `bun install` (or `npm install`)
2. Run the app:
   `bun run dev` (or `npm run dev`)

Notes:

- `GEMINI_API_KEY` is read by the server-side description translation proxy
  `api/github/translate-descriptions.ts` (called with a Gemini REST
  `x-goog-api-key` header; unset → 401 `MISSING_API_KEY`). It is declared in
  `.env.example` and, per `DEPLOYMENT.md`, is configured as a platform
  environment variable/secret for serverless deploys — not inlined into the
  client bundle.
- Quality gates: `bun run lint` (TypeScript check), `bun test` (unit + rules
  source-pattern tests; the rules *emulator* suite is opt-in via
  `RULES_EMULATOR_TESTS=1` + a local emulator — see `DEPLOYMENT.md`),
  `bun run build`.

- Self-hosting / free deployment (Vercel Hobby + Firebase Spark): see `DEPLOYMENT.md`.
