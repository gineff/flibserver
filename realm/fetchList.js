
const xmlParser = (text)=> {
  return context.functions.execute("xmlParserFlibusta", text);
}

const htmlParser = async (text)=> {
  const matches = Array.from(text.matchAll(/<a href="\/a\/(.*?)">(.*?)<\/a> - <a href="\/b\/(.*?)">(.*?)<\/a>/g));
  return  matches.map(el=>({
    bid:el[3],
    author:[{name:el[2], id: el[1]}],
    title:el[4],
    sequencesTitle: [],
  }))
};

const getText = async (url)=> {
  const response = await context.http.get({url});
  return response.body.text();
};

const searchBookByAuthor = async (book, searchPage = 1)=> {
  console.log("search in opds by author", searchPage, book.title);
  if(!book.author[0].id) return undefined;
  const text = await getText("http://flibusta.is/opds/author/" + book.author[0].id + "/time"+"/"+(searchPage-1));
  const data = xmlParser(text);
  const filteredData = data.filter(el => el.bid === book.bid)[0];
  if(data.length === 20 && filteredData === undefined){
    return await searchBookByAuthor(book, ++searchPage);
  }else{
    return filteredData;
  }
};

const checkAddToDb = async (books)=> {
  const collection = context.services.get("mongodb-atlas").db("flibusta").collection("Books");
  const idOfBooks =  books.map(el=>el.bid);
  const booksInDb = await collection.find({bid: {$in: idOfBooks}},{bid:1}).toArray();
  const booksIDInDb= booksInDb.map(el=>el.bid);
  const booksNotInDb = books.filter(el=> !booksIDInDb.includes(el.bid));
  console.log("books Not In Db", JSON.stringify(booksNotInDb.map(el=> el.title)))

  for(let book of booksNotInDb){
      const bookFromOPDS = await searchBookByAuthor(book);
      if(bookFromOPDS) collection.insertOne(bookFromOPDS)
  }

  return  idOfBooks;
}

const getList  = async function(listId) {
  listId = "w";
  const libraries = context.services.get("mongodb-atlas").db("flibusta").collection("Libraries");
  const text = await getText("http://flibusta.is/stat/"+listId);
  const list = await htmlParser(text);
  const booksId = await checkAddToDb(list);
  libraries.updateOne({_id:1},{$set:{["list-"+ listId]: booksId }})
};



exports = getList;