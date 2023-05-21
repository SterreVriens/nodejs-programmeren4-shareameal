var logger = require('tracer').console();
const { assert } = require('chai');
const dummyUserData = require('../util/innem-db')
const Joi = require('joi');
const userSchema = require('../util/userValidation');
const userUpdateSchema = require('../util/userUpdateValidation');
const pool = require('../util/mysql-db')
let index;

const userController = {

      getAllUsers: function(req, res) {
        logger.info('Get all users');
        const queryField = Object.entries(req.query);
        // Controleren of de filtervelden voorkomen in de gebruikerstabel
        const validFilterFields = ['firstName', 'lastName','isActive','emailAdress','password','phoneNumber','roles','street','city']; 
      
        if (queryField.length === 2) {
          const [field1, value1] = queryField[0];
          const [field2, value2] = queryField[1];
        
          if (validFilterFields.includes(field1) && validFilterFields.includes(field2)) {
            // Uitvoeren van de filterquery
            pool.getConnection(function(err, conn) {
              if (err) {
                logger.error('error ', err);
                return res.status(500).json({
                  status: 500,
                  message: err.code,
                  data:{}
                });
              } else if (conn) {
                conn.query(
                  'SELECT * FROM `user` WHERE ?? = ? AND ?? = ?',
                  [field1, value1, field2, value2],
                  function(err, results, fields) {
                    if (err) {
                      return res.status(500).json({
                        status: 500,
                        message: err.sqlMessage,
                        data:{}
                      });
                      logger.error(err.sqlMessage);
                    }
                    console.log(field1, value1, field2, value2)
                    return res.status(200).json({
                      status: 200,
                      message: 'Get filtered users',
                      data: results
                    });
                    pool.releaseConnection(conn);
                  }
                );
              }
            });
          } else {
            pool.getConnection(function(err, conn) {
              if (err) {
                logger.error('error ', err);
                return res.status(500).json({
                  status: 500,
                  message: err.code,
                  data:{}
                });
              } else if (conn) {
                conn.query('SELECT * FROM `user`', function(err, results, fields) {
                  if (err) {
                    return res.status(500).json({
                      status: 500,
                      message: err.sqlMessage,
                      data:{}
                    });
                    logger.error(err.sqlMessage);
                  }
                  return res.status(200).json({
                    status: 200,
                    message: 'Invalid filter parameters',
                    data: results
                  });
                  pool.releaseConnection(conn);
                });
              }
            });
          }
        } 
        else if (queryField.length === 1) {
          const [field1, value1] = queryField[0];
          if (validFilterFields.includes(field1)) {
            // Uitvoeren van de filterquery
            pool.getConnection(function(err, conn) {
              if (err) {
                logger.error('error ', err);
                return res.status(500).json({
                  status: 500,
                  message: err.code,
                  data:{}
                });
              } else if (conn) {
                conn.query(
                  'SELECT * FROM `user` WHERE ?? = ?',
                  [field1, value1],
                  function(err, results, fields) {
                    if (err) {
                      return res.status(500).json({
                        status: 500,
                        message: err.sqlMessage,
                        data:{}
                      });
                      logger.error(err.sqlMessage);
                    }
                    return res.status(200).json({
                      status: 200,
                      message: 'Get filtered users',
                      data: results
                    });
                    pool.releaseConnection(conn);
                  }
                );
              }
            });
          } else {
            pool.getConnection(function(err, conn) {
              if (err) {
                logger.error('error ', err);
                return res.status(500).json({
                  status: 500,
                  message: err.code,
                  data:{}
                });
              } else if (conn) {
                conn.query('SELECT * FROM `user`', function(err, results, fields) {
                  if (err) {
                    logger.error(err.sqlMessage);
                    return res.status(500).json({
                      status: 500,
                      message: err.sqlMessage,
                      data:{}
                    });
                    
                  }
                  return res.status(200).json({
                    status: 200,
                    message: 'Invalid filter parameters',
                    data: results
                  });
                  
                });
              }
              pool.releaseConnection(conn);
            });
          }
        } 
        else if (queryField.length == 0) {
          pool.getConnection(function(err, conn) {
            if (err) {
              logger.error('error ', err);
              return res.status(500).json({
                status: 500,
                message: err.code,
                data:{}
              });
            } else if (conn) {
              conn.query(
                'SELECT * FROM `user` ',
                function(err, results, fields) {
                  if (err) {
                    return res.status(500).json({
                      status: 500,
                      message: err.sqlMessage,
                      data:{}
                    });
                    logger.error(err.sqlMessage);
                  }
                  return res.status(200).json({
                    status: 200,
                    message: 'Get all users',
                    data: results
                  });
                }
              );
              pool.releaseConnection(conn);
            }
          });
        }
      }
      ,

      createUser: function(req, res) {
        logger.info('201 - Register aangeroepen');
        const user = req.body;
      
        // Check if the user already exists
        pool.getConnection(function(err, conn) {
          if (err) {
            logger.error('error ', err)
            return res.status(500).json({
              status: 500,
              message: err.message,
              data:{}
            });
            return; // Stop de functie hier om te voorkomen dat het antwoord tweemaal wordt verzonden
          }
          if (conn) {
            pool.query('SELECT * FROM `user` WHERE `emailAdress` = ?', [user.emailAdress], function(err, results) {
              if (err) {
                logger.error('Database error: ' + err.message);
                return res.status(500).json({
                  status: 500,
                  message: err.message,
                  data:{}
                });
                return; // Stop de functie hier om te voorkomen dat het antwoord tweemaal wordt verzonden
              }
      
              console.log(results)
              if (results.length > 0) {
                logger.error('Gebruiker kan niet registreren: e-mailadres al in gebruik');
                return res.status(403).json({
                  status: 403,
                  message: 'User with specified email address already exists',
                  data:{}
                });
                return; // Stop de functie hier om te voorkomen dat het antwoord tweemaal wordt verzonden
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
                  return res.status(400).json({
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
                    return res.status(500).json({
                      status: 500,
                      message: err.message,
                      data:{}
                    });
                    return; // Stop de functie hier om te voorkomen dat het antwoord tweemaal wordt verzonden
                  }
      
                  // Return the new user data
                  return res.status(201).json({
                    status: 201,
                    message: 'User created',
                    data: {id:results.insertId, ...newUser}
                  });
                });
              } catch (err) {
                logger.error('User data is niet compleet/correct: ' + err.message.toString());
                return res.status(400).json({
                  status: 400,
                  message: err.message.toString(),
                  data: {}
                });
              }
            });
          }
        });
      }
      , 
      getProfile : function(req, res) {
        const id = req.userId;
        logger.trace('Get user profile for user', id);

        let sqlStatement = 'SELECT * FROM `user` WHERE id=?';

        pool.getConnection(function (err, conn) {
          // Do something with the connection
          if (err) {
            logger.error(err.code, err.syscall, err.address, err.port);
            return res.status(500).json({
              status: 500,
              message: err.code,
              data:{}
            });
          }
          if (conn) {
            conn.query(sqlStatement, [id], (err, results, fields) => {
              if (err) {
                logger.error(err.message);
                return res.status(409).json({
                  status: 409,
                  message: err.message,
                  data:{}
                });
              }
              if (results) {
                logger.trace('Found', results.length, 'results');
                return res.status(200).json({
                  status: 200,
                  message: 'Get User profile',
                  data: results[0]
                });
              }
            });
            pool.releaseConnection(conn);
          }
        });
      },

      getUserById: function(req, res) {
        logger.info('Gebruiker opzoeken door id');
        
        const id = parseInt(req.params.userId);
        
        pool.getConnection(function(err, conn) {
          if(err){
            logger.error('error ', err)
            return res.status(500).json({
              status: 500,
              message: err.message,
              data:{}
            });
          }
          if(conn){
            pool.query('SELECT * FROM `user` WHERE `id` = ?', [id], function(err, results, fields) {
              if (err) {
                logger.error('Database error: ' + err.message);
                return res.status(500).json({
                  status: 500,
                  message: err.message,
                  data:{}
                });
              }
      
              if (results.length === 0) {
                logger.error(`Gebruiker met id ${id} wordt niet gevonden`)
                return res.status(404).json({
                  status: 404,
                  message: `Gebruiker met id ${id} wordt niet gevonden`,
                  data:{}
                });
              } else {
                const user = results[0];
                logger.info('Get user by id endpoint ', err)
                return res.status(200).json({
                  status: 200,
                  message:  `Get user with id ${id}`,
                  data:  results[0]
                });
              }
            });
            pool.releaseConnection(conn);
          }
        });
      },
      
      updateUser: function(req, res) {
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
        const { error, value } = userUpdateSchema.validate(user);
        if (error) {
          logger.error('User data is niet compleet/correct: ' + error.message.toString());
          return res.status(400).json({
            status: 400,
            message: 'User data is niet compleet/correct: ' + error.message.toString(),
            data: {}
          });
        }

        pool.getConnection(function(err, conn) {
          if (err) {
              logger.error('error ', err)
              return res.status(404).json({
                'status': 404,
                'message': 'Connection could not be made -' ,err,
                data:{}
              });
          }
          if (conn) {
            conn.query('SELECT * FROM `user` WHERE `id` = ?', 
            [id], 
            function(err, results, fields) {
              if (err) {
                logger.error('Database error: ' + err.message);
                return res.status(500)
              }
              else{
                if (results.length === 0) {
                  logger.error(`Gebruiker met id ${id} niet gevonden`);
                  return res.status(404).json({
                    status: 404,
                    message: `User with id ${id} not found`,
                    data: {}
                  });
                  
                }
                else{
                  conn.query('UPDATE `user` SET `firstName` = ?, `lastName` = ?, `emailAdress` = ?, `password` = ?, `phoneNumber` = ?, `street` = ?, `city` = ? WHERE `id` = ?', 
                  [user.firstName || results[0].firstName, user.lastName || results[0].lastName, user.emailAdress || results[0].emailAdress, user.password || results[0].password, user.phoneNumber || results[0].phoneNumber, user.street || results[0].street, user.city || results[0].city, id],
                  function(err, results, fields) {
                    if (err) {
                      logger.error('Database error: ' + err.message);
                      return res.status(500).json({
                        status: 500,
                        message: err.message,
                        data:{}
                      });
                    }             
                    // Return the updated user data
                    conn.query('SELECT * FROM `user` WHERE `id` = ?', [id], function(err, results, fields) {
                      if (err) {
                        logger.error('Database error: ' + err.message);
                        return res.status(500).json({
                          status: 500,
                          message: err.message,
                          data:{}
                        });
                      }
            
                      return res.status(200).json({
                        status: 200,
                        message: `User with id ${id} updated`,
                        data: results[0]
                      });
                      
                    });
                  });
                }
              }
              pool.releaseConnection(conn);
            })
          }
        })
      
        
      
        
      
          // Update the user data in the database
          
        
      }    
      ,
      deleteUser: function(req, res) {
        logger.info('206 - Verwijderen van een user')
        const idUser = req.userId;

        const id = parseInt(req.params.userId);
        console.log(id)
        logger.info('206 - Verwijderen van een user 1')
        if(idUser !== id){
          logger.error('error ', `Gebruiker ${idUser} is niet de eigenaar van gebruiker ${id}`)
                return res.status(403).json({
                  'status': 403,
                  'message': `Gebruiker ${idUser} is niet de eigenaar van gebruiker ${id}` ,
                  data:{}
                });
        }
        else{
          pool.getConnection(function(err, conn) {
            logger.info('206 - Verwijderen van een user 3')
              if (err) {
                  logger.error('error ', err)
                  return res.status(404).json({
                    'status': 404,
                    'message': 'Connection could not be made -' ,err,
                    data:{}
                  });
              }
              if (conn) {
                conn.query('SELECT * FROM `user` WHERE `id` = ?', [id], function(err, results, fields) {
                  if (err) {
                    logger.error('Database error: ' + err.message);
                    return res.status(500)
                  }
          
                  if (results.length === 0) {
                    logger.error(`Gebruiker met id ${id} wordt niet gevonden`)
                    return  res.status(404).json({
                      status: 404,
                      message: 'User not found',
                      data: {}
                    });
                  } else {
                    conn.query('DELETE FROM `user` WHERE `id` = ?', [id], function(err, results, fields) {
                      if (err) {
                        logger.error('Database error: ' + err.message);
                        return  res.status(200).json({
                          status: 404,
                          message: `Database error `,
                          data:{}
                        });
                      } else {
                        return  res.status(200).json({
                          status: 200,
                          message: `User met ID ${id} is verwijderd`,
                          data:{}
                        });
                      }
                    });
                  }
                });
                
              }
              pool.releaseConnection(conn);
          });
        }
    }
    
}


module.exports = userController;

