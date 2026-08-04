import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

type ValidationSource = "body" | "query" | "params";

/**
 * Validates req[source] against a zod schema. On success, req[source] is
 * replaced with the parsed (and type-coerced/trimmed) data. On failure,
 * responds 400 with a field -> messages[] map the frontend can map
 * directly onto form fields.
 */
export function validate(schema: ZodTypeAny, source: ValidationSource = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || source;
        errors[key] = [...(errors[key] ?? []), issue.message];
      }
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
    }

    req[source] = result.data;
    next();
  };
}
