/**
 * Validates password requirements
 * @param {string} password - Password to validate
 * @returns {string[]} Array of error messages
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push("Ít nhất 6 ký tự");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Ít nhất 1 chữ thường");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Ít nhất 1 chữ hoa");
  }

  if (!/\d/.test(password)) {
    errors.push("Ít nhất 1 chữ số");
  }



  return errors;
};

/**
 * Calculates password strength
 * @param {string} password - Password to analyze
 * @returns {Object} Strength information with strength level, label, color, and width
 */
export const getPasswordStrength = (password) => {
  if (password.length === 0)
    return {
      strength: 0,
      label: "",
      color: "",
      width: "0%",
    };

  let score = 0;

  // Length scoring
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;

  // Character type scoring
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;



  // Return strength classification
  if (score <= 2) {
    return {
      strength: 1,
      label: "Yếu",
      color: "bg-red-500",
      width: "33%",
    };
  }

  if (score <= 4) {
    return {
      strength: 2,
      label: "Trung bình",
      color: "bg-yellow-500",
      width: "66%",
    };
  }

  return {
    strength: 3,
    label: "Mạnh",
    color: "bg-green-500",
    width: "100%",
  };
};

/**
 * Checks if password meets minimum requirements
 * @param {string} password - Password to check
 * @returns {boolean} True if password meets requirements
 */
export const isPasswordValid = (password) => {
  return validatePassword(password).length === 0;
};

/**
 * Gets password requirement status for UI display
 * @param {string} password - Password to check
 * @returns {Object} Requirements with their status
 */
export const getPasswordRequirements = (password) => {
  return {
    length: password.length >= 6,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  };
};
