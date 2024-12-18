export const validateParams = (type, params) => {
  const schemas = {
    addAsset: {
      crypto_id: { type: "string", required: true },
      quantity: { type: "number", required: true, min: 0 },
    },
    updateAsset: {
      crypto_id: { type: "string", required: true },
      quantity: { type: "number", required: true, min: 0 },
    },
    removeAsset: {
      crypto_id: { type: "string", required: true },
    },
    cryptoMarket: {
      vs_currency: { type: "string", required: true },
      order: { type: "string", required: true },
      per_page: { type: "number", required: true, min: 1 },
      page: { type: "number", required: true, min: 1 },
    },
    cryptoPriceById: {
      cryptoId: { type: "string", required: true },
      currency: { type: "string", required: false, default: "usd" },
    },
    signUp: {
      email: { type: "string", required: true, format: "email" },
      password: { type: "string", required: true, minLength: 8 },
    },
    signInWithPassword: {
      email: { type: "string", required: true, format: "email" },
      password: { type: "string", required: true },
    },
    resetPassword: {
      email: { type: "string", required: true, format: "email" },
    },
    updatePassword: {
      password: { type: "string", required: true, minLength: 8 },
    },
    checkAuth: {
      accessToken: { type: "string", required: true },
      refreshToken: { type: "string", required: true },
    },
  };

  const schema = schemas[type];
  if (!schema) {
    throw new Error(
      `Invalid type "${type}". Supported types: ${Object.keys(schemas).join(
        ", "
      )}`
    );
  }

  const validatedParams = { ...params };

  Object.entries(schema).forEach(([key, rules]) => {
    const value = params[key];

    // Check required fields
    if (rules.required && (value === undefined || value === null)) {
      throw new Error(`Missing required parameter: ${key}`);
    }

    // Apply default value if provided and value is undefined
    if (value === undefined && "default" in rules) {
      validatedParams[key] = rules.default;
    }

    // Type checking
    if (value !== undefined && typeof value !== rules.type) {
      throw new Error(`Invalid: ${key} must be of type ${rules.type}.`);
    }

    // Additional constraints
    if (rules.type === "number" && "min" in rules && value < rules.min) {
      throw new Error(`Invalid: ${key} must be at least ${rules.min}.`);
    }

    if (rules.type === "number" && "max" in rules && value > rules.max) {
      throw new Error(`Invalid: ${key} must not exceed ${rules.max}.`);
    }

    if (
      rules.type === "string" &&
      "minLength" in rules &&
      value.length < rules.minLength
    ) {
      throw new Error(
        `Invalid: ${key} must be at least ${rules.minLength} characters long.`
      );
    }

    if (
      rules.type === "string" &&
      "format" in rules &&
      rules.format === "email"
    ) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error(`Invalid: ${key} must be a valid email address.`);
      }
    }
  });

  return validatedParams;
};
