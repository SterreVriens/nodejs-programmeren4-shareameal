const express = require('express');
const router = express.Router();
var logger = require('tracer').console();
const { assert } = require('chai');
const dummyUserData = require('../util/database')

const userController = require('../controllers/user.controller')

//UC-201 Registreren als nieuwe user
router.post('', userController.createUser);
  
//UC-202 Opvragen lijst met user
router.get('', userController.getAllUsers);
  
//UC-203 Opvragen van gebruikersprofiel
router.get('/profile', userController.getProfile);
  
  
//UC-204 Opvragen van usergegevens bij ID
router.get('/:userId', userController.getUserById);
  
//UC-205 Wijzigen van usergegevens
router.put('/:userid', userController.updateUser)
  
  //UC-206 Verwijderen van user
  router.delete('/:userid', userController.deleteUser );


module.exports = router;