const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const { dbConnect, client } = require('./config/configDB');
const generateToken = require('./utils/generateToken');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function run() {
  try {
    dbConnect();
    const database = client.db('toys-zone');
    const toysCollection = database.collection('toys');

    // jwt authentication
    app.post('/jwt', (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = generateToken(user);
      // console.log(token);
      res.send({ token });
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
