var logger = require('tracer').console();
const { assert } = require('chai');
const dummyUserData = require('../util/innem-db')
const Joi = require('joi');
const userSchema = require('../util/userValidation');
const pool = require('../util/mysql-db')
let index;

const userController = {

      //Filter nog werkend maken
      getAllUsers: function(req, res, next) {
        logger.info('Get all users');
        const queryField = Object.entries(req.query);
      
        if (queryField.length == 2) {
          // do something
        } else if (queryField.length == 1) {
          // do something else
        } else if (queryField.length == 0) {
          pool.getConnection(function(err, conn) {
            if (err) {
              logger.error('error ', err);
              next(err.message);
            } else if (conn) {
              conn.query(
                'SELECT * FROM `user` ',
                function(err, results, fields) {
                  if (err) {
                    res.status(500).json({
                      statusCode: 500,
                      message: err.sqlMessage
                    });
                    logger.error(err.sqlMessage);
                    next(err.message);
                  }
                  res.status(200).json({
                    'status': 200,
                    'message': 'Get all users',
                    'data': results
                  });
                }
              );
              pool.releaseConnection(conn);
            }
          });
        }
      }
      ,

      createUser: function(req, res, next) {
        logger.info('201 - Register aangeroepen');
        const user = req.body;
        let userIndex;
      
        // Check if the user already exists
        pool.getConnection(function(err, conn) {
          if(err){
            logger.error('error ', err)
            next(err.message)
          }
          if(conn){
            pool.query('SELECT * FROM `user` WHERE `emailAdress` = ?', 
            [user.emailAdress], 
            function(err, results, fields) {
              if (err) {
                logger.error('Database error: ' + err.message);
                return next(err.message);
              }
              console.log(results)
              if (results.length > 0) {
                logger.error('Gebruiker kan niet registreren: e-mailadres al in gebruik');
                return res.status(403).json({
                  status: 403,
                  message: 'User with specified email address already exists',
                  data: {}
                });
              }

                // Continue with user registration if email address is available
                try {
                  const newUser = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailAdress: user.emailAdress,
                    password: user.password,
                    phoneNumber: user.phoneNumber,
                    street: user.street,
                    city: user.city
                  };
                // Validate user data against the validation schema
                const { error, value } = userSchema.validate(newUser);
                if (error) {
                  res.status(400).json({
                    status: 400,
                    message: 'User data is not complete',
                    data: error.message
                  });
                }
      
                // Insert the new user into the database
                pool.query('INSERT INTO `user`(`firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `street`, `city`) VALUES (?,?,?,?,?,?,?)', 
                [newUser.firstName, newUser.lastName, newUser.emailAdress, newUser.password, newUser.phoneNumber, newUser.street, newUser.city],
                function(err, results, fields) {
                  if (err) {
                    logger.error('Database error: ' + err.message);
                    return next(err.message);
                  }
      
                  // Return the new user data
                  res.status(201).json({
                    status: 201,
                    message: 'User created',
                    data: newUser
                  });
                });
              } catch (err) {
                logger.error('User data is niet compleet/correct: ' + err.message.toString());
                res.status(400).json({
                  status: 400,
                  message: err.message.toString(),
                  data: {}
                });
                return;
              }

            });
          }
        });
      }, 
      getProfile : function(req, res,next) {
        const id = req.userId;
        logger.trace('Get user profile for user', id);

        let sqlStatement = 'SELECT * FROM `user` WHERE id=?';

        pool.getConnection(function (err, conn) {
          // Do something with the connection
          if (err) {
            logger.error(err.code, err.syscall, err.address, err.port);
            next({
              code: 500,
              message: err.code
            });
          }
          if (conn) {
            conn.query(sqlStatement, [id], (err, results, fields) => {
              if (err) {
                logger.error(err.message);
                next({
                  code: 409,
                  message: err.message
                });
              }
              if (results) {
                logger.trace('Found', results.length, 'results');
                res.status(200).json({
                  code: 200,
                  message: 'Get User profile',
                  data: results[0]
                });
              }
            });
            pool.releaseConnection(conn);
          }
        });
      },

      getUserById: function(req, res, next) {
        logger.info('Gebruiker opzoeken door id');
        
        const id = parseInt(req.params.userId);
        
        pool.getConnection(function(err, conn) {
          if(err){
            logger.error('error ', err)
            next(err.message)
          }
          if(conn){
            pool.query('SELECT * FROM `user` WHERE `id` = ?', [id], function(err, results, fields) {
              if (err) {
                logger.error('Database error: ' + err.message);
                return next(err.message);
              }
      
              if (results.length === 0) {
                logger.error(`Gebruiker met id ${id} wordt niet gevonden`)
                return res.status(404).json({
                  'status': 404,
                  'message': `Gebruiker met id ${id} wordt niet gevonden`
                });
              } else {
                const user = results[0];
                return res.status(200).json({
                  'status': 200,
                  'message': `Get user with id ${id}`,
                  'data': user
                });
              }
            });
          }
        });
      },
      
      updateUser: function(req, res, next) {
        logger.info('205 - Wijzigen van een user')
      
        const id = (req.params.userId);
        const user = {
          firstName: req.body['firstName'],
          lastName: req.body['lastName'],
          street: req.body['street'],
          city: req.body['city'],
          emailAdress: req.body['emailAdress'],
          password: req.body['password'],
          phoneNumber: req.body['phoneNumber'],
        };
      
        // Validate user data against the validation schema
        const { error, value } = userSchema.validate(user);
        if (error) {
          logger.error('User data is niet compleet/correct: ' + error.message.toString());
          res.status(400).json({
            status: 400,
            message: 'User data is niet compleet/correct: ' + error.message.toString(),
            data: {}
          });
          return;
        }
      
        // Check if the user exists
        pool.query('SELECT * FROM `user` WHERE `id` = ?', [id], function(err, results, fields) {
          if (err) {
            logger.error('Database error: ' + err.message);
            return next(err.message);
          }
      
          if (results.length === 0) {
            logger.error(`Gebruiker met id ${id} niet gevonden`);
            res.status(404).json({
              status: 404,
              message: `User with id ${id} not found`,
              data: {}
            });
            return;
          }
      
          // Update the user data in the database
          pool.query('UPDATE `user` SET `firstName` = ?, `lastName` = ?, `emailAdress` = ?, `password` = ?, `phoneNumber` = ?, `street` = ?, `city` = ? WHERE `id` = ?', 
          [user.firstName, user.lastName, user.emailAdress, user.password, user.phoneNumber, user.street, user.city, id],
          function(err, results, fields) {
            if (err) {
              logger.error('Database error: ' + err.message);
              return next(err.message);
            }
      
            // Return the updated user data
            pool.query('SELECT * FROM `user` WHERE `id` = ?', [id], function(err, results, fields) {
              if (err) {
                logger.error('Database error: ' + err.message);
                return next(err.message);
              }
        
              res.status(200).json({
                status: 200,
                message: `User with id ${id} updated`,
                data: results[0]
              });
            });
          });
        });
      }    
      ,
      deleteUser: function(req, res) {
        logger.info('206 - Verwijderen van een user')

        const id = parseInt(req.params.userId);
        
    
        pool.getConnection(function(err, conn) {
            if (err) {
                logger.error('error ', err)
                return res.status(404).json({
                  'status': 404,
                  'message': 'Connection could not be made -' ,err
                });
            }
            if (conn) {
              pool.query('SELECT * FROM `user` WHERE `id` = ?', [id], function(err, results, fields) {
                if (err) {
                  logger.error('Database error: ' + err.message);
                  return next(err.message);
                }
        
                if (results.length === 0) {
                  logger.error(`Gebruiker met id ${id} wordt niet gevonden`)
                  return res.status(404).json({
                    'status': 404,
                    'message': 'User not found',
                    'data': {}
                  });
                } else {
                  pool.query('DELETE FROM `user` WHERE `id` = ?', [id], function(err, results, fields) {
                    if (err) {
                      logger.error('Database error: ' + err.message);
                      return res.status(200).json({
                        'status': 404,
                        'message': `Database error `
                      });
                    } else {
                      return res.status(200).json({
                        'status': 200,
                        'message': `User met ID ${id} is verwijderd`,
                      });
                    }
                  });
                }
              });
              pool.releaseConnection(conn);
            }
        });
    }
    
}


module.exports = userController;

