module.exports = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    error: {
      code: err.code || "INTERNAL_ERROR",
      details: err.details || null,
    },
  });
};
