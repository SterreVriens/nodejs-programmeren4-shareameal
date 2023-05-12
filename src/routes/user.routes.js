const express = require('express');
const router = express.Router();
var logger = require('tracer').console();
const { assert } = require('chai');
const dummyUserData = require('../util/innem-db')

const userController = require('../controllers/user.controller')
const authController = require('../controllers/authentication.controller')

//UC-201 Registreren als nieuwe user
router.post('', userController.createUser);
  
//UC-202 Opvragen lijst met user
router.get('', userController.getAllUsers);
  
//UC-203 Opvragen van gebruikersprofiel
router.get('/profile',
  authController.validateToken,
  userController.getProfile);
  
  
//UC-204 Opvragen van usergegevens bij ID
router.get('/:userId', userController.getUserById);
  
//UC-205 Wijzigen van usergegevens
router.put('/:userId', userController.updateUser)
  
  //UC-206 Verwijderen van user
  router.delete('/:userId', userController.deleteUser );


module.exports = router;