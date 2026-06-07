const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requiredText(field, label, options = {}) {
  const { maxLength = 5000, minLength = 1 } = options;

  return (value) => {
    const normalized = typeof value === "string" ? value.trim() : "";

    if (normalized.length < minLength) {
      return `${label} is required.`;
    }

    if (normalized.length > maxLength) {
      return `${label} must be ${maxLength} characters or fewer.`;
    }

    return null;
  };
}

export function validEmail(field, label = "Email") {
  return (value) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    return emailPattern.test(normalized) ? null : `${label} must be a valid email address.`;
  };
}

export function validateRequest(rules) {
  return (req, res, next) => {
    const errors = {};

    for (const [field, validators] of Object.entries(rules)) {
      for (const validator of validators) {
        const message = validator(req.body?.[field]);

        if (message) {
          errors[field] ||= [];
          errors[field].push(message);
        }
      }
    }

    req.validationErrors = errors;
    next();
  };
}
