
export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, nom, prix, categorie FROM articles WHERE actif = 1 ORDER BY prix ASC"
    ).all();

    return Response.json(results);
  } catch (error) {
    console.error(error);
    return Response.json(
      { erreur: "Impossible de charger les articles" },
      { status: 500 }
    );
  }
}
