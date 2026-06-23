// const express = require('express');
// const cors = require('cors');
// const app = express();
// const port = 5000;
// require('dotenv').config();


// app.use(cors());
// app.use(express.json());



// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// app.get('/', (req, res) => {
//     res.send('Server is running........!')
// })






// const uri = process.env.MONGO_DB_URI;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// async function run() {
//     try {

//         await client.connect();


//         const database = client.db("fit-sync");
//         const classCollection = database.collection("classes");
//         const forumPostCollection = database.collection("forum");
//         const commentCollection = database.collection("comments");
//         const favoritesCollection = database.collection("favorites");
//         const applicationCollection = database.collection("application");
//         const usersCollection = database.collection("user");
//         const  purchasesCollection = database.collection("purchases");



//         //class api



//         app.get('/api/classes', async (req, res) => {

//             const cursor = classCollection.find({});
//             const result = await cursor.toArray();

//             res.send(result);
//         })


//         app.get('/api/classes/:id', async (req, res) => {

//             const { id } = req.params;

//             const result = await classCollection.findOne({ _id: new ObjectId(id) });

//             res.json(result);
//         })


//         app.get('/api/my/classes', async (req, res) => {

//             const query = {};

//             if (req.query.trainerId) {

//                 query.trainerId = req.query.trainerId;

//             }

//             if (req.query.status) {

//                 query.status = req.query.status;

//             }

//             const cursor = classCollection.find(query);
//             const result = await cursor.toArray();

//             res.send(result);
//         });


//         app.post('/api/classes', async (req, res) => {

//             const newClass = req.body;

//             const result = await classCollection.insertOne(newClass);
//             res.send(result);
//         });




//         //forum post api


//         app.get('/api/forum', async (req, res) => {
//             const cursor = forumPostCollection.find({});
//             const result = await cursor.toArray();

//             res.send(result);
//         })


//         app.get('/api/my/forum', async (req, res) => {

//             const query = {};

//             if (req.query.trainerId) {

//                 query.trainerId = req.query.trainerId;

//             }

//             const cursor = forumPostCollection.find(query);
//             const result = await cursor.toArray();

//             res.send(result);
//         });



//         app.get('/api/forum/:id', async (req, res) => {

//             const { id } = req.params;

//             const result = await forumPostCollection.findOne({ _id: new ObjectId(id) });

//             res.json(result);
//         })




//         app.post('/api/forum', async (req, res) => {

//             const newPost = req.body;

//             const result = await forumPostCollection.insertOne(newPost);
//             res.send(result);
//         });


//         //comments api


//         app.get('/api/comments/:id', async (req, res) => {

//             const { id } = req.params;

//             const result = await commentCollection.find({ forumPostId: id }).toArray();
//             res.json(result);
//         });



//         app.post('/api/comments', async (req, res) => {

//             const commentData = req.body;

//             const result = await commentCollection.insertOne(commentData);

//             res.json(result);
//         });




//         // app.patch('/api/comments/:id', async (req, res) => {

//         //     const { id } = req.params;
//         //     const commentData = req.body;

//         //     const result = await commentCollection.updateOne(
//         //         { _id: new ObjectId(id) },
//         //         { $set: commentData });

//         //     res.json(result);
//         // })



//         app.delete("/api/comments/:id", async (req, res) => {

//             const { id } = req.params;
//             const { userId } = req.body;

//             const result = await commentCollection.deleteOne({
//                 _id: new ObjectId(id),
//                 userId: userId,
//             });

//             res.json(result);

//         });




//         // favorites apis


//         app.post("/api/favorites", async (req, res) => {

//             const favorite = req.body;

//             const exists = await favoritesCollection.findOne({
//                 userId: favorite.userId,
//                 classId: favorite.classId,
//             });

//             if (exists) {
//                 return res.send({
//                     success: false,
//                     message: "Already added",
//                 });
//             }

//             const result = await favoritesCollection.insertOne(favorite);

//             res.send({
//                 success: true,
//                 result,
//             });
//         });







//         app.get('/api/favorites', async (req, res) => {
//             const { userId } = req.query;

//             if (!userId) {
//                 return res.send({ success: false, message: "Missing userId" });
//             }

//             const result = await favoritesCollection.find({ userId: String(userId) }).toArray();
//             res.send({ success: true, data: result });
//         });





//         // application api


//         app.post('/api/application', async (req, res) => {

//             const newApplication = req.body;

//             const result = await applicationCollection.insertOne(newApplication);

//             res.send(result);
//         });



//         app.get('/api/application', async (req, res) => {

//             const cursor = applicationCollection.find({});
//             const result = await cursor.toArray();

//             res.send(result);

//         })





//         //users api

//         app.get('/api/user', async (req, res) => {

//             const cursor = usersCollection.find({});
//             const result = await cursor.toArray();

//             res.send(result);
//         })





//         //

//         app.post("/api/purchases", async (req, res) => {
//       const { classId, buyerEmail, buyerName, stripeSessionId } = req.body;

//       const existing = await purchasesCollection.findOne({ classId, buyerEmail });
//       if (existing) return res.send(existing);

//       if (!ObjectId.isValid(classId)) {
//         return res.status(400).send({ message: "Invalid book id" });
//       }

//       const classes = await classCollection.findOne({ _id: new ObjectId(classId) });
//       if (!classes) return res.status(404).send({ message: "Book not found" });

//       const purchase = {
//         classId,
//         classTitle: classes.title,
//         bookCoverImage: classes.coverImage,
//         price: classes.price,
//         buyerEmail,
//         buyerName: buyerName || buyerEmail,
//         writerEmail: classes.trainerEmail,
//         writerName: classes.authorName,
//         stripeSessionId: stripeSessionId || null,
//         purchasedAt: new Date(),
//       };

//       const result = await purchasesCollection.insertOne(purchase);

//       await classCollection.updateOne(
//         { _id: new ObjectId(classId) },
//         { $inc: { sales: 1 } }
//       );

//       res.status(201).send({ ...purchase, _id: result.insertedId });
//     });







//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {

//         // Ensures that the client will close when you finish/error
//         // await client.close();
//     }
// }
// run().catch(console.dir);





// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })

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
        const favoritesCollection = database.collection("favorites");
        const applicationCollection = database.collection("application");
        const usersCollection = database.collection("user");
        const purchasesCollection = database.collection("purchases");



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




        // app.patch('/api/comments/:id', async (req, res) => {

        //     const { id } = req.params;
        //     const commentData = req.body;

        //     const result = await commentCollection.updateOne(
        //         { _id: new ObjectId(id) },
        //         { $set: commentData });

        //     res.json(result);
        // })



        app.delete("/api/comments/:id", async (req, res) => {

            const { id } = req.params;
            const { userId } = req.body;

            const result = await commentCollection.deleteOne({
                _id: new ObjectId(id),
                userId: userId,
            });

            res.json(result);

        });




        // favorites apis



        app.get('/api/favorites', async (req, res) => {
            const { userId } = req.query;

            if (!userId) {
                return res.send({ success: false, message: "Missing userId" });
            }

            const result = await favoritesCollection.find({ userId: String(userId) }).toArray();
            res.send({ success: true, data: result });
        });





        app.post("/api/favorites", async (req, res) => {

            const favorite = req.body;

            const exists = await favoritesCollection.findOne({
                userId: favorite.userId,
                classId: favorite.classId,
            });

            if (exists) {
                return res.send({
                    success: false,
                    message: "Already added",
                });
            }

            const result = await favoritesCollection.insertOne(favorite);

            res.send({
                success: true,
                result,
            });
        });




        app.delete('/api/favorites', async (req, res) => {
            const { userId, classId } = req.body;

            if (!userId || !classId) {
                return res.status(400).send({ success: false, message: "userId and classId are required" });
            }

            const result = await favoritesCollection.deleteOne({
                userId: String(userId),
                classId: String(classId),
            });

            if (result.deletedCount === 0) {
                return res.status(404).send({ success: false, message: "Favorite not found" });
            }

            res.send({ success: true });
        });





        





        // application api


        app.post('/api/application', async (req, res) => {

            const newApplication = req.body;

            const result = await applicationCollection.insertOne(newApplication);

            res.send(result);
        });



        app.get('/api/application', async (req, res) => {

            const cursor = applicationCollection.find({});
            const result = await cursor.toArray();

            res.send(result);

        })



        app.get('/api/application/user/:userId', async (req, res) => {

            const { userId } = req.params;

            const result = await applicationCollection
                .find({ userId: String(userId) })
                .sort({ createdAt: -1 })
                .limit(1)
                .toArray();

            res.send(result[0] || null);
        });


        
         app.patch('/api/application/:id', async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;

            const allowedStatuses = ["ACTIVE", "APPROVED", "REJECTED", "BLOCKED"];

            const application = await applicationCollection.findOne({ _id: new ObjectId(id) });

            const result = await applicationCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status, statusUpdatedAt: new Date() } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).send({ message: "Application not found" });
            }

            if (application.userId && ObjectId.isValid(application.userId)) {
                if (status === "APPROVED") {
                    await usersCollection.updateOne(
                        { _id: new ObjectId(application.userId) },
                        { $set: { role: "trainer" } }
                    );
                } else if (status === "REJECTED") {
                    await usersCollection.updateOne(
                        { _id: new ObjectId(application.userId) },
                        { $set: { role: "member" } }
                    );
                }
            }

            res.send({ success: true, status });
        });





        //users api

        app.get('/api/user', async (req, res) => {

            const cursor = usersCollection.find({});
            const result = await cursor.toArray();

            res.send(result);
        })





        //

        // check if a buyer already purchased a given class
        app.get("/api/purchases/check", async (req, res) => {
            const { classId, email } = req.query;

            if (!classId || !email) {
                return res.send({ purchased: false });
            }

            const existing = await purchasesCollection.findOne({
                classId: String(classId),
                buyerEmail: String(email),
            });

            res.send({ purchased: !!existing });
        });



        //plan purchases related apis


        app.get("/api/purchases", async (req, res) => {
            const { email } = req.query;

            if (!email) {
                return res.send([]);
            }

            const result = await purchasesCollection
                .find({ buyerEmail: String(email) })
                .sort({ purchasedAt: -1 })
                .toArray();

            res.send(result);
        });







        app.post("/api/purchases", async (req, res) => {
            const { classId, buyerEmail, buyerName, stripeSessionId } = req.body;

            const existing = await purchasesCollection.findOne({ classId, buyerEmail });
            if (existing) return res.send(existing);

            

            const classes = await classCollection.findOne({ _id: new ObjectId(classId) });
            

            const purchase = {
                classId,
                classTitle: classes.title,
                price: classes.price,
                buyerEmail,
                buyerName: buyerName,
                trainerName:classes.trainerName,
                schedule: Array.isArray(classes.schedule) ? classes.schedule : [],
                stripeSessionId: stripeSessionId || null,
                purchasedAt: new Date(),
            };

            const result = await purchasesCollection.insertOne(purchase);

            await classCollection.updateOne(
                { _id: new ObjectId(classId) },
                { $inc: { sales: 1 } }
            );

            res.status(201).send({ ...purchase, _id: result.insertedId });
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