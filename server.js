
const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    serveur: "ER COR LÉGION CORNUE",
    jeu: "The Isle Evrima",
    statut: "API en ligne"
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    serveur: "ER COR LÉGION CORNUE",
    jeu: "The Isle Evrima",
    statut: "verification_en_attente",
    players: null
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
