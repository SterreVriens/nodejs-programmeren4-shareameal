const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const { it } = require('mocha');

chai.should();
chai.use(chaiHttp);

describe('UC-101 Inloggen', () => {
    it('TC-101-1 Verplicht veld ontbreekt', (done) =>{
        const login = {
            emailAdress: 'm.vandullemen@server.nl'
          };
    chai
      .request(server)
      .post('/api/login')
      .send(login)
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(400);
        res.body.should.has.property('message').to.be.equal('Not authorized');
        res.body.should.has.property('data').that.is.an('object').that.is.empty;
        done();
      });
    }),
    it('TC-101-2 Niet-valide wachtwoord', (done) =>{
        const login = {
            emailAdress: "m.vandullemen@server.nl",
            password: "secre"
          };
        chai
          .request(server)
          .post('/api/login')
          .send(login)
          .end((err, res) => {
            res.body.should.be.an('object');
            res.body.should.has.property('status').to.be.equal(400);
            res.body.should.has.property('message').to.be.equal('Not authorized');
            res.body.should.has.property('data').that.is.an('object').that.is.empty;
            done();
        });
    }),
    it('TC-101-3 Gebruiker bestaat niet', (done) =>{
        const login = {
            emailAdress: "hendrik.sfdsf@email.com",
            password: "s"
          };
        chai
          .request(server)
          .post('/api/login')
          .send(login)
          .end((err, res) => {
            res.body.should.be.an('object');
            res.body.should.has.property('status').to.be.equal(404);
            res.body.should.has.property('message');
            res.body.should.has.property('data').that.is.an('object').that.is.empty;
            done();
        });
    })
    it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
        const login = {
          emailAdress: "m.vandullemen@server.nl",
          password: "secret"
        };
        
        chai
          .request(server)
          .post('/api/login')
          .send(login)
          .end((err, res) => {
            res.body.should.be.an('object');
            res.body.should.have.property('status', 200);
            res.body.should.have.property('message', 'Login endpoint');
            res.body.data.should.have.property('id');
            res.body.data.should.have.property('token');
            res.body.data.should.have.property('id', 1);
            res.body.data.should.have.property('firstName');
            res.body.data.should.have.property('lastName');
            res.body.data.should.have.property('isActive');
            res.body.data.should.have.property('emailAdress');
            res.body.data.should.have.property('phoneNumber');
            res.body.data.should.have.property('roles');
            res.body.data.should.have.property('street');
            res.body.data.should.have.property('city');

                    
      
            done();
        });
      });      
})