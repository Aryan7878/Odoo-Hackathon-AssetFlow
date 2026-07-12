import { BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

const bookingInclude = {
  resource: { select: { id: true, name: true, code: true, type: true, location: true, capacity: true } },
  bookedBy: { select: { id: true, firstName: true, lastName: true, email: true, employeeId: true } },
};

export class BookingRepository {
  async create(data: Prisma.BookingCreateInput) {
    return prisma.booking.create({ data, include: bookingInclude });
  }

  async findById(id: string) {
    return prisma.booking.findUnique({ where: { id }, include: bookingInclude });
  }

  async update(id: string, data: Prisma.BookingUpdateInput) {
    return prisma.booking.update({ where: { id }, data, include: bookingInclude });
  }

  async findAll(params: {
    skip: number;
    take: number;
    status?: BookingStatus;
    resourceId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    orderBy?: Prisma.BookingOrderByWithRelationInput;
  }) {
    const where: Prisma.BookingWhereInput = {
      ...(params.status && { status: params.status }),
      ...(params.resourceId && { resourceId: params.resourceId }),
      ...(params.userId && { bookedById: params.userId }),
      ...(params.startDate && params.endDate && {
        startTime: { gte: params.startDate },
        endTime: { lte: params.endDate },
      }),
    };

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy || { startTime: 'asc' },
        include: bookingInclude,
      }),
    ]);

    return { total, bookings };
  }

  async findOverlapping(resourceId: string, startTime: Date, endTime: Date, excludeId?: string) {
    return prisma.booking.findFirst({
      where: {
        resourceId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });
  }

  async countToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.booking.count({
      where: {
        startTime: { gte: today, lt: tomorrow },
        status: { not: BookingStatus.CANCELLED },
      },
    });
  }

  async getCalendar(startDate: Date, endDate: Date, resourceId?: string) {
    return prisma.booking.findMany({
      where: {
        ...(resourceId && { resourceId }),
        status: { not: BookingStatus.CANCELLED },
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      include: bookingInclude,
      orderBy: { startTime: 'asc' },
    });
  }
}

export const bookingRepository = new BookingRepository();
