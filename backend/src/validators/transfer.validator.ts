import { z } from 'zod';

export const createTransferSchema = z.object({
  body: z.object({
    assetId: z.string().uuid('Invalid asset ID'),
    toUserId: z.string().uuid('Invalid target user ID'),
    toDeptId: z.string().uuid('Invalid target department ID').optional(),
    reason: z.string().min(1, 'Reason is required').max(1000),
  }),
});

export const approveTransferSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transfer request ID'),
  }),
});

export const rejectTransferSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transfer request ID'),
  }),
  body: z.object({
    rejectionNote: z.string().min(1, 'Rejection note is required').max(500),
  }),
});

export const transferQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    assetId: z.string().uuid().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>['body'];
