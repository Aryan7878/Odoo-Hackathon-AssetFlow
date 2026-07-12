import { Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { PaginationMeta } from '../types';

export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T,
  statusCode: number = HTTP_STATUS.OK
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendCreated<T>(res: Response, message: string, data: T): Response {
  return sendSuccess(res, message, data, HTTP_STATUS.CREATED);
}

export function sendPaginated<T>(
  res: Response,
  message: string,
  data: T[],
  pagination: PaginationMeta
): Response {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: unknown[]
): Response {
  const body: Record<string, unknown> = { success: false, message };
  if (errors && errors.length > 0) body.errors = errors;
  return res.status(statusCode).json(body);
}

export function sendNotFound(res: Response, message: string): Response {
  return sendError(res, message, HTTP_STATUS.NOT_FOUND);
}

export function sendUnauthorized(res: Response, message: string): Response {
  return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
}

export function sendForbidden(res: Response, message: string): Response {
  return sendError(res, message, HTTP_STATUS.FORBIDDEN);
}

export function sendConflict(res: Response, message: string): Response {
  return sendError(res, message, HTTP_STATUS.CONFLICT);
}

export function sendBadRequest(res: Response, message: string, errors?: unknown[]): Response {
  return sendError(res, message, HTTP_STATUS.BAD_REQUEST, errors);
}
