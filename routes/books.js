var express = require('express');
var router = express.Router();
const {mongodbUrl} = require('../data');
const { MongoClient } = require('mongodb');
const client = new MongoClient(mongodbUrl);
const genres = require("../data/genres");
const fetch = require('node-fetch');

const getBooks = async (list)=> {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db("flibusta");
    const books = db.collection("Books");
    const data = await books.find({bid:{$in: list}}).toArray();
    await client.close();
    return data;

  } catch (err) {
    console.log(err.stack);
  }
}

const getBooksByListId = async (id, page)=> {
  try {
    await client.connect();
    const db = client.db("flibusta");

    const libraries = db.collection("Libraries");
    const books = db.collection("Books");

    const lib = await libraries.findOne({_id: 1});
    const list = lib["list-"+id]

    let booksPage = await books.find({bid:{$in: list}}).toArray();
    await client.close();
    return booksPage;

  } catch (err) {
    console.log(err.stack);
  }
}

const getListById = async (id)=> {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db("flibusta");

    // Use the collection "libraries
    const libraries = db.collection("Libraries");

    const lib = await libraries.findOne({_id:1});

    await client.close();
    return lib["list-"+id];

  } catch (err) {
    console.log(err.stack);
  }
}

router.get("/file", async function (req, res) {
  const  fileName = "/srv/flibserver/read.html";
  res.sendFile(fileName)
})

router.get('/list/:id/page/:page', async function(req, res, next) {
  console.log(req.params);
  let books;
  if(req.params.page)  books = await getBooksByListId(req.params.id, req.params.page);
  else books = await getListById(req.params.id);
  res.send(books);
});

router.get('/list/:id', async function(req, res, next) {
  const list = await getListById(req.params.id);
  res.send(list);
});

router.get('/proxy', async function(req, res, next) {
  const {url}  = req.query;
  fetch(decodeURI(url)).then(response=> response.text()).then(text=> res.send(text))

});

router.post('/', async function(req, res, next) {
  const data = req.body;
  console.log("data", data);
  const list = await getBooks(data);
  res.send(list);
});


module.exports = router;
