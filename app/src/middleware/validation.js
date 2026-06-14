const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requiredText(label, options = {}) {
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

export function validEmail(label = "Email") {
  return (value) => {
    const normalized = typeof value === "string" ? value.trim() : "";

    if (normalized.length === 0) {
      return null;
    }

    return emailPattern.test(normalized) ? null : `${label} must be a valid email address.`;
  };
}

export function requiredValue(label, options = {}) {
  const { maxLength = 5000 } = options;

  return (value) => {
    if (typeof value !== "string" || value.length === 0) {
      return `${label} is required.`;
    }

    if (value.length > maxLength) {
      return `${label} must be ${maxLength} characters or fewer.`;
    }

    return null;
  };
}

export function passwordLength(label = "Password", options = {}) {
  const { maxLength = 72, minLength = 8 } = options;

  return (value) => {
    if (typeof value !== "string" || value.length === 0) {
      return null;
    }

    if (value.length < minLength) {
      return `${label} must be at least ${minLength} characters.`;
    }

    if (value.length > maxLength) {
      return `${label} must be ${maxLength} characters or fewer.`;
    }

    return null;
  };
}

export function matchesField(label, otherField, otherLabel) {
  return (value, req) => {
    const currentValue = typeof value === "string" ? value : "";
    const otherValue = typeof req.body?.[otherField] === "string" ? req.body[otherField] : "";

    if (currentValue.length === 0) {
      return null;
    }

    return currentValue === otherValue ? null : `${label} must match ${otherLabel}.`;
  };
}

export function validateRequest(rules) {
  return (req, res, next) => {
    const errors = {};

    for (const [field, validators] of Object.entries(rules)) {
      for (const validator of validators) {
        const message = validator(req.body?.[field], req);

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
