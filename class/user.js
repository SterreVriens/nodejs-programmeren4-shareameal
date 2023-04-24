const dummyUserData = [
    {
      'id': 1,
      'firstName': 'Sterre',
      'lastName': 'Vriens',
      'street': 'Voorbeeldweg 3',
      'city': 'Bergen op Zoom',
      'isActive': true,
      'email': 's.vrien@avans.nl',
      'password': 'test123',
      'phoneNumber': '123456789',
      'token': 'ABCD'
    }
  ];

  let user = {};

user.create = function (email, password, callback) {
  let exists = false;
  let result = {};

  dummyUserData.forEach((item) => {
    if(item.email == email) {
      exists = true;
    }
  }); 

  if(exists) {
    result.status = 400;
    result.message = 'User with specified email address already exists';
    result.data = {};
    callback(result);
    return;
  }

  result.status = 201;
  result.message = 'User succesfully created';
  result.data.id = 2;
  callback(result);
}

user.getAll = function (callback) {
    let result = {};
    result = dummyUserData;
  
    callback(result);
  }