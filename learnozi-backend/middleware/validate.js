/**
 * Joi validation middleware factory.
 * Usage: router.post('/route', validate(schema), controller);
 *
 * Strips unknown fields and returns 400 with structured error details.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,        // return ALL errors, not just first
    stripUnknown: true,       // remove fields not in schema
    convert: true,            // coerce types (string → number etc.)
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/"/g, ''),
    }));
    return res.status(400).json({ error: 'Validation failed', details });
  }

  req.body = value; // use sanitized / coerced body
  next();
};

module.exports = validate;
