const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Histoire & Chronologie', icon: '📜' },
    { name: 'Classes', icon: '⚔️' },
    { name: 'Panthéon des Dieux', icon: '🌟' },
    { name: 'Géographie & Lieux', icon: '🗺️' },
    { name: 'Races & Peuples', icon: '🧝' },
    { name: 'Lore & Légendes', icon: '📖' },
    { name: 'Factions & Organisations', icon: '🎭' },
    { name: 'Magie & Systèmes', icon: '🔮' },
    { name: 'Objets & Artefacts', icon: '🗡️' }
  ];

  console.log('Seeding categories...');

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('Categories created!');

  // Ensure an MJ user exists (optional, mostly for dev)
  // You can manually create if needed or rely on register
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
