/* eslint-disable indent */
const client = require('../lib/client');
// import our seed data:
const clothes = require('./clothes.js');
const usersData = require('./users.js');
const categoriesData = require('./categories.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    const categories = await Promise.all(
      categoriesData.map(category => {
        return client.query(`
                      INSERT INTO categories (name)
                      VALUES ($1)
                      RETURNING *;
                  `,
          [category.name]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      clothes.map(item => {
        const categoryID = getCategoryID(clothes, categories);
        return client.query(`
                    INSERT INTO clothes (clothing_id, name, img_url, description, category_id, size, price, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
                `,
          [item.clothing_id, item.name, item.img_url, item.description, categoryID, item.size, item.price, user.id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
