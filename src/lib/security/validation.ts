import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('유효한 이메일 주소를 입력해주세요');

export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(/[A-Z]/, '대문자를 포함해야 합니다')
  .regex(/[a-z]/, '소문자를 포함해야 합니다')
  .regex(/[0-9]/, '숫자를 포함해야 합니다')
  .regex(/[!@#$%^&*]/, '특수문자를 포함해야 합니다');

export const nameSchema = z
  .string()
  .min(2, '이름은 최소 2자 이상이어야 합니다')
  .max(50, '이름은 50자를 초과할 수 없습니다');

export const portfolioNameSchema = z
  .string()
  .min(1, '포트폴리오 이름을 입력해주세요')
  .max(100, '포트폴리오 이름은 100자를 초과할 수 없습니다');

export const stockSymbolSchema = z.string().regex(/^[A-Z0-9]+$/, '유효한 종목 코드를 입력해주세요');

export const amountSchema = z
  .number()
  .positive('금액은 양수여야 합니다')
  .finite('유효한 금액을 입력해주세요');

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD 이어야 합니다');

// Sanitization functions
export function sanitizeHTML(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

// SQL injection prevention
export function escapeSQLString(input: string): string {
  return input.replace(/['"\\\0\n\r\b\t\x1a]/g, (char) => {
    switch (char) {
      case "'":
        return "\\'";
      case '"':
        return '\\"';
      case '\\':
        return '\\\\';
      case '\0':
        return '\\0';
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '\b':
        return '\\b';
      case '\t':
        return '\\t';
      case '\x1a':
        return '\\Z';
      default:
        return char;
    }
  });
}

// XSS prevention for JSON responses
export function sanitizeJSONResponse(data: any): any {
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeJSONResponse);
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeJSONResponse(value);
    }
    return sanitized;
  }

  return data;
}

// Input validation wrapper
export function validateInput<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error.issues };
}
