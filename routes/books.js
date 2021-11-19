var express = require('express');
var router = express.Router();
const {mongodbUrl} = require('../data');
const { MongoClient } = require('mongodb');
const client = new MongoClient(mongodbUrl);
const genres = require("../data/genres");

const getBooks = async (id, page, filter)=> {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db("flibusta");

    // Use the collection "libraries
    const libraries = db.collection("Libraries");

    // Use the collection "libraries"
    const books = db.collection("Books");

//    await books.deleteMany({lid: null})

    // Find one document
    const lib = await libraries.findOne({_id:1});

    const list = lib["list-"+id]

    let booksPage = books.find({bid:{$in: list}}).toArray();


    await client.close();
    return booksPage;

  } catch (err) {
    console.log(err.stack);
  }


}

router.get('/list/:id/page/:page', async function(req, res, next) {
  console.log(req.params);
  res.send(await getBooks(req.params.id, req.params.page));
});

module.exports = router;
