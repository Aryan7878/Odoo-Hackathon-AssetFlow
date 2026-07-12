import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticate } from '../middlewares/authenticate';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

/**
 * @swagger
 * /bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get all bookings
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED] }
 *       - in: query
 *         name: resourceId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Paginated list of bookings
 */
router.get('/', authenticate, asyncWrapper(bookingController.findAll.bind(bookingController)));

/**
 * @swagger
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     description: Returns 409 if resource is already booked for the time slot
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resourceId, title, startTime, endTime]
 *             properties:
 *               resourceId: { type: string, format: uuid }
 *               title: { type: string }
 *               description: { type: string }
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *               attendees: { type: integer }
 *     responses:
 *       201:
 *         description: Booking created
 *       409:
 *         description: Time slot already booked
 */
router.post('/', authenticate, asyncWrapper(bookingController.create.bind(bookingController)));

/**
 * @swagger
 * /bookings/calendar:
 *   get:
 *     tags: [Bookings]
 *     summary: Get calendar view of bookings
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: resourceId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Calendar bookings
 */
router.get('/calendar', authenticate, asyncWrapper(bookingController.getCalendar.bind(bookingController)));

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Booking details
 */
router.get('/:id', authenticate, asyncWrapper(bookingController.findById.bind(bookingController)));

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     tags: [Bookings]
 *     summary: Update booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Booking updated
 */
router.put('/:id', authenticate, asyncWrapper(bookingController.update.bind(bookingController)));

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   post:
 *     tags: [Bookings]
 *     summary: Cancel a booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelNote: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
router.post('/:id/cancel', authenticate, asyncWrapper(bookingController.cancel.bind(bookingController)));

export default router;
