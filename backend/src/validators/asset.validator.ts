import { z } from 'zod';
import { AssetCondition, AssetStatus } from '@prisma/client';

const nullableOptionalString = (max?: number) =>
  z.string().max(max ?? 9999).nullable().optional().transform(v => v ?? undefined);

const nullableOptionalDateString = () =>
  z.string().nullable().optional().transform(v => {
    if (!v) return undefined;
    // Accept plain date "YYYY-MM-DD" and convert to ISO datetime string
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v).toISOString();
    return v;
  });

const nullableOptionalNumber = () =>
  z.union([z.number(), z.string().transform(Number), z.null()])
    .optional()
    .transform(v => (v == null || isNaN(v as number) ? undefined : (v as number)));

export const createAssetSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Asset name is required').max(200),
    description: nullableOptionalString(1000),
    categoryId: z.string().uuid('Invalid category ID'),
    departmentId: z.string().uuid('Invalid department ID').nullable().optional().transform(v => v ?? undefined),
    serialNumber: nullableOptionalString(100),
    purchaseDate: nullableOptionalDateString(),
    purchaseCost: nullableOptionalNumber(),
    vendor: nullableOptionalString(200),
    invoiceNumber: nullableOptionalString(100),
    warrantyExpiry: nullableOptionalDateString(),
    location: nullableOptionalString(200),
    condition: z.nativeEnum(AssetCondition).optional().default(AssetCondition.GOOD),
    imageUrl: z.string().url('Invalid image URL').nullable().optional().transform(v => v ?? undefined),
  }),
});

export const updateAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid asset ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: nullableOptionalString(1000),
    categoryId: z.string().uuid('Invalid category ID').nullable().optional().transform(v => v ?? undefined),
    departmentId: z.string().uuid('Invalid department ID').nullable().optional().transform(v => v ?? undefined),
    serialNumber: nullableOptionalString(100),
    purchaseDate: nullableOptionalDateString(),
    purchaseCost: nullableOptionalNumber(),
    vendor: nullableOptionalString(200),
    invoiceNumber: nullableOptionalString(100),
    warrantyExpiry: nullableOptionalDateString(),
    location: nullableOptionalString(200),
    condition: z.nativeEnum(AssetCondition).nullable().optional().transform(v => v ?? undefined),
    status: z.nativeEnum(AssetStatus).nullable().optional().transform(v => v ?? undefined),
    imageUrl: z.string().url().nullable().optional().transform(v => v ?? undefined),
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
