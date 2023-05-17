const express = require('express');
const router = express.Router();
var logger = require('tracer').console();
const { assert } = require('chai');
const dummyUserData = require('../util/innem-db')

const mealController = require('../controllers/meal.controller')
const authController = require('../controllers/authentication.controller')

//UC - 301 Registreren nieuwe maaltijd
router.post('',
authController.validateToken, mealController.createMeal);
  
//UC - 303 Opvragen lijst met meals
router.get('', mealController.getAllMeals);

//UC - 304 Opvragen maaltijd met id

router.get('/:mealId', mealController.getMealById);

//UC - 305 Verwijderen maaltijd

router.delete('/:mealId',
authController.validateToken, mealController.deleteMeal);

module.exports = router;