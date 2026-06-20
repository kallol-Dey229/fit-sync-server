const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');

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
        const ClassCollection = database.collection("classes");


        //class api

        app.post('/api/classes', (req, res) => {

            const newClass = req.body;

            const result = await ClassCollection.insertOne(newClass);
            res.send(result);
        })





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