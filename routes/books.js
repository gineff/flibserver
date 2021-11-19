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




    let query = {bid:{$in:list}};
    let booksPage;
    if(filter){
      const arr = [];
      genres.forEach((el)=> {
        el.data.forEach(e=> {if (filter.includes(e.id)) arr.push(e.title);} )
      })
      const data = await books.find({bid:{$in: list},genre:{$in: arr}}).toArray();
      const unsortedBooksPage = data.map(el=>({...el, i: list.indexOf(el.bid)}))
      booksPage = unsortedBooksPage.sort((a,b)=>a.i-b.i)?.slice((+page-1)*20, +page*20)
    }else{
      const listPage = list.slice((+page-1)*20, +page*20)
      const data = await books.find({bid:{$in: listPage}}).toArray()
      const unsortedBooksPage = data.map(el=>({...el, i: list.indexOf(el.bid)}))
      booksPage = unsortedBooksPage.sort((a,b)=>a.i-b.i)
      console.log(booksPage.map(el=> el.i))

    }
    console.log(booksPage.length);
    await client.close();
    return booksPage;

  } catch (err) {
    console.log(err.stack);
  }


}

router.get('/list/:id/page/:page', async function(req, res, next) {
  console.log(req.params);
  const filter = req.query?.filter? JSON.parse(req.query.filter) : false;
  res.send(await getBooks(req.params.id, req.params.page, filter));
});

module.exports = router;
