const Joi = require('joi');

const userSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  street: Joi.string(),
  city: Joi.string(),
  emailAdress: Joi.string()
  .email()
  .required(),
  password: Joi.string()
  .min(8)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
  .required(),
  phoneNumber: Joi.string()
  .pattern(/^06[-\s]?\d{8}$/)
  .required()

});

module.exports = userSchema;
