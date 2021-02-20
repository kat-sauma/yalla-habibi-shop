/* eslint-disable indent */
const client = require('../lib/client');
// import our seed data:
const clothes = require('./clothes.js');
const usersData = require('./users.js');
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

    const user = users[0].rows[0];

    await Promise.all(
      clothes.map(item => {
        return client.query(`
                    INSERT INTO clothes (id, name, img_url, description, category, size, price, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
                `,
          [item.id, item.name, item.img_url, item.description, item.category, item.size, item.price, user.id]);
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
