//
// Authentication controller
//
const assert = require('assert');
const jwt = require('jsonwebtoken');
const pool = require('../util/mysql-db');
const { logger, jwtSecretKey } = require('../util/util');
const { userInfo } = require('os');

module.exports = {
  /**
   * login
   * Retourneer een geldig token indien succesvol
   */
  login(req, res, next) {
    pool.getConnection((err, conn) => {
      if (err) {
        logger.error('Error getting connection from pool');
        next({
          code: 500,
          message: err.code
        });
      }
      if (conn) {
        conn.query(
            'SELECT * FROM `user` WHERE `emailAdress` = ?',
            [req.body.emailAdress],
            function(err, results, fields) {
                if (err) {
                    logger.error(err.sqlMessage);
                    next({
                        code:409,
                        message: err.message
                    })
                  }
                else if(results){
                    logger.info('Found', results.lenght, 'results')

                    if(results[0].password === req.body.password && results.length === 1){

                        const {password,id, ...userInfo}= results[0]
                        //de data die je meegeeft bij het token
                        const payload ={
                            userId : results[0].id
                        }
                        //Token genereren

                        jwt.sign(payload,jwtSecretKey,
                            {expiresIn: '2d'}, 
                            (err, token)=> {
                                if(token){
                                    res.status(200).json({
                                        code: 200,
                                        message: 'Login endpoint',
                                        data: {
                                            id,
                                            ...userInfo,
                                            token
                                        }
                                    })
                                }
                            }
                        )
                    }else{
                        //Error
                        next({
                            code:401,
                            message: 'Not authorized',
                            data: undefined
                        })
                    }
                }    
                }
        );
        pool.releaseConnection(conn);
      }
    });
  },

  /**
   * Validatie functie voor /api/login,
   * valideert of de vereiste body aanwezig is.
   */
  validateLogin(req, res, next) {
    // Verify that we receive the expected input
    try {
      assert(
        typeof req.body.emailAdress === 'string',
        'emailAdress must be a string.'
      );
      assert(
        typeof req.body.password === 'string',
        'password must be a string.'
      );
      next();
    } catch (ex) {
      res.status(422).json({
        error: ex.toString(),
        datetime: new Date().toISOString()
      });
    }
  },

  //
  //
  //
  validateToken(req, res, next) {
    logger.trace('validateToken called');
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next({
        code: 401,
        message: 'Authorization header missing!',
        data: undefined
      });
    } else {
        // Token geef je mee als bearer dus die haal je er hier af
        const token =authHeader.substring(7, authHeader.lenght)
        logger.trace('token', token)

        jwt.verify(token, jwtSecretKey,(err, payload)=>{
            if(err){
                next({
                    code: 401,
                    message: 'Not authorized',
                    data: undefined
                });
            }
            if(payload){
                //user id uit payload in request toevoegen en door naar de volgende handler functie
                req.userId = payload.userId;
                next();
            }
        })

    }
  }
};