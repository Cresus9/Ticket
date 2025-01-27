import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: npm run create-admin <email> <password>');
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('Admin user created successfully:', {
      id: admin.id,
      email: admin.email,
      role: admin.role
    });
  } catch (error: any) {
    console.error('Failed to create admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();