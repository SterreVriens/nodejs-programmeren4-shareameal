const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const { it } = require('mocha');
let mealId;

chai.should();
chai.use(chaiHttp);

describe('UC-301 - Aanmaken maaltijd aangeroepen', () => {
    let authToken;
    let server;
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
      
    it('TC-301-1 Verplicht veld ontbreekt', (done) =>{
        const meal = {
            isActive: true,
            isVega: false,
            isVegan: true,
            isToTakeHome: true,
            dateTime: '2023-05-17T10:00:00Z',
            maxAmountOfParticipants: 6,
            price: 9.99,
            imageUrl: 'https://example.com/image.jpg',
            description: 'This is a delicious meal.',
            allergenes: 'gluten'
          };
    chai
      .request(server)
      .post('/api/meal')
      .set('Authorization', `Bearer ${authToken}`)
      .send(meal)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(400);
        res.body.should.has.property('message');
        res.body.should.has.property('data').that.is.an('object').that.is.empty;
        done();
      });
    }),
    it('TC-301-2 Niet ingelogd', (done) =>{
        const meal = {
            isActive: true,
            isVega: false,
            isVegan: true,
            isToTakeHome: true,
            dateTime: '2023-05-17T10:00:00Z',
            maxAmountOfParticipants: 6,
            price: 9.99,
            imageUrl: 'https://example.com/image.jpg',
            description: 'This is a delicious meal.',
            allergenes: 'gluten'
          };
    chai
      .request(server)
      .post('/api/meal')
      .set('Authorization', `Bearer 12345`)
      .send(meal)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(404);
        res.body.should.has.property('message');
        res.body.should.has.property('data').that.is.an('object').that.is.empty;
        done();
      });
    }),
    it('TC-301-3 Maaltijd succesvol toegevoegd', (done) =>{
        const dateTime = new Date('2023-05-17T10:00:00Z').toISOString().slice(0, 19).replace('T', ' ');

        const meal = {
            isActive: true,
            isVega: false,
            isVegan: true,
            isToTakeHome: true,
            dateTime,
            maxAmountOfParticipants: 6,
            price: 9.99,
            name: 'Pizza',
            imageUrl: 'https://example.com/image.jpg',
            description: 'This is a delicious meal.',
            allergenes: 'gluten'
          };
    chai
      .request(server)
      .post('/api/meal')
      .set('Authorization', `Bearer ${authToken}`)
      .send(meal)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(201);
        res.body.should.has.property('message');
        res.body.should.has.property('data');

        mealId =  res.body.data.id;
        done();
      });
    })
     
}),
describe('UC-303 Opvragen an alle maaltijden', () => {   
    it('TC-303-1 Lijst van maaltijden geretourneerd', (done) =>{
    chai
      .request(server)
      .get('/api/meal')
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.has.property('message').to.be.equal('Get all meals');
        res.body.should.has.property('data')
        done();
      });
    }) 
}),
describe('UC-304 Opvragen van maaltijd bij ID', () => {   
    it('TC-304-1 Maaltijd bestaat niet', (done) =>{
    chai
      .request(server)
      .get('/api/meal/9999')
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(404);
        res.body.should.has.property('message').to.be.equal('Maaltijd met id 9999 wordt niet gevonden');
        res.body.should.has.property('data')
        done();
      });
    }) ,
    it('TC-304-2 Details van maaltijd geretourneerd', (done) =>{
        chai
          .request(server)
          .get(`/api/meal/${mealId}`)
          .end((err, res) => {
            res.body.should.be.an('object');
            res.body.should.has.property('status').to.be.equal(200);
            res.body.should.has.property('message').to.be.equal(`Get meal with id ${mealId}`);
            res.body.should.has.property('data')
            done();
          });
        })
}),
describe('UC-305 Verwijderen van maaltijd', () => {
    let authToken;
    let server;
    beforeEach(function(done) {
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
      
    it('TC-305-1 Niet ingelogd', (done) =>{
        
    chai
      .request(server)
      .delete('/api/meal/2')
      .set('Authorization', `Bearer 12345`)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(404);
        res.body.should.has.property('message');
        res.body.should.has.property('data').that.is.an('object').that.is.empty;
        done();
      });
    }),
    it('TC-305-2 Niet de eigenaar van de data', (done) =>{
    chai
      .request(server)
      .delete('/api/meal/2')
      .set('Authorization', `Bearer ${authToken}`)
      .end((err, res) => {
        
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(403);
        res.body.should.has.property('message');
        res.body.should.has.property('data');
        done();
      });
    }),
    it('TC-305-3 Maaltijd bestaat niet', (done) =>{
        chai
          .request(server)
          .delete('/api/meal/99999')
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res) => {
            
            res.body.should.be.an('object');
            res.body.should.has.property('status').to.be.equal(404);
            res.body.should.has.property('message');
            res.body.should.has.property('data');
            done();
          });
    }),
    it('TC-305-4 Maaltijd succesvol verwijderd', (done) =>{
            chai
              .request(server)
              .delete(`/api/meal/${mealId}`)
              .set('Authorization', `Bearer ${authToken}`)
              .end((err, res) => {
                
                res.body.should.be.an('object');
                res.body.should.has.property('status').to.be.equal(200);
                res.body.should.has.property('message').to.be.equal(`Maaltijd met ID ${mealId} is verwijderd`);
                res.body.should.has.property('data');
                done();
              });
    })
     
})