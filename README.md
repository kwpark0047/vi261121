<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a9cb00bc-75a9-456f-a589-7839985cdc67

## Run Locally

**Prerequisites:** Node.js, Bun (the repo ships `bun.lock`; `npm` also works)

1. Install dependencies:
   `bun install` (or `npm install`)
2. Run the app:
   `bun run dev` (or `npm run dev`)

Notes:

- `GEMINI_API_KEY` appears only in `.env.example` and app metadata as a
  platform-side declaration; no in-repo code path reads it, and the
  `@google/genai` npm package was removed as unused. Only relevant if/when
  server-side Gemini features are actually wired in.
- Quality gates: `bun run lint` (TypeScript check) and `bun test` (rule/unit tests).

- Self-hosting / free deployment (Vercel Hobby + Firebase Spark): see `DEPLOYMENT.md`.
