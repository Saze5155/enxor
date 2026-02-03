const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPlayers = async (req, res) => {
  try {
    const players = await prisma.user.findMany({
      select: { id: true, username: true, role: true },
       // Optional: filter where role is PLAYER if needed, but MJ might want to target other MJs too
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération joueurs" });
  }
};
