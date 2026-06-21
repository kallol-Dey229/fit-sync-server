const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/', (req, res) => {
    res.send('Server is running........!')
})






const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();


        const database = client.db("fit-sync");
        const classCollection = database.collection("classes");
        const forumPostCollection = database.collection("forum");
        const commentCollection = database.collection("comments");


        //class api



        app.get('/api/classes', async (req, res) => {

            const cursor = classCollection.find({});
            const result = await cursor.toArray();

            res.send(result);
        })


        app.get('/api/classes/:id', async (req, res) => {

            const { id } = req.params;

            const result = await classCollection.findOne({ _id: new ObjectId(id) });

            res.json(result);
        })


        app.get('/api/my/classes', async (req, res) => {

            const query = {};

            if (req.query.trainerId) {

                query.trainerId = req.query.trainerId;

            }

            if (req.query.status) {

                query.status = req.query.status;

            }

            const cursor = classCollection.find(query);
            const result = await cursor.toArray();

            res.send(result);
        });


        app.post('/api/classes', async (req, res) => {

            const newClass = req.body;

            const result = await classCollection.insertOne(newClass);
            res.send(result);
        });




        //forum post api


        app.get('/api/forum', async (req, res) => {
            const cursor = forumPostCollection.find({});
            const result = await cursor.toArray();

            res.send(result);
        })


        app.get('/api/my/forum', async (req, res) => {

            const query = {};

            if (req.query.trainerId) {

                query.trainerId = req.query.trainerId;

            }

            const cursor = forumPostCollection.find(query);
            const result = await cursor.toArray();

            res.send(result);
        });



        app.get('/api/forum/:id', async (req, res) => {

            const { id } = req.params;

            const result = await forumPostCollection.findOne({ _id: new ObjectId(id) });

            res.json(result);
        })




        app.post('/api/forum', async (req, res) => {

            const newPost = req.body;

            const result = await forumPostCollection.insertOne(newPost);
            res.send(result);
        });


        //comments api


        app.get('/api/comments/:id', async (req, res) => {

            const { id } = req.params;

            const result = await commentCollection.find({ forumPostId: id }).toArray();
            res.json(result);
        });



        app.post('/api/comments', async (req, res) => {

            const commentData = req.body;

            const result = await commentCollection.insertOne(commentData);

            res.json(result);
        });




        app.patch('/api/comments/:id', async (req, res) => {

            const { id } = req.params;
            const commentData = req.body;

            const result = await commentCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: commentData });

            res.json(result);
        })



        app.delete("/api/comments/:id", async (req, res) => {

            const { id } = req.params;
            const { userId } = req.body;

            const result = await commentCollection.deleteOne({
                _id: new ObjectId(id),
                userId: userId,
            });

            res.json(result);

        });





        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})