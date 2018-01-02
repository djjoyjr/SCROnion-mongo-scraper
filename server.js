var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var exphbs = require("express-handlebars");


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

//Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/djmongoscraper_db";

console.log(process.env.MONGODB_URI);


// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Routes

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/saved", function (req, res) {
  res.sendFile(path.join(__dirname, "./public/saved.html"));
});

var count = 0;
// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("http://www.theonion.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h1 within an article tag, and do the following:
    $("article h1").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.excerpt = $(this)
        .parent()
        .next()
        .children("div")
        .children("p")
        .text();

      // Create a new Article using the `result` object built from scraping
      db.Article
        .create(result)
        .then(function (dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
        count = i+1;
    });
    console.log("Number of articles scraped: " + count);
    // res.redirect("/");
  });
});

// Route for getting all Articles from the db
app.get("/api/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article
    .find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/api/saved", function(req, res) {
  db.Article
  .find({ saved: true })
  .then(function (dbArticle) {
    res.json(dbArticle);
  })
  .catch(function (err) {
    res.json(err);
  });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/api/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
      console.log("this is the get on click of note button:  "  +dbArticle);

    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/api/saved/:id", function(req, res) {
  var newStatus = "";
  db.Article
  .findOne({_id: req.params.id})
  .then(function (dbArticle) {
    if (dbArticle.saved == true) {
      newStatus = false;
    }
    else {
      newStatus = true;
    };
  db.Article
    .update({"_id": req.params.id}, {$set: {saved:newStatus}})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
  });
});

// Route for saving/updating an Article's associated Note
app.post("/api/articles/:id", function(req, res) {
  console.log("req.params.id: " +req.params.id);
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id:req.params.id}, { $push: { note: dbNote._id } }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for deleting a Note
app.delete("/api/articles/:id", function(req, res) {
  console.log("The note I want to delete req.params.id: " +req.params.id);
  db.Note
  .remove ({ _id:req.params.id})
  .then(function(dbNote) {
    return db.Article.findOneAndUpdate({ _id:req.params.id}, { $push: { note: dbNote._id } }, { new: true });
  })
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });

});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
