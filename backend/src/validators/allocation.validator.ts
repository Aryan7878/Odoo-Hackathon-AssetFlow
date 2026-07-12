import { z } from 'zod';

export const allocateAssetSchema = z.object({
  body: z.object({
    assetId: z.string().uuid('Invalid asset ID'),
    allocatedToId: z.string().uuid('Invalid user ID'),
    expectedReturn: z.string().datetime({ message: 'Invalid expected return date' }).optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const returnAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid allocation ID'),
  }),
  body: z.object({
    returnNotes: z.string().max(500).optional(),
  }),
});

export const allocationQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['ACTIVE', 'RETURNED']).optional(),
    assetId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export type AllocateAssetInput = z.infer<typeof allocateAssetSchema>['body'];
export type ReturnAssetInput = z.infer<typeof returnAssetSchema>['body'];
