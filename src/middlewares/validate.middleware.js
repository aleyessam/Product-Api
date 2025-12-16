module.exports = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: {
          code: "VALIDATION_ERROR",
          details: error.details.map((d) => ({
            field: d.path.join("."),
            message: d.message,
          })),
        },
      });
    }

    req.body = value;
    next();
  };
};
