var logger = require('tracer').console();
const { assert } = require('chai');
const dummyUserData = require('../util/innem-db')
const Joi = require('joi');
//const userSchema = require('../util/validation');
const pool = require('../util/mysql-db');
const mealSchema = require('../util/mealValidations');

const mealController = {

    //UC - 301
    createMeal: function(req, res, next) {
        logger.info('301 - Aanmaken maaltijd aangeroepen');
        const meal = req.body;
        const id = req.userId;

        pool.getConnection(function(err, conn) {
            if (err) {
                logger.error('error ', err);

                return res.status(500)
            } else if (conn) {
                // Validate meal data against the validation schema
                const { error, value } = mealSchema.validate(meal);
                if (error) {
                  logger.error(error.sqlMessage);
                    return res.status(400).json({
                        status: 400,
                        message: error.message,
                        data: {}
                    });     
                }
                const dateTime = new Date(meal.dateTime).toISOString().slice(0, 19).replace('T', ' ');

                pool.query('INSERT INTO `meal`(`isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `name`, `description`, `allergenes`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
                [meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, id, meal.name, meal.description, meal.allergenes],
                function(err, results, fields) {
                    if (err) {
                      logger.error(err.sqlMessage);
                        return res.status(500).json({
                            status: 500,
                            message: err.sqlMessage,
                            data:{}
                        });
                        
                        
                    }
                    //Haalt het geïnjecteerde maaltijd-ID op uit de queryresultaten
                    //De results is het resultaat van de query die wordt uitgevoerd met pool.query. 
                    //De insertId is een eigenschap van het results-object die het automatisch gegenereerde ID van de zojuist ingevoegde rij in de database bevat. 
                    //Door results.insertId toe te wijzen aan de variabele insertedMealId, kun je het ID gebruiken voor verdere verwerking of om te tonen in de responspayload.
                    const insertedMealId = results.insertId;
                    const completeMeal = {mealId:insertedMealId,meal}
                    return res.status(201).json({
                        status: 201,
                        message: 'Create meals',
                        data:  {id:results.insertId, ...completeMeal}
                    });
                    }
                );
                pool.releaseConnection(conn);
            }
        
        })
    },
    //UC - 303
    getAllMeals: function(req, res) {
        logger.info('Get all meals');
        pool.getConnection(function(err, conn) {
            if (err) {
                logger.error('error ', err);
                return res.status(500)
            } else if (conn) {
                conn.query(
                'SELECT * FROM `meal` ',
                function(err, results, fields) {
                    if (err) {
                        return res.status(500).json({
                            status: 500,
                            message: err.sqlMessage,
                            data: {}
                        });
                        logger.error(err.sqlMessage);
                        return res.status(500)
                    }
                    return res.status(200).json({
                        status: 200,
                        message: 'Get all meals',
                        data: results
                    });
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    },
    //UC - 304
    getMealById: function(req, res) {
        logger.info('Maaltijd opzoeken door id');
        
        const id = parseInt(req.params.mealId);
        
        pool.getConnection(function(err, conn) {
          if(err){
            logger.error('error ', err)
            return res.status(500)
          }
          if(conn){
            pool.query('SELECT * FROM `meal` WHERE `id` = ?', 
            [id], 
            function(err, results, fields) {
              if (err) {
                logger.error('Database error: ' + err.message);
                return res.status(500)
              }
      
              if (results.length === 0) {
                logger.error(`Maaltijd met id ${id} wordt niet gevonden`)
                return  res.status(404).json({
                  status: 404,
                  message: `Maaltijd met id ${id} wordt niet gevonden`,
                  data: {}
                });
              } else {
                const meal = results[0];
                return  res.status(200).json({
                  status: 200,
                  message: `Get meal with id ${id}`,
                  data: meal
                });
              }
            });
          }
        });
      },

    //UC - 305
    deleteMeal: function(req, res) {
        logger.info('Maaltijd verwijderen door id');
        const cookId = parseInt(req.userId);
        const mealId = parseInt(req.params.mealId);
      
        pool.getConnection(function(err, conn) {
          if (err) {
            logger.error('error ', err);
            return res.status(500)
          } else if (conn) {
            pool.query('SELECT * FROM `meal` WHERE `id` = ?', [mealId], function(err, results, fields) {
              if (err) {
                logger.error('Database error: ' + err.message);
                return res.status(500)
              }
      
              if (results.length === 0) {
                logger.error(`Maaltijd met id ${mealId} wordt niet gevonden`);
                return res.status(404).json({
                  status: 404,
                  message: `Maaltijd met id ${mealId} wordt niet gevonden`,
                  data: {}
                });
              } else {
                pool.query('SELECT * FROM `meal` WHERE `cookId` = ? AND `id` = ?', [cookId, mealId], function(err, results, fields) {
                  if (results.length === 0) {
                    logger.error(`Maaltijd met id ${mealId} is niet van gebruiker ${cookId}`);
                    return res.status(403).json({
                      status: 403,
                      message: `Maaltijd met id ${mealId} is niet van gebruiker ${cookId}`,
                      data: {}
                    });
                  } else {
                    pool.query('DELETE FROM `meal` WHERE `id` = ?', [mealId], function(err, results, fields) {
                      if (err) {
                        logger.error('Database error: ' + err.message);
                        return res.status(500)
                      }
                      logger.info(`Maaltijd met id ${mealId} is verwijderd`);
                      return res.status(200).json({
                        status: 200,
                        message: `Maaltijd met ID ${mealId} is verwijderd`,
                        data: {}
                      });
                    });
                  }
                });
              }
            });
            pool.releaseConnection(conn);
          }
        });
      },
      

}
     

module.exports = mealController;