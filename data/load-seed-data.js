const client = require('../lib/client');
// import our seed data:
const candies = require('./candies.js');
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
      candies.map(candy => {
        // i want to avoid having to hard code my category ids. this function goes and finds the right category id.
        const categoryId = getCategoryId(candy, categories);

        return client.query(`
                    INSERT INTO candies (name, yumminess, has_chocolate, category_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [
          candy.name, 
          candy.yumminess, 
          candy.has_chocolate,
          categoryId,
          user.id,
        ]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
