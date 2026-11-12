
export async function onRequestGet() {
  return Response.json({
    serveur: "ER COR LÉGION CORNUE",
    jeu: "The Isle Evrima",
    ip: "208.115.196.26",
    port: 14020,
    maxPlayers: 10,
    status: "verification_en_attente",
    players: null
  });
}
