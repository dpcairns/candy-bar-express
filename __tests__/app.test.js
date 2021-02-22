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
        'name': 'air head',
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

    test('creates a new candy bar and that new candy bar is in our candy list', async() => {
      // define the new candy we want create
      const newCandy = {
        name: 'turkish delight',
        yumminess: 5,
        has_chocolate: false,
        category: 'classic',
      };

      // define what we expect that candy to look like after SQL does its thing
      const expectedCandy = {
        ...newCandy,
        id: 6,
        owner_id: 1,
      };

      // use the post endpoint to create a candy
      const data = await fakeRequest(app)
        .post('/candies')
        // pass in our new candy as the req.body
        .send(newCandy)
        .expect('Content-Type', /json/)
        .expect(200);

      // we expect the post endpoint to responds with our expected candy
      expect(data.body).toEqual(expectedCandy);

      // we want to check that the new candy is now ACTUALLY in the database
      const allCandies = await fakeRequest(app)
        // so we fetch all the candies
        .get('/candies')
        .expect('Content-Type', /json/)
        .expect(200);

      // we go and find the turkish delight
      const turkishDelight = allCandies.body.find(candy => candy.name === 'turkish delight');

      // we check to see that the turkish delight in the DB matches the one we expected
      expect(turkishDelight).toEqual(expectedCandy);
    });

    test('updates a candy bar', async() => {
      // define the new candy we want create
      const newCandy = {
        name: 'super candy',
        yumminess: 10,
        has_chocolate: false,
        category: 'modern',
      };

      const expectedCandy = {
        ...newCandy,
        owner_id: 1,
        id: 1
      };
      

      // use the put endpoint to update a candy
      await fakeRequest(app)
        .put('/candies/1')
        // pass in our new candy as the req.body
        .send(newCandy)
        .expect('Content-Type', /json/)
        .expect(200);

      // go grab the candy we expect to be updated
      const updatedCandy = await fakeRequest(app)
        .get('/candies/1')
        .expect('Content-Type', /json/)
        .expect(200);

      // check to see that it matches our expectations
      expect(updatedCandy.body).toEqual(expectedCandy);
    });


    test('deletes a single candy with the matching id', async() => {
      const expectation = {
        'id': 2,
        'name': 'air head',
        'yumminess': 5,
        'has_chocolate': false,
        'category': 'nostalgic',
        'owner_id': 1
      };

      const data = await fakeRequest(app)
        .delete('/candies/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      const nothing = await fakeRequest(app)
        .get('/candies/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });
  });
});
