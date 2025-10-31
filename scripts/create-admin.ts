import { PrismaClient, UserRole, UserStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@trichome.com' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists!')
      console.log('Email: admin@trichome.com')
      console.log('Password: demo123')
      return
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@trichome.com',
        name: 'Admin User',
        first_name: 'Admin',
        last_name: 'User',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('Email: admin@trichome.com')
    console.log('Password: demo123')
    console.log('User ID:', admin.id)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
