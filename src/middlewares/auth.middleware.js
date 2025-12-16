module.exports = (requiredRole = null) => {
  return (req, res, next) => {
    const roleHeader = req.headers["x-user-role"];

    if (!roleHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: {
          code: "UNAUTHORIZED",
          details: "X-User-Role header is missing",
        },
      });
    }

    const role = roleHeader.toLowerCase();

    if (!["admin", "user"].includes(role)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: {
          code: "UNAUTHORIZED",
          details: "Invalid role value",
        },
      });
    }

    req.userRole = role;

    if (requiredRole && role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
        error: {
          code: "FORBIDDEN",
          details: `${requiredRole} role required`,
        },
      });
    }

    next();
  };
};
