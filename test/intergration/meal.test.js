const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const { it } = require('mocha');

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
    })
     
})