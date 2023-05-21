const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const expect = chai.expect;
const pool = require('../../src/util/mysql-db')
const should = chai.should();

chai.use(chaiHttp);
//chai.use(should);

describe('UC-201 Registreren als nieuwe user', () => {
  
  it('TC-201-1 - Verplicht veld ontbreekt', (done) => {
    // Nieuwe gebruiker om te testen
    const newUser = {
      firstName: 'Hendrikk',
      lastName: 'van Dam',
      street: 'Straatnaam 123',
      city: 'Plaatsnaam',
      password: 'test1234',
      phoneNumber: '123456789'
    };
  
    // Uitvoeren van de test
    chai
      .request(server)
      .post('/api/user')
      .send(newUser)
      .end((err, res) => {
        assert(err === null);
  
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(400);
        res.body.should.has.property('message').to.be.equal('User data is not complete');
        res.body.should.has.property('data');
  
        done();
      });
  });
  it('TC-201-4 Gebruiker bestaat al',(done) =>{
    const newUser = {
      firstName: 'Mariëtte',
      lastName: 'van den Dullemen',
      emailAdress: 'm.vandullemen@server.nl',
      password: 'secret',
    };

  
    // Uitvoeren van de test
    chai
      .request(server)
      .post('/api/user')
      .send(newUser)
      .end((err, res) => {
        assert(err === null);
  
        res.should.have.status(403);
  
        let {message, status } = res.body;
  
        status.should.equal(403);
        message.should.be.a('string').that.contains('User with specified email address already exists');
  
        
  
        done();
      });
  });
  it('TC-201-5 - User succesvol geregistreerd', (done) => {
    // Nieuwe gebruiker om te testen
    const newUser = {
      firstName: 'Test',
      lastName: 'Gebruiker',
      emailAdress: 'test.gebruiker123@email.com',
      street: 'Straatnaam 123',
      city: 'Plaatsnaam',
      password: 'Secret12',
      phoneNumber: '06-12345678'
    };
  
    // Uitvoeren van de test
    chai
      .request(server)
      .post('/api/user')
      .send(newUser)
      .end((err, res) => {
        assert(err === null);
  
        res.body.should.has.property('status').to.be.equal(201);
        res.body.should.be.an('object');
  
        let { data, message } = res.body;
  
       
        message.should.be.a('string').that.contains('User created');
        data.should.be.an('object');
  
        pool.getConnection(function(err, conn, next) {
          if (err) {
            logger.error('error ', err);
            next(err.message);
          } else if (conn) {
            conn.query(
              "DELETE FROM `user` WHERE `emailAdress` = '" + newUser.emailAdress + "'",
              function(err, results, fields) {
                if (err) {
                  next({
                    code: 500,
                    message: err.message
                  });
                }
                
              }
            );
            pool.releaseConnection(conn);
          }
        });  
  
        done();
      });
  
  });
});  

describe('UC-202 Opvragen van overzicht van users', () => {
  it('TC-202-1 - Toon alle gebruikers, minimaal 2', (done) => {
    // Voer de test uit
    chai
      .request(server)
      .get('/api/user')
      .end((err, res) => {
        assert(err === null);

        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.be.an('object');
        let { data, message, status } = res.body;
        message.should.be.a('string').equal('Get all users');

        done();
      });
  });

  it('TC-202-2 - Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
    // Voer de test uit
    chai
      .request(server)
      .get('/api/user')
      .query({ name: 'foo', city: 'non-existent' })
      // Is gelijk aan .get('/api/user?name=foo&city=non-existent')
      .end((err, res) => {
        assert(err === null);

        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(200);
        let { data, message } = res.body;

        message.should.be.a('string').equal('Invalid filter parameters');
        data.should.be.an('array');

        done();
      });
  });
  it('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false'), (done) =>{
    chai
      .request(server)
      .get('/api/user')
      .query({ isActive: 'false'})
      // Is gelijk aan .get('/api/user?name=foo&city=non-existent')
      .end((err, res) => {
        assert(err === null);

        res.body.should.be.an('object');
        let { data, message, status } = res.body;

        status.should.equal(200);
        message.should.be.a('string').equal('Get filtered users');
        data.should.be.an('array');

        done();
      });
  }
  it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true'), (done) =>{
    chai
      .request(server)
      .get('/api/user')
      .query({ isActive: 'true'})
      // Is gelijk aan .get('/api/user?name=foo&city=non-existent')
      .end((err, res) => {
        assert(err === null);

        res.body.should.be.an('object');
        let { data, message, status } = res.body;

        status.should.equal(200);
        message.should.be.a('string').equal('Get filtered users');
        data.should.be.an('array');

        done();
      });
  }
  it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)'), (done) =>{
    chai
      .request(server)
      .get('/api/user')
      .query({ isActive: 'true', lastName:'Doe'})
      // Is gelijk aan .get('/api/user?name=foo&city=non-existent')
      .end((err, res) => {
        assert(err === null);

        res.body.should.be.an('object');
        let { data, message, status } = res.body;

        status.should.equal(200);
        message.should.be.a('string').equal('Get filtered users');
        data.should.be.an('array');

        done();
      });
  }
});

describe('UC-203 Opvragen van gebruikersprofiel', () =>{

  let server; // Serverinstantie
  let authToken; // Variabele om het token op te slaan

  before(function(done) {
    // Start de server voordat de tests worden uitgevoerd
    server = require('../../app');
  
    // Login en haal het token op
    const user = {
      emailAdress: 'm.vandullemen@server.nl',
      password: 'secret'
    };
  
    chai
      .request(server)
      .post('/api/login')
      .send(user)
      .end(function(err, res) {
        assert(err === null);
        assert(res.status === 200);
  
        // Haal het token op uit de response
        authToken = res.body.data.token;
        console.log(authToken);
        done(); // Geef aan dat de before-haak is voltooid
      });
  });

  it('TC-203-2 Gebruiker is ingelogd met geldig token.', function(done) {
    //log eerst in doormiddel van het /login endpoint met de user en haal daarna uit die resultaten de token op
    chai
      .request(server)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        assert(err === null);

        res.body.should.be.an('object');
        let { data, message, status } = res.body;

        res.body.status.should.to.be.equal(200);
        res.body.message.should.be.a('string').equal(`Get user profile for user with token ${authHeader}`);

        // Controleer of de gebruikersgegevens correct zijn geretourneerd
        data.should.be.an('object');

        data.should.have.property('firstName').that.is.a('string');
        data.should.have.property('lastName').that.is.a('string');
        data.should.have.property('emailAdress').that.is.a('string');
        data.should.have.property('street').that.is.a('string');
        data.should.have.property('city').that.is.a('string');
        data.should.have.property('password').that.is.a('string');
        data.should.have.property('phoneNumber').that.is.a('string');

        done();
      });
    });
});

describe('UC-204 Opvragen van usergegevens bij ID', () =>{

  it('TC-204-2 Gebruiker-ID bestaat niet', function(done) {
    const userId = 0;
  
    chai
      .request(server)
      .get(`/api/user/${userId}`)
      .end((err, res) => {
        assert(err === null);
        should.exist(res.body);

        let {message, status } = res.body;
  
        status.should.equal(404);
        message.should.be.a('string').equal(`Gebruiker met id ${userId} wordt niet gevonden`);

  
        done();
      });
  });
  it('TC-204-3 Gebruiker-ID bestaat', function(done) {
    const userId = 2;
  
    chai
      .request(server)
      .get(`/api/user/${userId}`)
      .end((err, res) => {
        assert(err === null);
        res.body.should.be.an('object');
        let {message, status } = res.body;

        
        status.should.equal(200);
        message.should.be.a('string').equal(`Get user with id ${userId}`);
  
        data.should.be.an('object');
        data.should.have.property('emailAdress');
        data.should.have.property('password');
        data.should.have.property('phoneNumber');
  
        done();
      });
  });
  
});

describe('UC-205 Updaten van user', () => {

  // TC-205-1: Verplicht veld "emailAddress" ontbreekt
  it('TC-205-1 Verplicht veld “emailAddress” ontbreekt', function(done) {
    const userId = 1; // veronderstel dat dit het te wijzigen gebruikersid is
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      street: 'Bredaweg 12',
      city: 'Breda',
      password: 'wachtwoord',
      phoneNumber: '123456789'
    };

    chai.request(server)
      .put(`/api/user/${userId}`)
      .send(user)
      .end((err, res) => {
        assert(err === null);

        res.body.should.be.an('object');
        let { data, message, status } = res.body;

        status.should.equal(400);
        message.should.be.a('string').equal('User data is niet compleet/correct: "emailAdress" is required');
        data.should.be.an('object').that.is.empty;

        done();
      });
  });

  // TC-205-4: Gebruiker bestaat niet
  it('TC-205-4 Gebruiker bestaat niet', function(done) {
    const userId = 999; // veronderstel dat dit een niet-bestaand gebruikersid is
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      street: 'Bredaweg 12',
      city: 'Breda',
      emailAdress: 'john.doe1234@email.com',
      password: 'Wachtwoord1',
      phoneNumber: '06-12345678'
    };

    chai.request(server)
      .put(`/api/user/${userId}`)
      .send(user)
      .end((err, res) => {
        assert(err === null);
        should.exist(res.body);

        res.body.should.be.an('object');

        res.body.status.should.equal(404);
        res.body.message.should.be.a('string').equal(`User with id ${userId} not found`);
        res.body.data.should.be.an('object').that.is.empty;

        done();
      });
  });

  it('TC-205-6 Gebruiker succesvol gewijzigd', function(done) {

    // Create a new user in the database
    let userId;
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      street: 'Bredaseweg 12',
      city: 'Breda',
      emailAdress: 'john.doe@email.com',
      password: 'Secret12',
      phoneNumber: '06-12345678',
    };
    pool.getConnection(function(err, conn) {
      if(err){
        logger.error('error ', err)
        next({
          code: 500,
          message: err.message
        });
      }
      if(conn){
      conn.query('INSERT INTO `user`(`firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `street`, `city`) VALUES (?,?,?,?,?,?,?)', 
        [user.firstName, user.lastName, user.emailAdress, user.password, user.phoneNumber, user.street, user.city],
        function(err, results, fields) {
          if (err) {
            logger.error('Database error: ' + err.message);
            next({
              code: 500,
              message: err.message
            });
          }
           userId = results.insertId;
        }
      )}
      
    

      // Update the user data
      const updatedUser = {
        firstName: 'Jane',
        lastName: 'Doe John',
        street: 'Bredaseweg 12',
        city: 'Breda',
        emailAdress: 'jane.doe@email.com',
        password: 'sEcre12t',
        phoneNumber: '06 12345678',
      };

      chai.request(server)
        .put(`/api/user/${userId}`)
        .send(updatedUser)
        .end((err, res) => {
          assert(err === null);

          res.body.should.be.an('object');
          let { data, message, status } = res.body;

          status.should.equal(200);
          message.should.be.a('string').equal(`User with id ${userId} updated`);

          // Check if the user data was updated correctly in the database
          pool.query('SELECT * FROM `user` WHERE `id` = ?', [userId], function(err, results, fields) {
            if (err) {
              logger.error('Database error: ' + err.message);
              return next(err.message);
            }

            results.should.be.an('array').with.lengthOf(1);
            results[0].should.be.an('object').with.keys(
              'id', 'firstName', 'lastName', 'street', 'city', 'emailAdress', 'password', 'phoneNumber'
            );
            results[0].id.should.equal(userId);
            results[0].firstName.should.equal(updatedUser.firstName);
            results[0].lastName.should.equal(updatedUser.lastName);
            results[0].street.should.equal(updatedUser.street);
            results[0].city.should.equal(updatedUser.city);
            results[0].emailAdress.should.equal(updatedUser.emailAdress);
            results[0].password.should.equal(updatedUser.password);
            results[0].phoneNumber.should.equal(updatedUser.phoneNumber);

            // Remove the user from the database
            pool.query('DELETE FROM `user` WHERE `id` = ?', [userId], function(err, results, fields) {
              if (err) {
                logger.error('Database error: ' + err.message);
                return next(err.message);
              }
              done();
            });
          });
        });
    });
  });
});


describe('UC-206 Verwijderen van user', () =>{

  it('TC-206-1 Gebruiker bestaat niet', function(done) {
    const userId = 999; // veronderstel dat dit een niet-bestaand gebruikersid iss

    chai.request(server)
    .delete(`/api/user/${userId}`)
    .end((err, res) => {
      assert(err === null);

        let {data, message, status } = res.body;

        status.should.equal(404);
        message.should.be.a('string').equal(`User not found`);
        data.should.be.an('object').that.is.empty;

        done();
      });
  });
  it('TC-206-4 Gebruiker succesvol verwijderd', function(done) {

    pool.getConnection(function(err, conn) {
        if (err) {
          logger.error('error ', err);
          next(err.message);
        } else if (conn) {
          conn.query(
            'SELECT id FROM `user` ORDER BY id DESC LIMIT 1',
            function(err, results, fields) {
              if (err) {
                res.status(500).json({
                  statusCode: 500,
                  message: err.sqlMessage
                });
                logger.error(err.sqlMessage);
              }
              const id = results[0].id;

              chai
      .request(server)
      .delete(`/api/user/${id}`)
      .end((err, res) => {
        assert(err === null);
  
        res.body.should.be.an('object');
        let { data, message, status } = res.body;
  
        status.should.equal(200);
        message.should.be.a('string').equal(`User met ID ${id} is verwijderd`);
  
        done();
      });

            }
          );
          pool.releaseConnection(conn);
        }
      });
  });
  
  
});
