const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
    const username = process.argv[2];
    const newPassword = process.argv[3];

    if (!username || !newPassword) {
        console.error('Usage: node reset-password.js <username> <new-password>');
        process.exit(1);
    }

    try {
        // Find user
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            console.error(`❌ Utilisateur "${username}" non trouvé`);
            process.exit(1);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        console.log(`✅ Mot de passe réinitialisé pour "${username}"`);
        console.log(`   Nouveau mot de passe : ${newPassword}`);
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
