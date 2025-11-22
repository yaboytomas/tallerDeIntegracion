import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../types';

/**
 * Create audit log entry
 */
export async function createAuditLog(
  userId: string | undefined,
  action: string,
  resource: string,
  resourceId: string | undefined,
  changes?: Record<string, any>,
  req?: Request
): Promise<void> {
  try {
    await AuditLog.create({
      userId: userId || undefined,
      action,
      resource,
      resourceId,
      changes,
      ipAddress: req?.ip || req?.socket.remoteAddress,
      userAgent: req?.get('user-agent'),
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit logging should not break the request
  }
}

/**
 * Middleware to log admin actions
 */
export function auditAdminAction(action: string, resource: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = function (body: any) {
      // Log after response is sent
      if (res.statusCode < 400) {
        const resourceId = req.params.id || req.body.id || undefined;
        createAuditLog(
          req.user?.userId,
          action,
          resource,
          resourceId,
          req.method === 'PUT' || req.method === 'PATCH' ? req.body : undefined,
          req
        );
      }
      return originalJson(body);
    };

    next();
  };
}

