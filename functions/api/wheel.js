
const JOUR = 24 * 60 * 60 * 1000;

async function joueurConnecte(request) {
  const url = new URL("/auth/me", request.url);

  const reponse = await fetch(url, {
    headers: {
      Cookie: request.headers.get("Cookie") || ""
    },
    redirect: "manual"
  });

  if (!reponse.ok) return null;

  const data = await reponse.json();

  if (!data.authenticated || !data.user?.id) {
    return null;
  }

  return String(data.user.id);
}

export async function onRequest({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json(
        { error: "Base de données indisponible" },
        { status: 503 }
      );
    }

    const playerId = await joueurConnecte(request);

    if (!playerId) {
      return Response.json(
        { error: "Connexion Discord requise" },
        { status: 401 }
      );
    }

    if (request.method === "GET") {
      const joueur = await env.DB.prepare(
        "SELECT balance, last_wheel_spin FROM er_coins WHERE player_id = ?"
      ).bind(playerId).first();

      const dernier = joueur?.last_wheel_spin
        ? Date.parse(joueur.last_wheel_spin)
        : 0;

      const prochain = dernier + JOUR;

      return Response.json({
        balance: joueur?.balance ?? 0,
        canSpin: !dernier || Date.now() >= prochain,
        nextSpin: dernier ? new Date(prochain).toISOString() : null
      });
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: "Méthode interdite" },
        { status: 405 }
      );
    }

    const maintenant = new Date();
    const limite = new Date(maintenant.getTime() - JOUR);

    const hasard = new Uint32Array(1);
    crypto.getRandomValues(hasard);
    const gain = hasard[0] % 501;

    const resultat = await env.DB.prepare(`
      INSERT INTO er_coins
        (player_id, balance, last_wheel_spin)
      VALUES (?, ?, ?)
      ON CONFLICT(player_id) DO UPDATE SET
        balance = er_coins.balance + excluded.balance,
        last_wheel_spin = excluded.last_wheel_spin
      WHERE er_coins.last_wheel_spin IS NULL
         OR er_coins.last_wheel_spin <= ?
      RETURNING balance, last_wheel_spin
    `).bind(
      playerId,
      gain,
      maintenant.toISOString(),
      limite.toISOString()
    ).first();

    if (!resultat) {
      return Response.json(
        { error: "Roue déjà utilisée. Reviens dans 24 heures." },
        { status: 429 }
      );
    }

    return Response.json({
      success: true,
      gain,
      balance: resultat.balance,
      nextSpin: new Date(
        maintenant.getTime() + JOUR
      ).toISOString()
    });

  } catch (erreur) {
    console.error("Erreur roue :", erreur);

    return Response.json(
      { error: "Impossible de traiter la demande" },
      { status: 500 }
    );
  }
}
