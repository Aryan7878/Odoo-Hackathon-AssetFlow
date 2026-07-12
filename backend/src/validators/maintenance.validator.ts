import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  body: z.object({
    assetId: z.string().uuid('Invalid asset ID'),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required').max(2000),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
    scheduledDate: z.string().datetime().optional(),
  }),
});

export const updateMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid maintenance request ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    scheduledDate: z.string().datetime().optional(),
  }),
});

export const approveMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid maintenance request ID'),
  }),
  body: z.object({
    assignedToId: z.string().uuid('Invalid technician ID').optional(),
    scheduledDate: z.string().datetime().optional(),
  }),
});

export const rejectMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid maintenance request ID'),
  }),
  body: z.object({
    rejectionNote: z.string().min(1, 'Rejection note is required').max(500),
  }),
});

export const completeMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid maintenance request ID'),
  }),
  body: z.object({
    resolution: z.string().min(1, 'Resolution is required').max(2000),
    cost: z.number().positive().optional(),
  }),
});

export const maintenanceQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']).optional(),
    assetId: z.string().uuid().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>['body'];
export type CompleteMaintenanceInput = z.infer<typeof completeMaintenanceSchema>['body'];
