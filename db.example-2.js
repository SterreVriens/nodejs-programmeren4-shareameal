// get the client
const mysql = require('mysql2');

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'shareameal',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0
});

// simple query
pool.getConnection(function(err, conn) {
  if(err){
    console.log('error ', err)
  }
  if(conn){
    conn.query(
      'SELECT * FROM `user` ',
      function(err, results, fields) {
        if(err){
            console.log(err.sqlMessage)
        }
        console.log('results: ',results); 
      }
    );
    pool.releaseConnection(conn);
  }
  
})

//pool.end();