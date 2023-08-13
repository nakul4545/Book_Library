
// require npm install express nodemon and ejs
const Express = require("express")
const app = Express()
//npm install mysql2 for installing mysql2
const database = require("mysql2/promise")  //We require this module for having the connection and many more things
app.set("view engine" , "ejs")
app.use(Express.urlencoded())
//Connect our Express app with the mysql database
const connectionData = database.createPool({
    host:"localhost",   //Use host ass localhost if database is in ur system itself else use other
    user:"root",
    password:"Nakul@123",
    database:"books_database"
})

app.get("/" , function(req , res){
    res.render("home.ejs");
})

app.get('/create/books' , async function(req , res){
    const authorsData = await connectionData.query(" select * from authors_table");//This array has 2 elements
    const output = authorsData[0];
    // console.log(authorsData);
    res.render("bookForm.ejs" , {outKey : output});
})
app.post('/create/books' , async function(req , res){
    // console.log(req);
    // const myTitle = req.body.Title 
    // const myDesc = req.body.Descr
    const data = [req.body.Title , req.body.Descr , req.body.id]    // bookID bookTitle bookDescription aid

    //Save title and description in books_database into books_table
    // console.log(data);
    await connectionData.query("insert into books_table(bookTitle , bookDescription, aid) values (?)" , [data])
    // console.log(connectionData);
    res.redirect("/");
})
app.get("/create/author" ,function(req , res){
    res.render("authorForm.ejs");
})
//Here we have to give the author ID in books table as dropdown containing the authors name present in authors table 
// and then in respective authorID will get save in books_table
app.post("/create/author" ,async function(req , res){
    const data = [req.body.authorname , req.body.authoremail]
    connectionData.query("insert into authors_table(authorName , authorEmail) values(?) " , [data])
    res.redirect("/");
})

app.get("/display/books" , async function(req , res){
    const displayData = await connectionData.query("select * from books_table");
    // console.log(displayData);
    const OrgDisplaydata = displayData[0];
    const authorObj = {};
    for(let i of OrgDisplaydata){
        let id = i.aid;
        let authornames = await connectionData.query(`select authorName from authors_table where authorID = ?`, id);
        let authorNamesArray = authornames[0];
       for(j of authorNamesArray){
           authorObj["Author"+ id] = j.authorName
       }
    }
    // console.log(authorArray);
    res.render("displayBooks.ejs" , {data : OrgDisplaydata , authorName: authorObj});
})
//This is to get the details of specific book not all the books
app.get("/display/books/:id" , async function(req , res){   //: is for dynamic variables
    //Logic to show the details of specific book
    let ID = req.params.id;
    const particularBook = await connectionData.query("select * from books_table where bookID = ?" , [ID])
    const particularBookDetails = particularBook[0] //Because it conatins the details along with scehma structure arrya of 2 elements
    // console.log(particularBookDetails);

    // ---------------------------------------This only for how to give name of author instead of author ID
    const displayData = await connectionData.query("select * from books_table");
    // console.log(displayData);
    const OrgDisplaydata = displayData[0];
    const authorObj = {};
    for(let i of OrgDisplaydata){
        let id = i.aid;
        let authornames = await connectionData.query(`select authorName from authors_table where authorID = ?`, id);
        let authorNamesArray = authornames[0];
       for(j of authorNamesArray){
           authorObj["Author"+ id] = j.authorName
       }
    }
    res.render("particularBook.ejs" , { particularData : particularBookDetails , authorName: authorObj}  ) 
})
// /delete/books -->>Delete all the books /delete/books/1 --> delete only first book
app.get("/delete/books/:id" ,async function(req , res){
    let ID = req.params.id;
    let DeleteItem = await connectionData.query("delete from books_table where bookID = ?" ,[ID])
    res.render("deleteBook.ejs")
})
app.get("/delete/books" , async function(req , res){
    //Logic for deleting all the books
    await connectionData.query("delete from books_table");
    res.render("deleteAll.ejs");
})
//Updating books
app.get("/update/books/:id" ,async function(req , res){
    const ID = req.params.id;
    const bookData = await connectionData.query("select * from books_table where bookID = ?" , [ID]);
    const bookDataArray = bookData[0];
    // console.log(bookDataArray);
    res.render("updateForm.ejs" , { book : bookDataArray})
})
app.post("/update/books/:id" , async function(req , res){
    const data = [req.body.Title , req.body.Descr ]
    const ID = req.params.id;
    await connectionData.query("update books_table set bookTitle = ? , bookDescription = ? where bookID = ?" ,[data[0] ,data[1] ,ID]);
    res.redirect("/");
})
app.listen(3004)