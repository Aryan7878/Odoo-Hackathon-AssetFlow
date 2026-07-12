import { z } from 'zod';
import { AssetCondition, AssetStatus } from '@prisma/client';

export const createAssetSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Asset name is required').max(200),
    description: z.string().max(1000).optional(),
    categoryId: z.string().uuid('Invalid category ID'),
    departmentId: z.string().uuid('Invalid department ID').optional(),
    serialNumber: z.string().max(100).optional(),
    purchaseDate: z.string().datetime({ message: 'Invalid purchase date' }).optional(),
    purchaseCost: z.number().positive('Purchase cost must be positive').optional(),
    vendor: z.string().max(200).optional(),
    invoiceNumber: z.string().max(100).optional(),
    warrantyExpiry: z.string().datetime({ message: 'Invalid warranty expiry date' }).optional(),
    location: z.string().max(200).optional(),
    condition: z.nativeEnum(AssetCondition).optional().default(AssetCondition.GOOD),
    imageUrl: z.string().url('Invalid image URL').optional(),
  }),
});

export const updateAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid asset ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    departmentId: z.string().uuid('Invalid department ID').optional(),
    serialNumber: z.string().max(100).optional(),
    purchaseDate: z.string().datetime().optional(),
    purchaseCost: z.number().positive().optional(),
    vendor: z.string().max(200).optional(),
    invoiceNumber: z.string().max(100).optional(),
    warrantyExpiry: z.string().datetime().optional(),
    location: z.string().max(200).optional(),
    condition: z.nativeEnum(AssetCondition).optional(),
    status: z.nativeEnum(AssetStatus).optional(),
    imageUrl: z.string().url().optional(),
  }),
});

export const assetIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid asset ID'),
  }),
});

export const assetQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.nativeEnum(AssetStatus).optional(),
    categoryId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    condition: z.nativeEnum(AssetCondition).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>['body'];
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>['body'];
