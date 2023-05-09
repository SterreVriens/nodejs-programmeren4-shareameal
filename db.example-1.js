// get the client
const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'shareameal',
  port : 3306
});

// simple query
connection.query(
  'SELECT id ,name FROM `meal` ',
  function(err, results, fields) {
    if(err){
        console.log(err.sqlMessage)
    }
    console.log('results: ',results); 
  }
);

connection.end();