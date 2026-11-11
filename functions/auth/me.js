
import { parseCookies, verify } from "./_utils.js";

export async function onRequestGet({ request, env }) {
  const cookies = parseCookies(request);
  const session = cookies[env.SESSION_COOKIE || "er_session"];

  const user = session
    ? await verify(session, env.SESSION_SECRET)
    : null;

  const adminId = "873889503952121906";

  return Response.json(
    {
      authenticated: !!user,
      user: user
        ? {
            id: user.id,
            username: user.username,
            isAdmin: String(user.id) === adminId
          }
        : null
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
