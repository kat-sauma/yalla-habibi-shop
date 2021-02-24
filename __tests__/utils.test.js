require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
const { getCategoryId } = require('../data/dataUtils.js');

describe('data utils', () => {


    test('getCategoryID should take in a n item and all categories listed adn return the necessary id', async () => {
        const expectation = 7
        const item = {
            name: 'yellow blouse',
            category: 'tops'
        }
        const categories = [
            {
                id: 6,
                name: 'silk'
            },
            {
                id: 7,
                name: 'tops'
            },
            {
                id: 4,
                name: 'vintage-tops'
            }
        ]

        const actual = getCategoryId(clothes, categories);

        expect(actual).toEqual(expectation);
    });
});
