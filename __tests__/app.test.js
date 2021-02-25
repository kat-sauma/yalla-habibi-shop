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

    test('returns clothes', async () => {

      const expectation = [
        {
          id: 1,
          clothing_id: 1,
          name: 'Floral Silk Top',
          img_url: '../assets/tops/blue-silk-top.jpg',
          description: 'blue silk top with a pan collar',
          category_id: 2,
          owner_id: 1,
          size: 'Large',
          price: 60
        },
        {
          id: 2,
          clothing_id: 2,
          name: 'Denim Vest',
          img_url: '../assets/tops/denim-vest-velvet-collar.jpg',
          description: 'denim vest with a black suede collar',
          category_id: 1,
          owner_id: 1,
          size: 'medium',
          price: 45
        },
        {
          id: 3,
          clothing_id: 3,
          name: 'Burberry Ruffle Collared Tee',
          img_url: '../assets/tops/burberry-black-top.jpg',
          description: 'black cotton polo with a ruffled collar',
          category_id: 3,
          owner_id: 1,
          size: 'small',
          price: 60
        },

        {
          id: 4,
          clothing_id: 4,
          name: 'Beige Suede Button Down',
          img_url: '../assets/tops/suede-button-down-top.jpg',
          description: 'beige, patterned, suede button down tee shirt with structure',
          category_id: 3,
          owner_id: 1,
          size: 'small',
          price: 30
        },

        {
          id: 5,
          clothing_id: 5,
          name: 'Purple Stripe Tank',
          img_url: '../assets/tops/purple-stripe-tank.jpg',
          description: 'lavender and mint striped spaghetti strap tank with diamond point hem',
          category_id: 1,
          owner_id: 1,
          size: 'medium',
          price: 20
        }
      ]

      const data = await fakeRequest(app)
        .get('/clothes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns an item of clothing with its matching clothing_id', async () => {

      const expectation = {
        id: 3,
        clothing_id: 3,
        name: 'Burberry Ruffle Collared Tee',
        img_url: '../assets/tops/burberry-black-top.jpg',
        description: 'black cotton polo with a ruffled collar',
        category_id: 3,
        size: 'small',
        price: 60,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/clothes/3')

        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('creates a new clothing item in our clothing list', async () => {

      const addClothing = {
        clothing_id: 6,
        name: 'Purple Embroidered Button-Down',
        img_url: '../assets/tops/purple-embroidered.jpg',
        description: 'Vintage button-down with short sleeves and embroidered details.',
        category_id: 1,
        size: 'medium',
        price: 45
      };

      const expectedClothing = {
        ...addClothing,
        id: 6,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .post('/clothes')
        .send(addClothing)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectedClothing);

      const allClothes = await fakeRequest(app)
        .get('/clothes')
        .expect('Content-Type', /json/)
        .expect(200);

      const purpleEmbroideredTop = allClothes.body.find(item => item.name === 'Purple Embroidered Button-Down');

      expect(purpleEmbroideredTop).toEqual(expectedClothing);
    });

    test('updates clothes', async () => {
      const newClothes = {
        clothing_id: 6,
        name: 'Turquoise Embroidered Button-Down',
        img_url: '../assets/tops/turpoise-embroidered.jpg',
        description: 'Vintage button-down with short sleeves and embroidered details.',
        category_id: 1,
        size: 'medium',
        price: 55
      };

      const expectedClothes = {
        ...newClothes,
        owner_id: 1,
        id: 1
      };

      await fakeRequest(app)
        .put('/clothes/1')
        .send(newClothes)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedClothes = await fakeRequest(app)
        .get('/clothes/1')
        .expect('Content-Type', /json/)
        .expect(200);

      // check to see that it matches our expectations
      expect(updatedClothes.body).toEqual(expectedClothes);
    });

    test('deletes a single item with the matching id', async () => {
      const expectation = {
        'id': 2,
        'clothing_id': 2,
        'name': 'Denim Vest',
        'img_url': '../assets/tops/denim-vest-velvet-collar.jpg',
        'description': 'denim vest with a black suede collar',
        'category_id': 1,
        'owner_id': 1,
        'size': 'medium',
        'price': 45
      };

      const data = await fakeRequest(app)
        .delete('/clothes/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      const nothing = await fakeRequest(app)
        .get('/clothes/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });
  });
});