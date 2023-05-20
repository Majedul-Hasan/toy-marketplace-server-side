const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();
const app = express();
const cors = require('cors');
const { dbConnect, client } = require('./config/configDB');
const generateToken = require('./utils/generateToken');
const { verifyJWT } = require('./middleware/authMiddleware');
const { ObjectId, Binary } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

async function run() {
  try {
    dbConnect();

    const database = client.db('toys-zone');
    const toysCollection = database.collection('toys');
    const blogsCollection = database.collection('programmingBlogs');

    // jwt authentication
    app.post('/jwt', (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = generateToken(user);
      // console.log(token);
      res.send({ token });
    });

    app.get('/blogs', async (req, res) => {
      const cursor = blogsCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    //single blog
    app.get('/blogs/:slug', async (req, res) => {
      const slug = req.params.slug;
      const query = { slug: slug };

      const blog = await blogsCollection.findOne(query);

      return res.send(blog);
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

    // single toy update
    app.patch('/toys/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      console.log(req.decoded);
      const email = req.decoded?.email;
      const filter = { _id: new ObjectId(id) };
      const toy = await toysCollection.findOne(filter);
      const options = { upsert: false };
      const updatedToy = req.body;
      if (email === toy['seller-email']) {
        console.log(updatedToy);
        const updateDoc = {
          $set: {
            ...updatedToy,
          },
        };
        const result = await toysCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      } else {
        res.status(403).send({ error: true, message: 'unauthorized access' });
      }
    });

    // single toy delete
    app.delete('/toys/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const email = req.decoded?.email;
      console.log(email);
      const query = { _id: new ObjectId(id) };
      const toy = await toysCollection.findOne(query);
      console.log(toy);

      if (email === toy['seller-email']) {
        const result = await toysCollection.deleteOne(query);
        res.send(result);
      } else {
        res.status(403).send({ error: true, message: 'unauthorized access' });
      }
    });

    // my toys

    app.get('/my-toys', verifyJWT, async (req, res) => {
      const email = req.decoded?.email;
      const query = { 'seller-email': email };

      // console.log(email);

      const cursor = toysCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
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



/**
  app.get('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: { _id: 1, photo: 1 },
      };
      const blog = await blogsCollection.findOne(query, options);
      res.set('Content-Type', blog.photo.contentType);
      return res.send(blog.photo.data);
    });
  
 */