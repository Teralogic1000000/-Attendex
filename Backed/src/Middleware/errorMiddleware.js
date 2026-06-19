export default function errorHandler(err, req, res, next) {
  // Log detailed error on backend for debugging
  console.error('🔴 Error caught:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.status || 500
  });

  // Send response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
}