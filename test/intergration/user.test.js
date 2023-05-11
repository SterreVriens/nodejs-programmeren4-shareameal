const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const expect = chai.expect;

chai.should();
chai.use(chaiHttp);

// describe('UC-201 Registreren als nieuwe user', () => {
  
//   it.skip('TC-201-1 - Verplicht veld ontbreekt', (done) => {
//     // Testen die te maken hebben met authenticatie of het valideren van
//     // verplichte velden kun je nog niet uitvoeren. Voor het eerste inlevermoment
//     // mag je die overslaan.
//     // In een volgende huiswerk opdracht ga je deze tests wel uitwerken.
//     // Voor nu:
//     done();
//   });


//   it('TC-201-5 - User succesvol geregistreerd', (done) => {
//     // Nieuwe gebruiker om te testen
//     const newUser = {
//       id : '4',
//       firstName: 'Hendrik',
//       lastName: 'van Dam',
//       email: 'hvd@server.nl',
//       street: 'Straatnaam 123',
//       city: 'Plaatsnaam',
//       isActive: true,
//       password: 'test1234',
//       phoneNumber: '061234567',
//       token : 'ABC'
//     };
  
//     // Uitvoeren van de test
//     chai
//       .request(server)
//       .post('/api/user')
//       .send(newUser)
//       .end((err, res) => {
//         assert(err === null);
  
//         res.should.have.status(201);
//         res.body.should.be.an('object');
  
//         let { data, message, status } = res.body;
  
//         status.should.equal(201);
//         message.should.be.a('string').that.contains('User created');
//         data.should.be.an('object');

//         data.should.have.property('firstName').that.is.a('string').and.equals(newUser.firstName);
//         data.should.have.property('lastName').that.is.a('string').and.equals(newUser.lastName);
//         data.should.have.property('email').that.is.a('string').and.equals(newUser.email);
//         data.should.have.property('street').that.is.a('string').and.equals(newUser.street);
//         data.should.have.property('city').that.is.a('string').and.equals(newUser.city);
//         data.should.have.property('isActive').that.is.a('boolean').and.equals(newUser.isActive);
//         data.should.have.property('password').that.is.a('string');
//         data.should.have.property('phoneNumber').that.is.a('string').and.equals(newUser.phoneNumber);
//         data.should.have.property('token').that.is.a('string').and.equals(newUser.token);

  
//         done();
//       });
//   });
// });  

// describe('UC-202 Opvragen van overzicht van users', () => {
//   it('TC-202-1 - Toon alle gebruikers, minimaal 2', (done) => {
//     // Voer de test uit
//     chai
//       .request(server)
//       .get('/api/user')
//       .end((err, res) => {
//         assert(err === null);

//         res.body.should.be.an('object');
//         let { data, message, status } = res.body;

//         status.should.equal(200);
//         message.should.be.a('string').equal('Get all users');
//         expect(res.body.data.length).to.be.gte(2);


//         done();
//       });
//   });

//   // Je kunt een test ook tijdelijk skippen om je te focussen op andere testcases.
//   // Dan gebruik je it.skip
//   it.skip('TC-202-2 - Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
//     // Voer de test uit
//     chai
//       .request(server)
//       .get('/api/user')
//       .query({ name: 'foo', city: 'non-existent' })
//       // Is gelijk aan .get('/api/user?name=foo&city=non-existent')
//       .end((err, res) => {
//         assert(err === null);

//         res.body.should.be.an('object');
//         let { data, message, status } = res.body;

//         status.should.equal(200);
//         message.should.be.a('string').equal('User getAll endpoint');
//         data.should.be.an('array');

//         done();
//       });
//   });
// });

// describe('UC-203 Opvragen van gebruikersprofiel', () =>{

//   it('TC-203-2 Gebruiker is ingelogd met geldig token.', function(done) {
//     const authHeader = 'WXYZ'
//     // Voer de test uit
//     chai
//       .request(server)
//       .get('/api/user/profile')
//       .set('Authorization', authHeader)
//       .end((err, res) => {
//         assert(err === null);

//         res.body.should.be.an('object');
//         let { data, message, status } = res.body;

//         status.should.equal(200);
//         message.should.be.a('string').equal(`Get user profile for user with token ${authHeader}`);

//         // Controleer of de gebruikersgegevens correct zijn geretourneerd
//         data.should.be.an('object');

//         data.should.have.property('firstName').that.is.a('string');
//         data.should.have.property('lastName').that.is.a('string');
//         data.should.have.property('email').that.is.a('string');
//         data.should.have.property('street').that.is.a('string');
//         data.should.have.property('city').that.is.a('string');
//         data.should.have.property('isActive').that.is.a('boolean');
//         data.should.have.property('password').that.is.a('string');
//         data.should.have.property('phoneNumber').that.is.a('string');
//         data.should.have.property('token').that.is.a('string').equal(authHeader)

//         done();
//       });
//     });
// });

// describe('UC-204 Opvragen van usergegevens bij ID', () =>{

//   it('TC-204-3 Gebruiker-ID bestaat', function(done) {
//     const userId = 1;
  
//     chai
//       .request(server)
//       .get(`/api/user/${userId}`)
//       .end((err, res) => {
//         assert(err === null);
  
//         res.body.should.be.an('object');
//         let { data, message, status } = res.body;
  
//         status.should.equal(200);
//         message.should.be.a('string').equal(`Get user with id ${userId}`);
  
//         data.should.be.an('object');
//         data.should.have.property('firstName').that.is.a('string');
//         data.should.have.property('lastName').that.is.a('string');
//         data.should.have.property('email').that.is.a('string');
//         data.should.have.property('street').that.is.a('string');
//         data.should.have.property('city').that.is.a('string');
//         data.should.have.property('password');
//         data.should.have.property('phoneNumber');
  
//         done();
//       });
//   });
  
// });

// describe('UC-206 Verwijderen van user', () =>{

//   it('TC-206-4 Gebruiker succesvol verwijderd', function(done) {
//     const userId = 1; // veronderstel dat dit het te verwijderen gebruikersid is
//     chai
//       .request(server)
//       .delete(`/api/user/${userId}`)
//       .end((err, res) => {
//         assert(err === null);
  
//         res.body.should.be.an('object');
//         let { data, message, status } = res.body;
  
//         status.should.equal(202);
//         message.should.be.a('string').equal(`User is deleted`);
  
//         // Controleer of de gebruiker succesvol is verwijderd
//         data.should.be.an('array');
//         data.should.have.lengthOf(2);
//         data.should.not.deep.include({ id: 1 }); // de verwijderde gebruiker mag niet meer in de data zitten
  
//         done();
//       });
//   });
  
  
// });
