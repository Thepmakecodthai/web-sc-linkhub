const { PrismaClient } = require('@prisma/client');

async function createTestData() {
  const prisma = new PrismaClient();

  try {
    // Create test users
    const user1 = await prisma.user.upsert({
      where: { email: 'test1@example.com' },
      update: {},
      create: {
        email: 'test1@example.com',
        name: 'Test User 1',
        username: 'testuser1',
        password: 'password123',
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: 'test2@example.com' },
      update: {},
      create: {
        email: 'test2@example.com',
        name: 'Test User 2',
        username: 'testuser2',
        password: 'password123',
      },
    });

    // Create test links
    await prisma.link.upsert({
      where: { id: 'test-link-1' },
      update: {},
      create: {
        id: 'test-link-1',
        title: 'Test Link 1',
        url: 'https://example.com',
        userId: user1.id,
      },
    });

    await prisma.link.upsert({
      where: { id: 'test-link-2' },
      update: {},
      create: {
        id: 'test-link-2',
        title: 'Test Link 2',
        url: 'https://google.com',
        userId: user2.id,
      },
    });

    console.log('Test data created successfully!');
    console.log('User 1 ID:', user1.id);
    console.log('User 2 ID:', user2.id);

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();