const Joi = require('joi');

const userSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  street: Joi.string(),
  city: Joi.string(),
  emailAdress: Joi.string().email().required(),
  password: Joi.string().required(),
  phoneNumber: Joi.string().pattern(/^[0-9]{9}$/)
});

module.exports = userSchema;
