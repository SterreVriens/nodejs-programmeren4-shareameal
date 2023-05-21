const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const expect = chai.expect;
const pool = require('../../src/util/mysql-db')
const should = chai.should();
let userId;
let authToken;

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
        userId = data.id;
  
        console.log(data.id);
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
        assert( res.status === 200);
  
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
        res.body.message.should.be.a('string').equal(`Get User profile`);

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
        let {message, status,data } = res.body;

        
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
    const newUser = {
      firstName: 'Test',
      lastName: 'Gebruiker',
      street: 'Straatnaam 123',
      city: 'Plaatsnaam',
      password: 'Secret12',
      phoneNumber: '06-12345678'
    };

    chai.request(server)
      .put(`/api/user/${userId}`)
      .send(newUser)
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
    const userId = 9999; // veronderstel dat dit een niet-bestaand gebruikersid is
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

      // Update the user data
      const updatedUser = {
        firstName: 'Tester',
        lastName: 'Gebruiker',
        emailAdress: 'test.gebruiker123@email.com',
        street: 'Straatnaam 123',
        city: 'Plaatsnaam',
        password: 'Secret12',
        phoneNumber: '06-12345678'
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

        done()
    });
  });
});


describe('UC-206 Verwijderen van user', () =>{

  it('TC-206-1 Gebruiker bestaat niet', function(done) {
    const userId = 9999; // veronderstel dat dit een niet-bestaand gebruikersid iss

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

   console.log(userId)
      chai
      .request(server)
      .delete(`/api/user/${userId}`)
      .end((err, res) => {
        assert(err === null);
  
        res.body.should.be.an('object');
        let { data, message, status } = res.body;
  
        status.should.equal(200);
        message.should.be.a('string').equal(`User met ID ${userId} is verwijderd`);
  
        done();
     
      });
  });
  
  
});
