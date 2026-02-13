const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const id = "a76970f3-405a-4adc-a253-4a6073ceac11"; // ID of character 'g'
    console.log(`Testing findUnique for ID: ${id}`);
    
    try {
        const character = await prisma.character.findUnique({
            where: { id },
             include: { 
                 inventory: true
             }
        });
        
        if (character) {
            console.log("✅ Character FOUND!");
            console.log("Name:", character.name);
            console.log("Inventory count:", character.inventory.length);
        } else {
            console.log("❌ Character NOT FOUND (null returned)");
        }
    } catch (e) {
        console.error("❌ Error executing findUnique:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
