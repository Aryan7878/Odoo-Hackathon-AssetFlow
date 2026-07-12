import { z } from 'zod';
import { ResourceType } from '@prisma/client';

export const createResourceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    code: z.string().min(1, 'Code is required').max(20),
    type: z.nativeEnum(ResourceType),
    description: z.string().max(500).optional(),
    location: z.string().max(200).optional(),
    capacity: z.number().int().positive().optional(),
    imageUrl: z.string().url().optional(),
  }),
});

export const updateResourceSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid resource ID') }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    code: z.string().min(1).max(20).optional(),
    type: z.nativeEnum(ResourceType).optional(),
    description: z.string().max(500).optional(),
    location: z.string().max(200).optional(),
    capacity: z.number().int().positive().optional(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>['body'];
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>['body'];
