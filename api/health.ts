export default function handler(): Response {
  return Response.json({
    ok: true,
    app: 'W-Vibe',
    hasGithubToken: Boolean(process.env.GITHUB_TOKEN?.trim()),
  });
}
