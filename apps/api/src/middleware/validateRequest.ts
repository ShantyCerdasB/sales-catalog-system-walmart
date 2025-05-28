import { AnyZodObject, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import pes from 'perfect-express-sanitizer';          /* note the default import */

/* Convenience wrappers */
export const validateBody   = (schema: AnyZodObject) => validate('body',   schema);
export const validateQuery  = (schema: AnyZodObject) => validate('query',  schema);
export const validateParams = (schema: AnyZodObject) => validate('params', schema);

/* Core validator */
function validate(
  location: 'body' | 'query' | 'params',
  schema: ZodSchema,
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      /* 1 ·  Deep-copy and scrub input.
         The helper recurses objects and arrays, removing scripts and the usual
         injection vectors.  SQL/NoSQL flags left false—Prisma handles that.   */
      const cleaned = pes.sanitize.prepareSanitize(
        req[location],
        { xss: true }
      );

      /* 2 ·  Validate + coerce types. */
      const parsed = schema.parse(cleaned);

      /* 3 ·  Replace the original payload so downstream code sees safe data. */
      req[location] = parsed as typeof req[typeof location];
      next();
    } catch (err) {
      next(err);
    }
  };
}
