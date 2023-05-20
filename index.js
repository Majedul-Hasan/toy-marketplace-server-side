const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const { dbConnect, client } = require('./config/configDB');
const generateToken = require('./utils/generateToken');
const { verifyJWT } = require('./middleware/authMiddleware');
const { ObjectId } = require('mongodb');
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

    app.get('/toys', async (req, res) => {
      const cursor = toysCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    // single toy creation
    app.post('/toys', verifyJWT, async (req, res) => {
      const toy = req.body;
      // console.log(toy);
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    // single toy get
    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // single toy delete
    app.delete('/toys/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      console.log(req.decoded);
      const email = req.decoded?.email;
      const query = { _id: new ObjectId(id) };
      const toy = await toysCollection.findOne(query);

      if (email === toy['seller-email']) {
        const result = await toysCollection.deleteOne(query);
        res.send(result);
      } else {
        res.status(403).send({ error: true, message: 'unauthorized access' });
      }
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
