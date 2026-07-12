import { Response } from 'express';
import { AuthRequest } from '../types';
import { bookingService } from '../services/booking.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse';
import { SUCCESS_MESSAGES } from '../constants';
import {
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  calendarQuerySchema,
} from '../validators/booking.validator';
import { z } from 'zod';

const idSchema = z.object({ params: z.object({ id: z.string().uuid() }) });

export class BookingController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    const { body } = createBookingSchema.parse({ body: req.body });
    const booking = await bookingService.create(body, req.user!.userId);
    sendCreated(res, SUCCESS_MESSAGES.BOOKING_CREATED, booking);
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = updateBookingSchema.parse({ params: req.params, body: req.body });
    const booking = await bookingService.update(params.id, body, req.user!.userId);
    sendSuccess(res, SUCCESS_MESSAGES.BOOKING_UPDATED, booking);
  }

  async cancel(req: AuthRequest, res: Response): Promise<void> {
    const { params, body } = cancelBookingSchema.parse({ params: req.params, body: req.body });
    const booking = await bookingService.cancel(params.id, req.user!.userId, body.cancelNote);
    sendSuccess(res, SUCCESS_MESSAGES.BOOKING_CANCELLED, booking);
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    const { params } = idSchema.parse({ params: req.params });
    const booking = await bookingService.findById(params.id);
    sendSuccess(res, SUCCESS_MESSAGES.BOOKING_FETCHED, booking);
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    const { data, pagination } = await bookingService.findAll(req.query as Record<string, string>);
    sendPaginated(res, SUCCESS_MESSAGES.BOOKINGS_FETCHED, data, pagination);
  }

  async getCalendar(req: AuthRequest, res: Response): Promise<void> {
    const { query } = calendarQuerySchema.parse({ query: req.query });
    const bookings = await bookingService.getCalendar(
      query.startDate,
      query.endDate,
      query.resourceId
    );
    sendSuccess(res, SUCCESS_MESSAGES.BOOKINGS_FETCHED, bookings);
  }
}

export const bookingController = new BookingController();
