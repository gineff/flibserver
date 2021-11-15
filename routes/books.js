var express = require('express');
var router = express.Router();
const {mongodbUrl} = require('../data');
const { MongoClient } = require('mongodb');
const client = new MongoClient(mongodbUrl);


const getBooks = async (id, page)=> {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db("flibusta");

    // Use the collection "libraries
    const libraries = db.collection("Libraries");

    // Use the collection "libraries"
    const books = db.collection("Books");

    // Find one document
    const lib = await libraries.findOne({_id:1});

    const list = lib["list-"+id]

    const listPage = list.slice((+page-1)*20, +page*20)

    const booksPage = await books.find({bid:{$in:listPage}}).toArray()

    await client.close();
    return booksPage;

  } catch (err) {
    console.log(err.stack);
  }


}

router.get('/list/:id/page/:page', async function(req, res, next) {
  console.log(req.params)
  res.send('respond with a resource '+JSON.stringify(await getBooks(req.params.id, req.params.page)));
});

module.exports = router;
