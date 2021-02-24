require('dotenv').config();
require('./lib/client').connect();

const app = require('./lib/app');

const PORT = process.env.PORT || 7890;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Started on ${PORT}`);
});

// this is where we "Spin up!" the server"
// it is called exactly once, when we run node or nodemon
// daemon -- nodemon
