import { Prisma, UserStatus, Role } from '@prisma/client';
import { prisma } from '../config/database';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { department: true },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  async findByGoogleId(googleId: string) {
    return prisma.user.findUnique({
      where: { googleId },
      include: { department: true },
    });
  }

  async findAdmins() {
    return prisma.user.findMany({
      where: { role: Role.ADMIN, status: UserStatus.ACTIVE, isVerified: true },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: { department: true },
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken, lastLoginAt: refreshToken ? new Date() : undefined },
    });
  }

  async findByRefreshToken(refreshToken: string) {
    return prisma.user.findFirst({ where: { refreshToken } });
  }

  async updateStatus(userId: string, status: UserStatus) {
    return prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  async approveUser(userId: string, adminId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE,
        isVerified: true,
        isActive: true,
        approvedBy: adminId,
        approvedAt: new Date(),
      },
      include: { department: true },
    });
  }

  async rejectUser(userId: string, adminId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.REJECTED,
        approvedBy: adminId,
        approvedAt: new Date(),
      },
      include: { department: true },
    });
  }

  async suspendUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED, isActive: false },
      include: { department: true },
    });
  }

  async activateUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE, isActive: true, isVerified: true },
      include: { department: true },
    });
  }

  async updateRole(userId: string, role: Role) {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { department: true },
    });
  }

  async updateDepartment(userId: string, departmentId: string, designation?: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        departmentId,
        ...(designation && { designation }),
      },
      include: { department: true },
    });
  }

  async findAll(params: {
    skip: number;
    take: number;
    search?: string;
    departmentId?: string;
    role?: string;
    status?: string;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const where: Prisma.UserWhereInput = {
      ...(params.search && {
        OR: [
          { firstName: { contains: params.search, mode: 'insensitive' } },
          { lastName: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
          { employeeId: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.departmentId && { departmentId: params.departmentId }),
      ...(params.role && { role: params.role as Prisma.EnumRoleFilter['equals'] }),
      ...(params.status && { status: params.status as UserStatus }),
    };

    const [total, usersRaw] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { createdAt: 'desc' },
        include: {
          department: { select: { id: true, name: true, code: true } },
          _count: { select: { allocations: true } }
        },
      }),
    ]);

    const users = usersRaw.map(({ password: _p, refreshToken: _r, ...u }) => u);

    return { total, users };
  }

  async findByStatus(status: UserStatus) {
    const usersRaw = await prisma.user.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });
    return usersRaw.map(({ password: _p, refreshToken: _r, ...u }) => u);
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { department: true },
    });
  }

  async count() {
    return prisma.user.count({ where: { isActive: true } });
  }

  async generateEmployeeId(): Promise<string> {
    const lastUser = await prisma.user.findFirst({
      orderBy: { employeeId: 'desc' },
      select: { employeeId: true },
    });
    if (!lastUser) return 'EMP-001';
    const parts = lastUser.employeeId.split('-');
    const num = parseInt(parts[1] || '0', 10) + 1;
    return `EMP-${String(num).padStart(3, '0')}`;
  }
}

export const userRepository = new UserRepository();
