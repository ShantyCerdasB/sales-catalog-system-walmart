import { AnyZodObject, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import pes from 'perfect-express-sanitizer';

/** Validate JSON request body against a Zod schema */
export const validateBody   = (schema: AnyZodObject) => validate('body',   schema);
/** Validate query-string against a Zod schema */
export const validateQuery  = (schema: AnyZodObject) => validate('query',  schema);
/** Validate route parameters against a Zod schema */
export const validateParams = (schema: AnyZodObject) => validate('params', schema);

/**
 * Core validator factory
 * - Logs the incoming payload
 * - Sanitizes input with XSS protection
 * - Parses & coerces through Zod
 * - Merges validated data back into req[location]
 */
function validate(
  location: 'body' | 'query' | 'params',
  schema: ZodSchema,
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    console.log(`[validate] entering validation for ${location}:`, req[location]);
    try {
      // 1. Deep-copy and scrub against XSS
      const cleaned = pes.sanitize.prepareSanitize(req[location], { xss: true });
      console.log(`[validate] cleaned ${location}:`, cleaned);

      // 2. Validate + coerce types
      const parsed = schema.parse(cleaned);
      console.log(`[validate] parsed ${location}:`, parsed);

      // 3. Merge validated data back into req[location]
      //    Avoid replacing the entire object if it's read-only
      Object.assign(req[location], parsed);

      return next();
    } catch (err) {
      console.error(`[validate] error in validation for ${location}:`, err);
      return next(err);
    }
  };
}
