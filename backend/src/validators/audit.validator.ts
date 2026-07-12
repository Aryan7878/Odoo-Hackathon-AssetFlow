import { z } from 'zod';
import { AuditItemStatus } from '@prisma/client';

export const createAuditCycleSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    departmentId: z.string().uuid('Invalid department ID').optional(),
    startDate: z.string().datetime({ message: 'Invalid start date' }),
    endDate: z.string().datetime({ message: 'Invalid end date' }).optional(),
    assetIds: z.array(z.string().uuid()).optional(),
  }),
});

export const updateAuditItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid audit cycle ID'),
    itemId: z.string().uuid('Invalid audit item ID'),
  }),
  body: z.object({
    status: z.nativeEnum(AuditItemStatus),
    notes: z.string().max(500).optional(),
  }),
});

export const addAuditItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid audit cycle ID'),
  }),
  body: z.object({
    assetIds: z.array(z.string().uuid('Invalid asset ID')).min(1, 'At least one asset ID is required'),
  }),
});

export type CreateAuditCycleInput = z.infer<typeof createAuditCycleSchema>['body'];
