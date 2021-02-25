/* eslint-disable indent */
require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
const { getCategoryId } = require('../data/dataUtils.js');

describe('data utils', () => {


    test.skip('getCategoryId should take in an item and all categories listed and return the necessary id', async () => {
        const expectation = 7;
        const item = {
            name: 'yellow blouse',
            category_id: 'tops'
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
        ];

        const actual = getCategoryId(item, categories);

        expect(actual).toEqual(expectation);
    });
});
