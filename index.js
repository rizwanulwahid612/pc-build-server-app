const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
// const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d6f547g.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true, } });


async function run() {
    try {
        const pcBuilderCollection = client.db('pcbuilder2').collection('product');
        const userSelectCollection = client.db('pcbuilder2').collection('userselect');

        app.get('/alldata', async (req, res) => {
            const result = await pcBuilderCollection.find({}).toArray()
            res.send(result);
        })
        app.get('/alldata/:featureProduct', async (req, res) => {
            const featureProduct = req.params.featureProduct
            const query = { featureProduct: featureProduct }
            const result = await pcBuilderCollection.findOne(query)
            res.send(result);
        })
        app.get('/allProducts', async (req, res) => {
            try {
                const results = await pcBuilderCollection.find({}).toArray();

                // Extracting products array from each document
                const productsArray = results.map((doc) => doc.products).flat();

                res.send(productsArray);
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).send('Error fetching products');
            }
        });

        app.get('/allProducts/:productName', async (req, res) => {
            const productName = req.params.productName
            const query = { 'products.productName': productName }
            const result = await pcBuilderCollection.findOne(query)
            if (result) {
                const product = result.products.find(product => product.productName === productName);
                res.json(product);
            } else {
                res.status(404).json({ error: 'Product not found' });
            }

        })

        app.get('/getProductByName/:productName', async (req, res) => {
            const productName = req.params.productName;
            const result = await pcBuilderCollection.findOne({ 'products.productName': productName });
            if (result) {
                const product = result.products.find(product => product.productName === productName);
                res.json(product);
            } else {
                res.status(404).json({ error: 'Product not found' });
            }

        })
        //get project id
        app.get('/singledatabyid/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await pcBuilderCollection.findOne(query);
            res.send(result);
        })

        // app.get('/alldataproducts', async (req, res) => {
        //     const result = await pcBuilderCollection.find({}).toArray()

        //     const productNames = result.flatMap(item => item.products.map(product => product.productName));
        //     // const result = await pcBuilderCollection.find(query).toArray()
        //     res.send(productNames);
        // })


        app.post('/storeData', async (req, res) => {
            const dataToStore = req.body; // Assuming an array of data is sent in the request body 
            const result = await userSelectCollection.insertOne(dataToStore);
            res.status(201).json(result);

        });
        app.get('/getUserPostData', async (req, res) => {
            const result = await userSelectCollection.find({}).toArray()
            res.send(result);

        });



    }
    finally {

    }

}
run().catch(console.error);

app.listen(port, () => {
    console.log(`server is running on ${port}`)
})


// //post projectreview*************
// app.post('/projectreview', async (req, res) => {
//     const projectrev = req.body;
//     const result = await projectReview.insertOne(projectrev);
//     res.send(result);
// })


