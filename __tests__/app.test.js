require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns all candies', async() => {

      const expectation = [
        {
          'id': 1,
          'name': 'baby ruth',
          'yumminess': 3,
          'has_chocolate': true,
          'category': 'classic',
          'owner_id': 1
        },
        {
          'id': 2,
          'name': 'air head',
          'yumminess': 5,
          'has_chocolate': false,
          'category': 'nostalgic',
          'owner_id': 1
        },
        {
          'id': 3,
          'name': 'snickers',
          'yumminess': 7,
          'has_chocolate': true,
          'category': 'classic',
          'owner_id': 1
        },
        {
          'id': 4,
          'name': 'hersheys cookies and cream',
          'yumminess': 8,
          'has_chocolate': true,
          'category': 'modern',
          'owner_id': 1
        },
        {
          'id': 5,
          'name': 'sour patch kids',
          'yumminess': 8,
          'has_chocolate': false,
          'category': 'nostalgic',
          'owner_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/candies')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single candy with the matching id', async() => {

      const expectation = {
        'id': 2,
        'name': 'SCARE head',
        'yumminess': 5,
        'has_chocolate': false,
        'category': 'nostalgic',
        'owner_id': 1
      };

      const data = await fakeRequest(app)
        .get('/candies/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);


      const nothing = await fakeRequest(app)
        .get('/candies/100')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });
  });
});
