var logger = require('tracer').console();
const { assert } = require('chai');
const dummyUserData = require('../util/database')

const userController = {

    getAllUsers : function(req, res){
        let filteredData = dummyUserData;
        logger.log('202 - Haal een lijst op met users');
        if (req.query.field1 && req.query.value1) {
          filteredData = filteredData.filter(user => user[req.query.field1] === req.query.value1);
        }
        if (req.query.field2 && req.query.value2) {
          filteredData = filteredData.filter(user => user[req.query.field2] === req.query.value2);
        }
        res.status(200).json({
          'status': 200,
          'message': 'Get all users',
          'data': filteredData
        });
      },

    createUser : function(req, res) {
        logger.info('201 - Register aangeroepen')
        let email = req.body.email;
        let exists = dummyUserData.some(user => user.email === email);
        const user = req.body;
        let result = {};
      
        if(exists) {
          logger.error('Gebruiker kan niet registreren')
          result.status = 400;
          result.message = 'User with specified email address already exists';
          result.data = {};
          res.status(400).json(result);
          return;
        }
      
        try {
          assert(typeof user.firstName === 'string', 'firstName must be a string');
          assert(typeof user.lastName === 'string', 'lastname must be a string')
          assert(typeof email === 'string','emailAddress must be a string');
          assert(typeof user.street === 'string', 'street must be a string');
          assert(typeof user.city === 'string', 'city must be a string');
          assert(typeof user.password === 'string', 'password must be a string');
          assert(typeof user.phoneNumber === 'string', 'phonenumber must be a string');
      
      
          const newUser = {
            'firstName': req.body.firstName,
            'lastName': req.body.lastName,
            'street': req.body.street,
            'city': req.body.city,
            'email': email,
            'password': req.body.password,
            'phoneNumber': req.body.phoneNumber
          };
          dummyUserData.push(newUser);
    
          res.status(201).json({
            'status': 201,
            'message': 'User created',
            'data' : newUser
          });
        } catch (err) {
          // Als één van de asserts failt sturen we een error response.
          logger.error('user data is niet compleet/correct')
          res.status(400).json({
            status: 400,
            message: err.message.toString(),
            data: {}
          });
          // Nodejs is asynchroon. We willen niet dat de applicatie verder gaat
          // wanneer er al een response is teruggestuurd.
          return;
        }
      },
    
    getProfile : function(req, res) {
        logger.info('203 - Opvragen van gebruiker profiel')
        const authHeader = req.headers['Authorization'] || req.headers['authorization'];
      
        if (!authHeader) {
          return res.status(401).json({
            'status': 401,
            'message': 'Authorization header missing'
          });
        }
      
        const userData = dummyUserData.find(user => user.token === authHeader);
      
        if (!userData) {
          logger.error(`Gebruiker met token ${authHeader} is niet gevonden`)
          return res.status(404).json({
            'status': 404,
            'message': 'User not found'
          });
        }
      
        return res.status(200).json({
          'status': 200,
          'message': `Get user profile for user with token ${authHeader}`,
          'data': userData
        });
      },

    getUserById : function(req, res) {
        logger.info('Gebruiker opzoeken door id');
      
        const id = parseInt(req.params.userId);
        const user = dummyUserData.find(user => user.id === id);
      
        if (!user) {
          logger.error(`Gebruiker met id ${id} wordt niet gevonden`)
          return res.status(404).json({
            'status': 404,
            'message': 'User not found'
          });
        } else {
          return res.status(200).json({
            'status': 200,
            'message': `Get user with id ${id}`,
            'data': user
          });
        }
      },
      
    updateUser : function(req, res){
        logger.info('205 - Wijzigen van een user')
      
        const id = parseInt(req.params.userid);
        const user = dummyUserData.find(user => user.id === id);
      
        if (!user) {
          res.status(404).json({ message: `User with id ${id} not found` });
          logger.error('Gebruiker is niet gevonden');
          return;
        }
      
        const userFirst = req.body['firstname'];
        const userLast = req.body['lastname'];
        const userStreet = req.body['street'];
        const userCity = req.body['city'];
        const userEmail = req.body['email'];
        const userPassword = req.body['password'];
        const userPhonenumer = req.body['phoneNumber'];
        const userToken = req.body['token'];
      
        user.firstName = userFirst || user.firstName;
        user.lastName = userLast || user.lastName;
        user.street = userStreet || user.street;
        user.city = userCity || user.city;
        user.email = userEmail || user.email;
        user.password = userPassword || user.password;
        user.phoneNumber = userPhonenumer || user.phoneNumber;
        user.token = userToken || user.token;
      
        return res.status(200).json({
          'status': 200,
          'message': `User is updated`,
          'data': user
      });
      },

    deleteUser : function(req, res){
        logger.info('206 - Verwijderen van een user')
        const userId = parseInt(req.params.userid);
        //findIdex geeft het eerste item terug met een overeenkomst
        const userIndex = dummyUserData.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
          dummyUserData.splice(userIndex, 1);
          console.log(req.params.userid + userIndex)
          return res.status(202).json({
            'status': 202,
            'message': `User is deleted`,
            'data': dummyUserData})
        } else {
          logger.error(`Gebruiker met id ${userId} wordt niet gevonden`);
          return res.status(404).json({
            'status': 404,
            'message': 'User cannot be deleted'
          });
        }
      }
}

module.exports = userController;