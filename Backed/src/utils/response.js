export const successResponse = (res, message, data = null, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message, status = 500, details = null) => {
  const response = {
    success: false,
    message
  };

  // Add details if provided
  if (details) {
    response.details = details;
  }

  return res.status(status).json(response);
};