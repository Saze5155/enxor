
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const userCount = await prisma.user.count();
    const characterCount = await prisma.character.count();
    const campaignCount = await prisma.campaign.count();
    const articleCount = await prisma.article.count();
    const categoryCount = await prisma.category.count();

    console.log('--- Database Counts ---');
    console.log(`Users: ${userCount}`);
    console.log(`Characters: ${characterCount}`);
    console.log(`Campaigns: ${campaignCount}`);
    console.log(`Articles: ${articleCount}`);
    console.log(`Categories: ${categoryCount}`);
    console.log('-----------------------');
  } catch (e) {
    console.error('Error checking data:', e);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
