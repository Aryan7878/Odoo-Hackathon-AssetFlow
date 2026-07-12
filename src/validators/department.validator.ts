import { z } from 'zod';

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    code: z.string().min(1, 'Code is required').max(20).toUpperCase(),
    description: z.string().max(500).optional(),
    managerId: z.string().uuid('Invalid manager ID').optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid department ID') }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    code: z.string().min(1).max(20).optional(),
    description: z.string().max(500).optional(),
    managerId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>['body'];
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>['body'];
