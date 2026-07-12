import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAdmin() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@assetflow.com' } });
  console.log(user);
}

checkAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
