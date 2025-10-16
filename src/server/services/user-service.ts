import { PrismaClient, UserRole, UserStatus } from '@prisma/client'
import { BaseService } from './base-service'
import { ServiceError } from '../../lib/errors/service-error'
import type {
  CreateUserInput,
  UpdateUserInput,
  GetUsersInput
} from '../../lib/validations/user'

export class UserService extends BaseService {
  constructor(prisma: PrismaClient) {
    super(prisma, 'UserService')
  }

  async createUser(data: CreateUserInput) {
    return this.executeWithLogging(
      'createUser',
      async () => {
        // Check if user already exists
        await this.ensureUnique(
          'User',
          'email',
          data.email,
          () => this.prisma.user.findUnique({ where: { email: data.email } })
        )

        // Check phone uniqueness if provided
        if (data.phone) {
          await this.ensureUnique(
            'User',
            'phone',
            data.phone,
            () => this.prisma.user.findUnique({ where: { phone: data.phone } })
          )
        }

        const user = await this.prisma.user.create({
          data: {
            ...data,
            status: UserStatus.PENDING_VERIFICATION,
          },
          include: {
            permissions: true,
          },
        })

        // TODO: Send welcome email and verification
        // await notificationService.sendWelcomeEmail(user.email)

        return user
      },
      { email: data.email, role: data.role }
    )
  }

  async getUserById(id: string) {
    return this.executeWithLogging(
      'getUserById',
      async () => {
        return this.findByIdOrThrow(
          'User',
          id,
          () => this.prisma.user.findUnique({
            where: { id },
            include: {
              addresses: {
                orderBy: { is_default: 'desc' },
              },
              permissions: true,
              _count: {
                select: {
                  orders: true,
                  cart_items: true,
                  wishlist_items: true,
                },
              },
            },
          })
        )
      },
      { userId: id }
    )
  }

  async getUserByEmail(email: string) {
    return this.executeWithLogging(
      'getUserByEmail',
      async () => {
        const user = await this.prisma.user.findUnique({
          where: { email },
          include: {
            permissions: true,
          },
        })

        if (!user) {
          throw ServiceError.notFound(`User with email ${email} not found`)
        }

        return user
      },
      { email }
    )
  }

  async getUsers(params: GetUsersInput) {
    return this.executeWithLogging(
      'getUsers',
      async () => {
        const { page, limit, role, status, search } = params

        const where = {
          ...(role && { role }),
          ...(status && { status }),
          ...(search && {
            OR: [
              { first_name: { contains: search, mode: 'insensitive' as const } },
              { last_name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }),
        }

        return this.getPaginatedResults(
          page,
          limit,
          (skip, take) => this.prisma.user.findMany({
            where,
            skip,
            take,
            orderBy: { created_at: 'desc' },
            include: {
              _count: {
                select: {
                  orders: true,
                  addresses: true,
                },
              },
            },
          }),
          () => this.prisma.user.count({ where })
        )
      },
      { filters: params }
    )
  }

  async updateUser(id: string, data: Omit<UpdateUserInput, 'id'>) {
    return this.executeWithLogging(
      'updateUser',
      async () => {
        // Verify user exists
        await this.getUserById(id)

        // Check email uniqueness if being updated
        if (data.email) {
          const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
          })
          if (existingUser && existingUser.id !== id) {
            throw ServiceError.alreadyExists(
              `User with email '${data.email}' already exists`
            )
          }
        }

        // Check phone uniqueness if being updated
        if (data.phone) {
          const existingUser = await this.prisma.user.findUnique({
            where: { phone: data.phone },
          })
          if (existingUser && existingUser.id !== id) {
            throw ServiceError.alreadyExists(
              `User with phone '${data.phone}' already exists`
            )
          }
        }

        const updatedUser = await this.prisma.user.update({
          where: { id },
          data,
          include: {
            permissions: true,
            _count: {
              select: {
                orders: true,
                addresses: true,
              },
            },
          },
        })

        return updatedUser
      },
      { userId: id, updates: Object.keys(data) }
    )
  }

  async blockUser(id: string, reason?: string) {
    return this.executeWithLogging(
      'blockUser',
      async () => {
        const user = await this.updateUser(id, {
          status: UserStatus.SUSPENDED
        })

        // TODO: Send notification about account suspension
        // if (reason) {
        //   await notificationService.sendAccountSuspensionEmail(user.email, reason)
        // }

        return user
      },
      { userId: id, reason }
    )
  }

  async unblockUser(id: string) {
    return this.executeWithLogging(
      'unblockUser',
      async () => {
        const user = await this.updateUser(id, {
          status: UserStatus.ACTIVE
        })

        // TODO: Send notification about account reactivation
        // await notificationService.sendAccountReactivationEmail(user.email)

        return user
      },
      { userId: id }
    )
  }

  async verifyEmail(id: string) {
    return this.executeWithLogging(
      'verifyEmail',
      async () => {
        return this.prisma.user.update({
          where: { id },
          data: {
            email_verified_at: new Date(),
            status: UserStatus.ACTIVE,
          },
        })
      },
      { userId: id }
    )
  }

  async verifyPhone(id: string) {
    return this.executeWithLogging(
      'verifyPhone',
      async () => {
        return this.prisma.user.update({
          where: { id },
          data: {
            phone_verified_at: new Date(),
          },
        })
      },
      { userId: id }
    )
  }

  async grantPermission(userId: string, permission: string, grantedBy?: string) {
    return this.executeWithLogging(
      'grantPermission',
      async () => {
        // Verify user exists
        await this.getUserById(userId)

        // Check if permission already exists
        const existingPermission = await this.prisma.userPermission.findUnique({
          where: {
            user_id_permission: {
              user_id: userId,
              permission,
            },
          },
        })

        if (existingPermission) {
          throw ServiceError.alreadyExists(
            `Permission '${permission}' already granted to user`
          )
        }

        return this.prisma.userPermission.create({
          data: {
            user_id: userId,
            permission,
            granted_by: grantedBy,
          },
          include: {
            user: true,
          },
        })
      },
      { userId, permission, grantedBy }
    )
  }

  async revokePermission(userId: string, permission: string) {
    return this.executeWithLogging(
      'revokePermission',
      async () => {
        const deleted = await this.prisma.userPermission.delete({
          where: {
            user_id_permission: {
              user_id: userId,
              permission,
            },
          },
        })

        return deleted
      },
      { userId, permission }
    )
  }

  async deleteUser(id: string) {
    return this.executeWithLogging(
      'deleteUser',
      async () => {
        // Verify user exists
        const user = await this.getUserById(id)

        // Check if user has orders (might want to soft delete instead)
        const orderCount = await this.prisma.order.count({
          where: { user_id: id },
        })

        if (orderCount > 0) {
          throw ServiceError.validationError(
            'Cannot delete user with existing orders. Consider suspending instead.',
            { orderCount }
          )
        }

        await this.prisma.user.delete({
          where: { id },
        })

        return { success: true, deletedUser: user }
      },
      { userId: id }
    )
  }

  async getUserStats(id: string) {
    return this.executeWithLogging(
      'getUserStats',
      async () => {
        const [user, stats] = await Promise.all([
          this.getUserById(id),
          this.prisma.order.aggregate({
            where: { user_id: id },
            _count: { id: true },
            _sum: { total: true },
          }),
        ])

        return {
          user,
          totalOrders: stats._count.id,
          totalSpent: stats._sum.total || 0,
          joinedAt: user.created_at,
          lastLogin: user.last_login_at,
        }
      },
      { userId: id }
    )
  }
}