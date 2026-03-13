const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        password: true,
        createdAt: true,
        _count: {
          select: { likesReceived: true }
        }
      }
    });

    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user.id} - Username: ${user.username || 'null'} - Created: ${user.createdAt} - Likes: ${user._count.likesReceived}`);
      console.log(`  Password hash exists: ${!!user.password}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();