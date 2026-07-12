import { BookingStatus, ActivityAction } from '@prisma/client';
import { bookingRepository } from '../repositories/booking.repository';
import { resourceRepository } from '../repositories/resource.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { AppError } from '../middlewares/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { getPaginationParams, buildPaginationMeta } from '../utils/pagination';
import { CreateBookingInput, UpdateBookingInput } from '../validators/booking.validator';
import { BookingQueryParams } from '../types';

export class BookingService {
  async create(data: CreateBookingInput, userId: string) {
    const resource = await resourceRepository.findById(data.resourceId);
    if (!resource) throw new AppError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    if (!resource.isActive) throw new AppError(ERROR_MESSAGES.RESOURCE_NOT_ACTIVE, HTTP_STATUS.BAD_REQUEST);

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    const overlap = await bookingRepository.findOverlapping(data.resourceId, startTime, endTime);
    if (overlap) {
      throw new AppError(ERROR_MESSAGES.BOOKING_OVERLAP, HTTP_STATUS.CONFLICT);
    }

    const booking = await bookingRepository.create({
      resource: { connect: { id: data.resourceId } },
      bookedBy: { connect: { id: userId } },
      title: data.title,
      description: data.description,
      startTime,
      endTime,
      attendees: data.attendees,
      status: BookingStatus.CONFIRMED,
    });

    await activityLogRepository.create({
      userId,
      action: ActivityAction.BOOKING_CREATED,
      entityType: 'Booking',
      entityId: booking.id,
      details: { resourceId: data.resourceId, title: data.title },
    });

    return booking;
  }

  async update(id: string, data: UpdateBookingInput, userId: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new AppError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError('Cannot update a cancelled booking', HTTP_STATUS.CONFLICT);
    }

    if (data.startTime && data.endTime) {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);

      if (endTime <= startTime) {
        throw new AppError(ERROR_MESSAGES.BOOKING_INVALID_DATES, HTTP_STATUS.BAD_REQUEST);
      }

      const overlap = await bookingRepository.findOverlapping(
        booking.resourceId, startTime, endTime, id
      );
      if (overlap) {
        throw new AppError(ERROR_MESSAGES.BOOKING_OVERLAP, HTTP_STATUS.CONFLICT);
      }
    }

    const updated = await bookingRepository.update(id, {
      ...data,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
    });

    await activityLogRepository.create({
      userId,
      action: ActivityAction.BOOKING_UPDATED,
      entityType: 'Booking',
      entityId: id,
    });

    return updated;
  }

  async cancel(id: string, userId: string, cancelNote?: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new AppError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError('Booking is already cancelled', HTTP_STATUS.CONFLICT);
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new AppError('Cannot cancel a completed booking', HTTP_STATUS.CONFLICT);
    }

    const updated = await bookingRepository.update(id, {
      status: BookingStatus.CANCELLED,
      cancelNote,
    });

    await activityLogRepository.create({
      userId,
      action: ActivityAction.BOOKING_CANCELLED,
      entityType: 'Booking',
      entityId: id,
    });

    return updated;
  }

  async findById(id: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new AppError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    return booking;
  }

  async findAll(query: BookingQueryParams) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const { total, bookings } = await bookingRepository.findAll({
      skip,
      take: limit,
      status: query.status as BookingStatus | undefined,
      resourceId: query.resourceId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });

    return {
      data: bookings,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async getCalendar(startDate: string, endDate: string, resourceId?: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return bookingRepository.getCalendar(start, end, resourceId);
  }
}

export const bookingService = new BookingService();
