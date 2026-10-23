const fields = ['name', 'email', 'age'];

function validateUser(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Request body must be a JSON object.'] };
  }

  const errors = [];
  const values = {};
  const presentFields = fields.filter((field) =>
    Object.prototype.hasOwnProperty.call(body, field)
  );

  for (const field of Object.keys(body)) {
    if (!fields.includes(field)) {
      errors.push(`Unknown field: ${field}.`);
    }
  }

  if (!partial && (!body.name || !body.email)) {
    errors.push('Name and email are required.');
  } else if (partial && presentFields.length === 0) {
    errors.push('Provide at least one field to update.');
  }

  if (Object.prototype.hasOwnProperty.call(body, 'name')) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.trim().length > 100) {
      errors.push('Name must be a non-empty string of at most 100 characters.');
    } else {
      values.name = body.name.trim();
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'email')) {
    if (
      typeof body.email !== 'string' ||
      body.email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
    ) {
      errors.push('Email must be a valid email address of at most 254 characters.');
    } else {
      values.email = body.email.trim().toLowerCase();
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'age')) {
    if (body.age !== null && (!Number.isInteger(body.age) || body.age < 0 || body.age > 150)) {
      errors.push('Age must be an integer between 0 and 150, or null.');
    } else {
      values.age = body.age;
    }
  }

  return { errors, values };
}

module.exports = { validateUser };
