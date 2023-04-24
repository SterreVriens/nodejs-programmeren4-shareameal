const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const { assert } = require('chai');
const router = express.Router();
var logger = require('tracer').console();

router.use(express.json());

const dummyUserData = [
  {
    'id': 1,
    'firstName': 'Sterre',
    'lastName': 'Vriens',
    'street': 'Voorbeeldweg 3',
    'city': 'Breda',
    'isActive': true,
    'email': 's.vrien@avans.nl',
    'password': 'test123',
    'phoneNumber': '123456789',
    'token': 'ABCD'
  },
  {
    'id': 2,
    'firstName': 'Jan',
    'lastName': 'Hans',
    'street': 'Example Street 123',
    'city': 'Breda',
    'isActive': true,
    'email': 'Jan.hans@email.com',
    'password': 'secret',
    'phoneNumber': '987654321',
    'token': 'WXYZ'
  }
];

app.use(bodyParser.json());

//Routes

app.use('*', (req, res, next) => {
  const method = req.method;
  logger.info(`Methode ${method} is aangeroepen`);
  next();
});

//UC-102 Opvragen van systeeminformatie
app.get('/api/info', (req, res) => {
  logger.info('Haal server info op')
  res.status(200).json({
    'status': 200,
    'message': 'Server info-endpoint',
    'data': {
      'studentName': 'Sterre Vriens',
      'studentNumber': 2204785,
      'description': 'Welcome at the share-a-meal API'
    }
  });
});

//UC-201 Registreren als nieuwe user
app.post('/api/user', function(req, res) {
  logger.info('Register aangeroepen')
  let email = req.body.email;
  let exists = dummyUserData.some(user => user.email === email);
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
    assert(typeof user.emailAdress === 'string','emailAddress must be a string');

    const newUser = {
      'firstName': req.body.firstName,
      'lastName': req.body.lastName,
      'street': req.body.street,
      'city': req.body.city,
      'email': email,
      'password': req.body.password,
      'phoneNumber': req.body.phoneNumber
    };
  } catch (err) {
    // Als één van de asserts failt sturen we een error response.
    res.status(400).json({
      status: 400,
      message: err.message.toString(),
      data: {}
    });
    // Nodejs is asynchroon. We willen niet dat de applicatie verder gaat
    // wanneer er al een response is teruggestuurd.
    return;
  }

  dummyUserData.push(newUser);

  res.status(201).json({
    'status': 201,
    'message': 'User created',
    'data' : newUser
  });
  logger.trace('Gebruiker is toegevoegd')
});

//UC-202 Opvragen lijst met user
app.get('/api/user', (req, res) => {
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
});

//UC-203 Opvragen van gebruikersprofiel
app.get('/api/user/profile', (req, res) => {
  const authHeader = req.headers['Authorization'] || req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      'status': 401,
      'message': 'Authorization header missing'
    });
  }

  const userData = dummyUserData.find(user => user.token === authHeader);

  if (!userData) {
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
});


 //UC-204 Opvragen van usergegevens bij ID
app.get('/api/user/:userId', function(req, res) {
  console.log('find user ' + req.params.userId);

  const id = parseInt(req.params.userId);
  const user = dummyUserData.find(user => user.id === id);

  if (!user) {
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
});

//UC-205 Wijzigen van usergegevens
app.put('/api/user/:userid', function(req, res) {
  console.log('find user ' + req.params.userid);

  const id = parseInt(req.params.userid);
  const user = dummyUserData.find(user => user.id === id);

  if (!user) {
    res.status(404).json({ message: `User with id ${id} not found` });
    return;
  }

  const userFirst = req.headers['firstname'];
  const userLast = req.headers['lastname'];
  const userStreet = req.headers['street'];
  const userCity = req.headers['city'];
  const userEmail = req.headers['email'];
  const userPassword = req.headers['password'];
  const userPhonenumer = req.headers['phoneNumber'];
  const userToken = req.headers['token'];

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
})

//UC-206 Verwijderen van user
app.delete('/api/user/:userid', function(req, res) {
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
    return res.status(404).json({
      'status': 404,
      'message': 'User cannot be deleted'
    });
  }
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




