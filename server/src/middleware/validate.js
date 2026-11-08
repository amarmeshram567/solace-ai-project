// Validates req.body against a Zod schema and replaces it with the parsed,
// trimmed, normalised value. Failures are forwarded to errorHandler as ZodError.
export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body ?? {});
    next();
  } catch (err) {
    next(err);
  }
};
