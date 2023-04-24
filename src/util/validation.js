const Joi = require('joi');

const userSchema = Joi.object({
  id: Joi.number().integer().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  isActive: Joi.boolean().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phoneNumber: Joi.string().pattern(/^[0-9]{9}$/).required(),
  token: Joi.string().required()
});

module.exports = userSchema;
