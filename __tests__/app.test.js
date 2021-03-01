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

    const candy = {
      'name': 'sour patch kids',
      'yumminess': 8,
      'has_chocolate': false,
      'category': 'nostalgic',
    };

    const dbCandy = {
      ...candy,
      owner_id: 2,
      id:6,
    };

    test('create a candy', async() => {
      const candy = {
        'name': 'sour patch kids',
        'yumminess': 8,
        'has_chocolate': false,
        'category': 'nostalgic',
      };

      const data = await fakeRequest(app)
        .post('/api/candies')
        .send(candy)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(dbCandy);
    });

    test('returns all candies for a given user', async() => {
      const data = await fakeRequest(app)
        .get('/api/candies')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([dbCandy]);
    });

    test('returns a single candy with the matching id', async() => {

      const data = await fakeRequest(app)
        .get('/api/candies/6')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(dbCandy);


      const nothing = await fakeRequest(app)
        .get('/api/candies/1')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });
  });
});
