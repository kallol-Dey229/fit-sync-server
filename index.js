const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();


app.use(cors());
app.use(express.json());

const port = process.env.PORT;


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/', (req, res) => {
    res.send('Server is running........!')
})






const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
});

// async function run() {
//     try {

//         await client.connect();

client.connect(()=>{
    console.log('connected to mongo db')
}).catch(console.dir)


        const database = client.db("fit-sync");
        const classCollection = database.collection("classes");
        const forumPostCollection = database.collection("forum");
        const commentCollection = database.collection("comments");
        const favoritesCollection = database.collection("favorites");
        const applicationCollection = database.collection("application");
        const usersCollection = database.collection("user");
        const purchasesCollection = database.collection("purchases");
        const sessionCollection = database.collection('session');


         // verification related

        const verifyToken = async (req, res, next) => {

            const authHeader = req.headers?.authorization;
            if (!authHeader) {
                return res.status(401).send({ message: 'unauthorized access' })
            }

            const token = authHeader.split(' ')[1]

            if (!token) {
                return res.status(401).send({ message: 'unauthorized access' })
            }

            const query = { token: token }
            const session = await sessionCollection.findOne(query);

              if (!session) {
                return res.status(401).send({ message: 'unauthorized access' })
            }

            const userId = session.userId;


            const userQuery = {
                _id: userId
            }

            const user = await usersCollection.findOne(userQuery);
              if (!user) {
                return res.status(401).send({ message: 'unauthorized access' })
            }
            // set data in the req object
            req.user = user;
            next();
        }


        // must be used after verifyToken middleware
        const verifyMember = async (req, res, next) => {
            if (req.user?.role !== 'member') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }



        // must be used after verifyToken middleware
        const verifyTrainer = async (req, res, next) => {
            if (req.user?.role !== 'trainer') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

        

        // must be used after verifyToken middleware
        const verifyAdmin = async (req, res, next) => {
            if (req.user.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }





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


        app.get('/api/my/classes',verifyToken,verifyTrainer, async (req, res) => {

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


        app.post('/api/classes',verifyToken,verifyTrainer, async (req, res) => {

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




        app.post('/api/forum',verifyToken, async (req, res) => {

            const newPost = req.body;

            const author = await usersCollection.findOne({ _id: new ObjectId(newPost.userId) });

            if (author?.status === "BLOCKED") {
                return res.status(403).send({ message: "Your account is blocked from posting." });
            }

            const result = await forumPostCollection.insertOne(newPost);
            res.send(result);
        });


        app.delete('/api/forum/:id', verifyToken, verifyAdmin, async (req, res) => {

            const { id } = req.params;

            const result = await forumPostCollection.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount > 0) {
                await commentCollection.deleteMany({ forumPostId: id });
            }

            res.send(result);
        });


        //comments api


        app.get('/api/comments/:id', async (req, res) => {

            const { id } = req.params;

            const result = await commentCollection.find({ forumPostId: id }).toArray();
            res.json(result);
        });



        app.post('/api/comments',verifyToken, async (req, res) => {

            const commentData = req.body;

            const author = await usersCollection.findOne({ _id: new ObjectId(commentData.userId) });
            if (author?.status === "BLOCKED") {
                return res.status(403).send({ message: "Your account is blocked from posting." });
            }

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



        app.delete("/api/comments/:id", verifyToken, async (req, res) => {

            const { id } = req.params;
            const { userId } = req.body;

            const result = await commentCollection.deleteOne({
                _id: new ObjectId(id),
                userId: userId,
            });

            res.json(result);

        });




        // favorites apis



        app.get('/api/favorites',verifyToken, async (req, res) => {

            const { userId } = req.query;

            const result = await favoritesCollection.find({ userId: String(userId) }).toArray();
            res.send({ success: true, data: result });
        });





        app.post("/api/favorites",verifyToken, async (req, res) => {

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




        app.delete('/api/favorites',verifyToken, async (req, res) => {

            const { userId, classId } = req.body;

            const result = await favoritesCollection.deleteOne({
                userId: String(userId),
                classId: String(classId),
            });

            res.send({ success: true });
        });




        // application api


        app.post('/api/application',verifyToken,verifyMember, async (req, res) => {

            const newApplication = req.body;


            const application = {
                ...newApplication,
                status: 'ACTIVE',
                createdAt: new Date()
            }


            const result = await applicationCollection.insertOne(application);

            res.send({ ...application, _id: result.insertedId });



        });



        app.get('/api/application',verifyToken,verifyAdmin, async (req, res) => {

            const cursor = applicationCollection.find({});
            const result = await cursor.toArray();

            res.send(result);

        })



        app.get('/api/application/user/:userId',verifyToken, async (req, res) => {

            const { userId } = req.params;

            const result = await applicationCollection.find({ userId: String(userId) }).sort({createdAt: -1 }).limit(1).toArray();

            res.send(result[0] || null);
        });



        app.patch('/api/application/:id',verifyToken,verifyAdmin, async (req, res) => {

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

        app.get('/api/user', verifyToken,verifyAdmin, async (req, res) => {

            const cursor = usersCollection.find({});
            const result = await cursor.toArray();

            const withDefaults = result.map((u) => ({
                status: "ACTIVE",
                ...u,
            }));

            res.send(withDefaults);
        })



        app.patch('/api/user/:id/status', verifyToken,verifyAdmin, async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;

            const result = await usersCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status } }
            );

            res.send({ success: true, status });
        });



        // promote a user to admin, or demote an admin back to their previous role

        app.patch('/api/user/:id/role', verifyToken,verifyAdmin, async (req, res) => {

            const { id } = req.params;
            const { action } = req.body;

            const targetUser = await usersCollection.findOne({ _id: new ObjectId(id) });

            if (action === "promote") {

                await usersCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { role: "admin", previousRole: targetUser.role || "member" } }
                );

                return res.send({ success: true, role: "admin" });
            }

            if (action === "demote") {

                const restoredRole = targetUser.previousRole || "member";

                await usersCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { role: restoredRole }, $unset: { previousRole: "" } }
                );

                return res.send({ success: true, role: restoredRole });
            }

            if (action === "demote-trainer") {

                await usersCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { role: "member" } }
                );

                return res.send({ success: true, role: "member" });
            }
        });




        // trainers related api

        app.get('/api/trainers', async (req, res) => {

            const trainers = await usersCollection.find({ role: 'trainer' }).toArray();

            const result = await Promise.all(

                trainers.map(async (trainer) => {

                    const trainerId = String(trainer._id);

                    const applications = await applicationCollection.find({ userId: trainerId }).sort({ createdAt: -1 }).limit(1).toArray();

                    const application = applications[0] || null;

                    const classes = await classCollection.find({ trainerId }).project({ _id: 1 }).toArray();

                    const classIds = classes.map((c) => String(c._id));

                    let studentCount = 0;
                    if (classIds.length > 0) {
                        const distinctBuyers = await purchasesCollection.distinct('buyerEmail', {
                            classId: { $in: classIds },
                        });
                        studentCount = distinctBuyers.length;
                    }

                    return {
                        _id: trainer._id,
                        name: trainer.name,
                        email: trainer.email,
                        image: trainer.image,
                        status: trainer.status || 'ACTIVE',
                        specialty: application?.specialty || 'General',
                        students: studentCount,
                    };


                })
            );

            res.send(result);
        });



        //


        app.get("/api/purchases/check", verifyToken, async (req, res) => {
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


        app.get("/api/purchases", verifyToken, async (req, res) => {
            const { email } = req.query;

            if (!email) {
                return res.send([]);
            }

            const result = await purchasesCollection.find({ buyerEmail: String(email) }).sort({ purchasedAt: -1 }).toArray();

            res.send(result);
        });







        app.post("/api/purchases", verifyToken, async (req, res) => {

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
                trainerName: classes.trainerName,
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







        // await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {

//         // Ensures that the client will close when you finish/error
//         // await client.close();
//     }
// }
// run().catch(console.dir);



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


module.exports = app;

