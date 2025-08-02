/**
 * Parse backend validation errors and format them for frontend
 * @param {Object} error - Error object from API response
 * @returns {Object} Formatted errors object for form display
 */
export const parseValidationErrors = (error) => {
  const formattedErrors = {};

  // Check if error has response data with validation errors
  if (
    error.response?.data?.errors &&
    Array.isArray(error.response.data.errors)
  ) {
    error.response.data.errors.forEach((validationError) => {
      if (validationError.field && validationError.message) {
        formattedErrors[validationError.field] = validationError.message;
      }
    });
  }

  return formattedErrors;
};

/**
 * Get user-friendly error message from API error
 * @param {Object} error - Error object from API response
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Check for custom message from backend
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Check for standard error message
  if (error.message) {
    return error.message;
  }

  // Default fallback
  return "Có lỗi xảy ra, vui lòng thử lại";
};

/**
 * Check if error contains specific validation errors
 * @param {Object} error - Error object from API response
 * @returns {boolean} True if error contains validation errors
 */
export const hasValidationErrors = (error) => {
  return (
    error.response?.data?.errors && Array.isArray(error.response.data.errors)
  );
};

/**
 * Handle password change specific errors
 * @param {Object} error - Error object from API response
 * @returns {Object} Object with { hasFieldErrors: boolean, fieldErrors: Object, generalMessage: string }
 */
export const handlePasswordChangeError = (error) => {
  const fieldErrors = parseValidationErrors(error);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  // Handle specific error cases
  if (
    error.message?.includes("hiện tại không đúng") ||
    error.response?.data?.message?.includes("hiện tại không đúng")
  ) {
    fieldErrors.currentPassword = "Mật khẩu hiện tại không đúng";
  }

  const generalMessage = hasFieldErrors ? null : getErrorMessage(error);

  return {
    hasFieldErrors,
    fieldErrors,
    generalMessage,
  };
};
