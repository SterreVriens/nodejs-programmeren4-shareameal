const Joi = require('joi');

const mealSchema = Joi.object({
  isActive: Joi.boolean().required(),
  isVega: Joi.boolean().required(),
  isVegan: Joi.boolean().required(),
  isToTakeHome: Joi.boolean().required(),
  dateTime: Joi.date().iso().required(),
  maxAmountOfParticipants: Joi.number().integer().required(),
  price: Joi.number().precision(2).required(),
  imageUrl: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  allergenes: Joi.string().valid('gluten', 'lactose', 'noten').default('')
});

module.exports = mealSchema;
