import { AnyZodObject, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import sanitize from 'perfect-express-sanitizer';

/* Helpers for validating body, query, and params */
export const validateBody = (schema: AnyZodObject) => validate('body', schema);
export const validateQuery = (schema: AnyZodObject) => validate('query', schema);
export const validateParams = (schema: AnyZodObject) => validate('params', schema);

/**
 * Generic validator that also sanitizes inputs to prevent XSS/SQLi.
 *
 * @param location  One of 'body' | 'query' | 'params'.
 * @param schema    A Zod schema describing the expected shape.
 */
function validate(location: 'body' | 'query' | 'params', schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // 1) Sanitize all incoming data (removes scripts, escapes dangerous chars) :contentReference[oaicite:6]{index=6}
      const cleaned = sanitize(req[location]);

      // 2) Validate & optionally coerce types with Zod
      const result = schema.parse(cleaned);

      // 3) Overwrite the request object with the parsed & sanitized data
      req[location] = result;
      next();
    } catch (err) {
      next(err);
    }
  };
}
