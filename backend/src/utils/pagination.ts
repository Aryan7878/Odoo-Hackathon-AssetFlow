import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../constants';
import { PaginationMeta, PaginationParams } from '../types';

export function getPaginationParams(page?: string, limit?: string): PaginationParams {
  const parsedPage = Math.max(1, parseInt(page || String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const parsedLimit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  const skip = (parsedPage - 1) * parsedLimit;

  return { page: parsedPage, limit: parsedLimit, skip };
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function getSortParams(
  sortBy?: string,
  sortOrder?: string,
  allowedFields: string[] = ['createdAt', 'updatedAt']
): Record<string, 'asc' | 'desc'> {
  const field = allowedFields.includes(sortBy || '') ? sortBy! : 'createdAt';
  const order = sortOrder === 'asc' ? 'asc' : 'desc';
  return { [field]: order };
}
