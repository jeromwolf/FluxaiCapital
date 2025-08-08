import prisma from '@/lib/prisma';

export enum AuditAction {
  // Authentication
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  
  // Data Access
  DATA_VIEW = 'DATA_VIEW',
  DATA_CREATE = 'DATA_CREATE',
  DATA_UPDATE = 'DATA_UPDATE',
  DATA_DELETE = 'DATA_DELETE',
  DATA_EXPORT = 'DATA_EXPORT',
  
  // Security
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  SECURITY_ALERT = 'SECURITY_ALERT',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export interface AuditLogData {
  userId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
}

export class AuditLogger {
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.activity.create({
        data: {
          userId: data.userId || 'system',
          type: data.action,
          action: this.formatActionMessage(data),
          metadata: data.metadata || {},
        }
      });
    } catch (error) {
      // Log to console if database write fails
      console.error('Failed to write audit log:', error, data);
    }
  }
  
  private static formatActionMessage(data: AuditLogData): string {
    const { action, resource, resourceId, success } = data;
    
    switch (action) {
      case AuditAction.LOGIN_SUCCESS:
        return 'User logged in successfully';
      case AuditAction.LOGIN_FAILED:
        return 'Failed login attempt';
      case AuditAction.LOGOUT:
        return 'User logged out';
      case AuditAction.PASSWORD_CHANGE:
        return 'Password changed';
      case AuditAction.DATA_VIEW:
        return `Viewed ${resource}${resourceId ? ` (${resourceId})` : ''}`;
      case AuditAction.DATA_CREATE:
        return `Created ${resource}${resourceId ? ` (${resourceId})` : ''}`;
      case AuditAction.DATA_UPDATE:
        return `Updated ${resource}${resourceId ? ` (${resourceId})` : ''}`;
      case AuditAction.DATA_DELETE:
        return `Deleted ${resource}${resourceId ? ` (${resourceId})` : ''}`;
      case AuditAction.DATA_EXPORT:
        return `Exported ${resource} data`;
      case AuditAction.SECURITY_ALERT:
        return `Security alert: ${data.metadata?.message || 'Unknown'}`;
      case AuditAction.CSRF_VIOLATION:
        return 'CSRF token validation failed';
      case AuditAction.RATE_LIMIT_EXCEEDED:
        return 'Rate limit exceeded';
      default:
        return `${action}${resource ? ` on ${resource}` : ''}`;
    }
  }
  
  // Convenience methods
  static async logLogin(userId: string, success: boolean, ipAddress?: string): Promise<void> {
    await this.log({
      userId,
      action: success ? AuditAction.LOGIN_SUCCESS : AuditAction.LOGIN_FAILED,
      ipAddress,
      success,
    });
  }
  
  static async logDataAccess(
    userId: string,
    action: 'view' | 'create' | 'update' | 'delete' | 'export',
    resource: string,
    resourceId?: string
  ): Promise<void> {
    const actionMap = {
      view: AuditAction.DATA_VIEW,
      create: AuditAction.DATA_CREATE,
      update: AuditAction.DATA_UPDATE,
      delete: AuditAction.DATA_DELETE,
      export: AuditAction.DATA_EXPORT,
    };
    
    await this.log({
      userId,
      action: actionMap[action],
      resource,
      resourceId,
    });
  }
  
  static async logSecurityEvent(
    type: 'csrf' | 'rate_limit' | 'alert',
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    const actionMap = {
      csrf: AuditAction.CSRF_VIOLATION,
      rate_limit: AuditAction.RATE_LIMIT_EXCEEDED,
      alert: AuditAction.SECURITY_ALERT,
    };
    
    await this.log({
      userId,
      action: actionMap[type],
      metadata,
    });
  }
}