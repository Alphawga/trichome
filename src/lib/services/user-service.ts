import { User, UserRole, UserStatus, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { BaseService, ServiceError, PaginationParams, PaginatedResult } from './base-service'

export interface CreateUserData {
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  password?: string
  role?: UserRole
  status?: UserStatus
}

export interface UpdateUserData {
  first_name?: string
  last_name?: string
  phone_number?: string
  email?: string
  status?: UserStatus
  role?: UserRole
}

export interface UserWithProfile extends User {
  profile?: {
    avatar_url?: string
    date_of_birth?: Date
    gender?: string
  }
}

export interface UserFilters {
  role?: UserRole
  status?: UserStatus
  search?: string
  createdAfter?: Date
  createdBefore?: Date
}

export class UserService extends BaseService {
  constructor() {
    super('UserService')
  }

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      this.logger.info('Creating new user', { email: userData.email })

      // Check if user already exists
      const existingUser = await this.db.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        throw this.createError(
          'User with this email already exists',
          'USER_ALREADY_EXISTS',
          409
        )
      }

      // Hash password if provided
      let hashedPassword: string | undefined
      if (userData.password) {
        hashedPassword = await bcrypt.hash(userData.password, 12)
      }

      // Create user
      const user = await this.db.user.create({
        data: {
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_number: userData.phone_number,
          password_hash: hashedPassword,
          role: userData.role || UserRole.CUSTOMER,
          status: userData.status || UserStatus.ACTIVE,
          email_verified: false
        }
      })

      this.logger.info('User created successfully', { userId: user.id })
      return user

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to create user',
        'USER_CREATION_FAILED',
        500,
        error
      )
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await this.db.user.findUnique({
        where: { id },
        include: {
          addresses: true,
          orders: {
            take: 5,
            orderBy: { created_at: 'desc' }
          }
        }
      })

      return user
    } catch (error) {
      throw this.createError(
        'Failed to fetch user',
        'USER_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.db.user.findUnique({
        where: { email }
      })

      return user
    } catch (error) {
      throw this.createError(
        'Failed to fetch user by email',
        'USER_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async updateUser(id: string, updateData: UpdateUserData): Promise<User> {
    try {
      this.logger.info('Updating user', { userId: id })

      // Check if user exists
      const existingUser = await this.db.user.findUnique({
        where: { id }
      })

      if (!existingUser) {
        throw this.createError('User not found', 'USER_NOT_FOUND', 404)
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await this.db.user.findUnique({
          where: { email: updateData.email }
        })

        if (emailExists) {
          throw this.createError(
            'Email already in use',
            'EMAIL_ALREADY_EXISTS',
            409
          )
        }
      }

      const updatedUser = await this.db.user.update({
        where: { id },
        data: {
          ...updateData,
          updated_at: new Date()
        }
      })

      this.logger.info('User updated successfully', { userId: id })
      return updatedUser

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to update user',
        'USER_UPDATE_FAILED',
        500,
        error
      )
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      this.logger.info('Deleting user', { userId: id })

      const user = await this.db.user.findUnique({
        where: { id }
      })

      if (!user) {
        throw this.createError('User not found', 'USER_NOT_FOUND', 404)
      }

      // Soft delete by updating status
      await this.db.user.update({
        where: { id },
        data: {
          status: UserStatus.INACTIVE,
          updated_at: new Date()
        }
      })

      this.logger.info('User deleted successfully', { userId: id })

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to delete user',
        'USER_DELETE_FAILED',
        500,
        error
      )
    }
  }

  async getUsers(
    pagination: PaginationParams,
    filters?: UserFilters
  ): Promise<PaginatedResult<User>> {
    try {
      this.validatePagination(pagination.page, pagination.limit)

      const skip = (pagination.page - 1) * pagination.limit

      // Build where clause
      const where: Prisma.UserWhereInput = {}

      if (filters?.role) {
        where.role = filters.role
      }

      if (filters?.status) {
        where.status = filters.status
      }

      if (filters?.search) {
        where.OR = [
          { first_name: { contains: filters.search, mode: 'insensitive' } },
          { last_name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      if (filters?.createdAfter || filters?.createdBefore) {
        where.created_at = {}
        if (filters.createdAfter) {
          where.created_at.gte = filters.createdAfter
        }
        if (filters.createdBefore) {
          where.created_at.lte = filters.createdBefore
        }
      }

      // Execute queries in parallel
      const [users, total] = await Promise.all([
        this.db.user.findMany({
          where,
          skip,
          take: pagination.limit,
          orderBy: { created_at: 'desc' },
          include: {
            _count: {
              select: {
                orders: true
              }
            }
          }
        }),
        this.db.user.count({ where })
      ])

      return this.createPaginatedResult(users, total, pagination.page, pagination.limit)

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to fetch users',
        'USERS_FETCH_FAILED',
        500,
        error
      )
    }
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.db.user.findUnique({
        where: { email }
      })

      if (!user || !user.password_hash) {
        return null
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash)
      return isPasswordValid ? user : null

    } catch (error) {
      throw this.createError(
        'Failed to verify password',
        'PASSWORD_VERIFICATION_FAILED',
        500,
        error
      )
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    try {
      this.logger.info('Updating user password', { userId: id })

      const hashedPassword = await bcrypt.hash(newPassword, 12)

      await this.db.user.update({
        where: { id },
        data: {
          password_hash: hashedPassword,
          updated_at: new Date()
        }
      })

      this.logger.info('Password updated successfully', { userId: id })

    } catch (error) {
      throw this.createError(
        'Failed to update password',
        'PASSWORD_UPDATE_FAILED',
        500,
        error
      )
    }
  }

  async toggleUserStatus(id: string): Promise<User> {
    try {
      const user = await this.db.user.findUnique({
        where: { id }
      })

      if (!user) {
        throw this.createError('User not found', 'USER_NOT_FOUND', 404)
      }

      const newStatus = user.status === UserStatus.ACTIVE
        ? UserStatus.INACTIVE
        : UserStatus.ACTIVE

      const updatedUser = await this.db.user.update({
        where: { id },
        data: {
          status: newStatus,
          updated_at: new Date()
        }
      })

      this.logger.info('User status toggled', { userId: id, newStatus })
      return updatedUser

    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw this.createError(
        'Failed to toggle user status',
        'STATUS_TOGGLE_FAILED',
        500,
        error
      )
    }
  }

  async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
    customers: number
    admins: number
    staff: number
    newThisMonth: number
  }> {
    try {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const [
        total,
        active,
        inactive,
        customers,
        admins,
        staff,
        newThisMonth
      ] = await Promise.all([
        this.db.user.count(),
        this.db.user.count({ where: { status: UserStatus.ACTIVE } }),
        this.db.user.count({ where: { status: UserStatus.INACTIVE } }),
        this.db.user.count({ where: { role: UserRole.CUSTOMER } }),
        this.db.user.count({ where: { role: UserRole.ADMIN } }),
        this.db.user.count({ where: { role: UserRole.STAFF } }),
        this.db.user.count({
          where: {
            created_at: {
              gte: firstDayOfMonth
            }
          }
        })
      ])

      return {
        total,
        active,
        inactive,
        customers,
        admins,
        staff,
        newThisMonth
      }

    } catch (error) {
      throw this.createError(
        'Failed to fetch user stats',
        'USER_STATS_FAILED',
        500,
        error
      )
    }
  }
}

// Export singleton instance
export const userService = new UserService()