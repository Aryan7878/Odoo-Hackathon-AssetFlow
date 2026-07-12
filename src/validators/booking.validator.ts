import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    resourceId: z.string().uuid('Invalid resource ID'),
    title: z.string().min(1, 'Booking title is required').max(200),
    description: z.string().max(1000).optional(),
    startTime: z.string().datetime({ message: 'Invalid start time' }),
    endTime: z.string().datetime({ message: 'Invalid end time' }),
    attendees: z.number().int().positive().optional(),
  }).refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    { message: 'End time must be after start time', path: ['endTime'] }
  ),
});

export const updateBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    attendees: z.number().int().positive().optional(),
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID'),
  }),
  body: z.object({
    cancelNote: z.string().max(500).optional(),
  }),
});

export const bookingQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
    resourceId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const calendarQuerySchema = z.object({
  query: z.object({
    resourceId: z.string().uuid('Invalid resource ID').optional(),
    startDate: z.string({ required_error: 'Start date is required' }),
    endDate: z.string({ required_error: 'End date is required' }),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>['body'];
