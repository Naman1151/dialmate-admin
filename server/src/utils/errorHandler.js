// src/utils/errorHandler.js
export const handleError = (res, error, message = 'Something went wrong') => {
    console.error(error);
    return res.status(500).json({
      success: false,
      message,
      error: error?.message || error,
    });
  };  