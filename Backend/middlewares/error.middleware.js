const ApiResponse = require("../utils/ApiResponse");

// Global error handling middleware for handling both Operational and Programming errors
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Something went wrong";

  // Development vs Production error response logic can be added here
  const response = {
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);
  
  res.status(err.statusCode).json(response);
};
