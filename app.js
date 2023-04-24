const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const { assert } = require('chai');
const Userrouter = require('./src/routes/user.routes')
var logger = require('tracer').console();

Userrouter.use(express.json());
app.use(bodyParser.json());
app.use('/api/user', Userrouter)

//Routes

app.use('*', (req, res, next) => {
  const method = req.method;
  logger.info(`Methode ${method} is aangeroepen`);
  next();
});

//UC-102 Opvragen van systeeminformatie
app.get('/api/info', (req, res) => {
  logger.info('Haal server info op')
  res.status(201).json({
    'status': 201,
    'message': 'Server info-endpoint',
    'data': {
      'studentName': 'Sterre Vriens',
      'studentNumber': 2204785,
      'description': 'Welcome at the share-a-meal API'
    }
  });
});




  





app.use('*', (req, res) => {
  res.status(404).json({
    'status': 404,
    'message': 'Endpoint not found',
    'data': {}
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port} - URL: http://localhost:3000/`)
})


module.exports = app;

