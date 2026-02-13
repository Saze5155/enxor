const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all characters...");
    try {
        const characters = await prisma.character.findMany({
             select: { id: true, name: true, userId: true }
        });
        
        console.log(`Found ${characters.length} characters:`);
        characters.forEach(c => {
            console.log(`- ${c.name} (${c.id}) User:${c.userId}`);
        });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
