export default function handler(): Response {
  return Response.json({
    ok: true,
    app: 'VibeAtlas',
    hasGithubToken: Boolean(process.env.GITHUB_TOKEN?.trim()),
  });
}
