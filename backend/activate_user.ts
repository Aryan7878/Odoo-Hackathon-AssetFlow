import { PrismaClient, UserStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function activateUser() {
  const user = await prisma.user.update({
    where: { email: 'manasgupta1011@gmail.com' },
    data: {
      status: UserStatus.ACTIVE,
      isActive: true
    }
  });
  console.log("User activated:", user.status);
}

activateUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
